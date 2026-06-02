/**
 * One-time idempotent repair script — re-links orphaned TaskSubmission rows
 * to current HomeworkTask IDs.
 *
 * ## Why this exists
 * Course seed scripts run `homeworkTask.deleteMany + create`, minting fresh
 * cuid() IDs on every re-seed. `TaskSubmission.taskId` is a plain String with
 * NO FK to HomeworkTask, so old submissions survive but reference stale IDs.
 * Progress queries count only submissions whose taskId is a current task id →
 * orphaned submissions stop counting → a student's progress silently drops.
 *
 * ## Algorithm
 * For each orphaned TaskSubmission (taskId not in the set of current
 * homeworkTask.id):
 *   1. Read submission.content.widgetId (persisted by the widget homework UI:
 *      content shape { type:"widget", widgetId, state, completed }).
 *   2. Find current HomeworkTask rows in the SAME submission.lessonId whose
 *      widgetId matches.
 *      - Exactly ONE match  -> targetTaskId (high-confidence relink).
 *      - 0 or >=2 matches (or no widgetId) -> SKIP + skippedAmbiguous++.
 *        Never guess.
 *   3. Collision handling (TaskSubmission @@unique([userId, taskId])):
 *      - If (userId, targetTaskId) already exists (in DB or planned this run),
 *        the orphan is a stale duplicate (the user re-submitted after a
 *        re-seed). DELETE the orphan — the surviving row IS the current answer,
 *        so no data is lost.
 *      - Otherwise -> UPDATE orphan.taskId = targetTaskId.
 *
 * ## Safety
 * - Dry-run is the DEFAULT. Pass `--apply` to write.
 * - Batch writes <=500 rows per $transaction with SET lock_timeout='5s'.
 * - Idempotent: a second run (with or without --apply) finds 0 orphans.
 * - PII-safe: logs ONLY aggregate counts + truncated id prefixes. NEVER prints
 *   raw userId, githubNickname, or submission content. DB connection strings are
 *   scrubbed from any surfaced error message.
 *
 * ## Usage
 *   npx tsx scripts/repair-orphaned-submissions.ts          # dry-run (default)
 *   npx tsx scripts/repair-orphaned-submissions.ts --apply  # write
 */

import type { PrismaClient } from "../src/generated/prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RepairCounts {
  orphansFound: number;
  relinked: number;
  dedupedDeleted: number;
  skippedAmbiguous: number;
  affectedUsers: number;
}

interface SubmissionContent {
  type?: string;
  widgetId?: string;
  state?: unknown;
  completed?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Truncate an id to its first 8 chars — safe for logs (not PII). */
export function truncId(id: string): string {
  return id.slice(0, 8) + "…";
}

/** Strip any Postgres connection string from a message before logging. */
function scrubDbUrl(msg: string): string {
  return msg.replace(/postgres(?:ql)?:\/\/[^\s"']*/gi, "[DB_URL]");
}

/** Safely parse submission content JSON. Returns null on failure. */
function parseContent(content: unknown): SubmissionContent | null {
  try {
    if (typeof content === "object" && content !== null) {
      return content as SubmissionContent;
    }
    if (typeof content === "string") {
      return JSON.parse(content) as SubmissionContent;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Core repair function — exported for reuse/testing
// ---------------------------------------------------------------------------

export const BATCH_SIZE = 500;

/**
 * Run the orphan-repair logic against the given Prisma client.
 *
 * @param prisma - Prisma client instance (real DB or a test DB).
 * @param apply  - If false (default), dry-run: the plan is computed and
 *                 returned but no writes happen.
 * @param log    - Logging callback (defaults to console.log).
 *
 * @returns RepairCounts reflecting what was (or would be) done.
 */
export async function runRepair(
  prisma: PrismaClient,
  apply: boolean = false,
  log: (msg: string) => void = console.log,
): Promise<RepairCounts> {
  log(`Mode: ${apply ? "--apply (WRITE)" : "dry-run (read-only)"}`);

  // -------------------------------------------------------------------
  // Step 1: Find all orphaned submissions.
  // -------------------------------------------------------------------
  const allCurrentTasks = await prisma.homeworkTask.findMany({
    select: { id: true },
  });
  const currentTaskIdSet = new Set(allCurrentTasks.map((t) => t.id));

  const allSubmissions = await prisma.taskSubmission.findMany({
    select: {
      id: true,
      userId: true,
      taskId: true,
      lessonId: true,
      content: true,
    },
  });

  const orphans = allSubmissions.filter((s) => !currentTaskIdSet.has(s.taskId));

  log(`Submissions scanned: ${allSubmissions.length}`);
  log(`Orphans found: ${orphans.length}`);

  if (orphans.length === 0) {
    const counts: RepairCounts = {
      orphansFound: 0,
      relinked: 0,
      dedupedDeleted: 0,
      skippedAmbiguous: 0,
      affectedUsers: 0,
    };
    log("Nothing to repair.");
    return counts;
  }

  // -------------------------------------------------------------------
  // Step 2: Load current tasks for the lessons of orphaned submissions.
  // -------------------------------------------------------------------
  const orphanedLessonIds = [...new Set(orphans.map((o) => o.lessonId))];
  const currentTasksForLessons = await prisma.homeworkTask.findMany({
    where: { lessonId: { in: orphanedLessonIds } },
    select: { id: true, lessonId: true, widgetId: true },
  });

  const tasksByLesson = new Map<
    string,
    Array<{ id: string; widgetId: string | null }>
  >();
  for (const task of currentTasksForLessons) {
    const arr = tasksByLesson.get(task.lessonId) ?? [];
    arr.push({ id: task.id, widgetId: task.widgetId });
    tasksByLesson.set(task.lessonId, arr);
  }

  // -------------------------------------------------------------------
  // Step 3: Classify each orphan.
  // -------------------------------------------------------------------
  const relinkActions: Array<{ submissionId: string; targetTaskId: string }> =
    [];
  const dedupDeleteIds: string[] = [];
  let skippedAmbiguous = 0;

  // (userId, taskId) pairs that already exist in the DB against a CURRENT task.
  const existingUserTaskPairs = new Set<string>(
    allSubmissions
      .filter((s) => currentTaskIdSet.has(s.taskId))
      .map((s) => `${s.userId}::${s.taskId}`),
  );

  // Pairs we already plan to relink this run (detect intra-run collisions).
  const relinkIntended = new Set<string>();

  for (const orphan of orphans) {
    const content = parseContent(orphan.content);
    const widgetId = content?.widgetId;

    if (!widgetId) {
      log(`  skip [no-widgetId] sub=${truncId(orphan.id)}`);
      skippedAmbiguous++;
      continue;
    }

    const lessonTasks = tasksByLesson.get(orphan.lessonId) ?? [];
    const matchingTasks = lessonTasks.filter((t) => t.widgetId === widgetId);

    if (matchingTasks.length !== 1) {
      log(
        `  skip [ambiguous-${matchingTasks.length}] sub=${truncId(orphan.id)} lesson=${truncId(orphan.lessonId)}`,
      );
      skippedAmbiguous++;
      continue;
    }

    const targetTaskId = matchingTasks[0].id;
    const collisionKey = `${orphan.userId}::${targetTaskId}`;

    if (
      existingUserTaskPairs.has(collisionKey) ||
      relinkIntended.has(collisionKey)
    ) {
      // Stale duplicate: a current submission for this (user, task) already
      // exists. Relinking would violate @@unique([userId, taskId]) and would
      // overwrite the user's actual current answer. Delete the orphan instead —
      // the surviving row is the answer, so nothing is lost.
      dedupDeleteIds.push(orphan.id);
    } else {
      relinkActions.push({ submissionId: orphan.id, targetTaskId });
      relinkIntended.add(collisionKey);
    }
  }

  // -------------------------------------------------------------------
  // Step 4: Build counts summary.
  // -------------------------------------------------------------------
  const affectedUserIds = new Set<string>(orphans.map((o) => o.userId));

  const counts: RepairCounts = {
    orphansFound: orphans.length,
    relinked: relinkActions.length,
    dedupedDeleted: dedupDeleteIds.length,
    skippedAmbiguous,
    affectedUsers: affectedUserIds.size,
  };

  log(`\nRepair plan: ${JSON.stringify(counts)}`);

  if (!apply) {
    log("Dry-run complete — pass --apply to write changes.");
    return counts;
  }

  // -------------------------------------------------------------------
  // Step 5: Apply in batches with lock_timeout.
  // -------------------------------------------------------------------
  let totalRelinked = 0;
  for (let i = 0; i < relinkActions.length; i += BATCH_SIZE) {
    const batch = relinkActions.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SET lock_timeout = '5s'`;
        for (const action of batch) {
          await tx.taskSubmission.update({
            where: { id: action.submissionId },
            data: { taskId: action.targetTaskId },
          });
        }
      },
      { timeout: 30_000 },
    );
    totalRelinked += batch.length;
    log(`  Relinked ${totalRelinked}/${relinkActions.length}`);
  }

  let totalDeleted = 0;
  for (let i = 0; i < dedupDeleteIds.length; i += BATCH_SIZE) {
    const batch = dedupDeleteIds.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SET lock_timeout = '5s'`;
        await tx.taskSubmission.deleteMany({ where: { id: { in: batch } } });
      },
      { timeout: 30_000 },
    );
    totalDeleted += batch.length;
    log(`  Deleted duplicates ${totalDeleted}/${dedupDeleteIds.length}`);
  }

  const appliedCounts: RepairCounts = {
    ...counts,
    relinked: totalRelinked,
    dedupedDeleted: totalDeleted,
  };
  log(`\nApplied: ${JSON.stringify(appliedCounts)}`);
  return appliedCounts;
}

// ---------------------------------------------------------------------------
// CLI entrypoint — only runs when executed directly (not when imported).
// ---------------------------------------------------------------------------

if (import.meta.url === `file://${process.argv[1]}`) {
  void (async () => {
    await import("dotenv/config");
    const { PrismaClient } = await import("../src/generated/prisma/client");
    const { PrismaPg } = await import("@prisma/adapter-pg");

    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    const prisma = new PrismaClient({ adapter });

    const apply = process.argv.includes("--apply");

    console.log("\n=== repair-orphaned-submissions ===");

    try {
      await runRepair(prisma, apply);
      if (apply) {
        console.log(
          "\nRe-run without --apply to verify idempotency (should show 0 orphans).",
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Repair failed:", scrubDbUrl(msg));
      process.exitCode = 1;
    } finally {
      await prisma.$disconnect();
    }
  })();
}
