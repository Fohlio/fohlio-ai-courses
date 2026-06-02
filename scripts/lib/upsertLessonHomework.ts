/**
 * Shared seed helper — stable HomeworkTask upsert (Edinburgh).
 *
 * ## CRITICAL SAFETY: submissions never orphan on re-seed
 * TaskSubmission.taskId is a PLAIN STRING — there is NO foreign key from
 * TaskSubmission to HomeworkTask (the only relation TaskSubmission has is to
 * User). A submission is bound to its task purely by `taskId === HomeworkTask.id`.
 *
 * The old `deleteMany + create` seed pattern (see create-mikroorm-course.ts,
 * line ~323) wipes every task for a lesson and re-creates them, minting a
 * FRESH cuid() each time. After such a re-seed, every existing TaskSubmission
 * points at a HomeworkTask.id that no longer exists → progress reads as 0%,
 * graded work is silently detached.
 *
 * This helper makes re-seeds STABLE: it UPSERTs on the pre-existing compound
 * unique @@unique([lessonId, category, order]). Because the natural key already
 * matches the row in the DB, Prisma issues INSERT ... ON CONFLICT DO UPDATE and
 * the existing HomeworkTask.id is PRESERVED. Any (lessonId, category, order)
 * slot that already exists keeps its id, so every TaskSubmission stays attached.
 *
 * ## APPEND-ONLY RULE
 * Never change a task's `category` or `order` between seed versions — only
 * append new slots. The UPDATE branch below intentionally NEVER writes
 * category/order: that pair IS the natural key, and rebinding it would silently
 * point a graded submission at different homework. Reorder = re-create = orphan.
 *
 * ## PRUNE
 * After upserting every intended slot we prune ONLY the rows whose primary key
 * is not in the just-upserted set (or all rows for the lesson when tasks is
 * empty). We never run a blanket deleteMany before the upsert — that is exactly
 * the footgun this helper exists to remove.
 */

import { Prisma } from "../../src/generated/prisma/client";

/**
 * Full Edinburgh HomeworkTask shape.
 *
 * Edinburgh seeds define explicit `category` + `order` per task — this spec
 * KEEPS them as-is (it does NOT auto-derive order). The caller is responsible
 * for assigning a deterministic, append-only (category, order) to every task.
 */
export interface TaskSpec {
  title: string;
  description: string;
  category: "required" | "advanced";
  /** Position within its category. Deterministic + append-only per re-seed. */
  order: number;
  submissionType: "pr_link" | "screenshot" | "text" | "quiz" | "checklist" | "widget";
  quizQuestions?: Record<string, unknown> | unknown[] | null;
  checklistItems?: Record<string, unknown> | unknown[] | null;
  widgetId?: string | null;
  widgetConfig?: Record<string, unknown> | null;
  modelAnswer?: string | null;
  estimatedMinutes?: number | null;
}

/** Normalize an optional JSON spec field to a Prisma-acceptable JSON value. */
function toJson(
  value: Record<string, unknown> | unknown[] | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value == null) return Prisma.JsonNull;
  // Deep-clone through JSON to strip any non-serializable cruft and satisfy
  // Prisma's InputJsonValue type without unsafe casts of the original ref.
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

/**
 * Upsert all intended homework tasks for a lesson by their natural key, then
 * prune stale slots. Preserves existing HomeworkTask.id for any
 * (lessonId, category, order) already in the DB, so existing TaskSubmission
 * rows stay attached.
 *
 * @param tx       - Prisma transaction client
 * @param lessonId - The lesson's id
 * @param tasks    - Intended task specs with explicit, append-only category+order
 */
export async function upsertLessonHomework(
  tx: Prisma.TransactionClient,
  lessonId: string,
  tasks: TaskSpec[],
): Promise<void> {
  // 1. Upsert each intended slot on (lessonId, category, order).
  //    The HomeworkTask.id stays stable: an existing row is matched by the
  //    natural key and UPDATEd in place; only a genuinely new slot gets a
  //    fresh cuid() (we never set id, so the @default(cuid()) applies on CREATE).
  const keptIds: string[] = [];

  for (const task of tasks) {
    const row = await tx.homeworkTask.upsert({
      where: {
        lessonId_category_order: {
          lessonId,
          category: task.category,
          order: task.order,
        },
      },
      create: {
        // Do NOT set id — let an existing row match by natural key, or let
        // @default(cuid()) mint a new id for a genuinely new slot.
        lessonId,
        title: task.title,
        description: task.description,
        category: task.category,
        order: task.order,
        submissionType: task.submissionType,
        quizQuestions: toJson(task.quizQuestions),
        checklistItems: toJson(task.checklistItems),
        widgetId: task.widgetId ?? null,
        widgetConfig: toJson(task.widgetConfig),
        modelAnswer: task.modelAnswer ?? null,
        estimatedMinutes: task.estimatedMinutes ?? null,
      },
      update: {
        // Presentation / config fields ONLY. NEVER category or order — that
        // pair is the append-only natural key (see APPEND-ONLY RULE above).
        title: task.title,
        description: task.description,
        submissionType: task.submissionType,
        quizQuestions: toJson(task.quizQuestions),
        checklistItems: toJson(task.checklistItems),
        widgetId: task.widgetId ?? null,
        widgetConfig: toJson(task.widgetConfig),
        modelAnswer: task.modelAnswer ?? null,
        estimatedMinutes: task.estimatedMinutes ?? null,
      },
      select: { id: true },
    });
    keptIds.push(row.id);
  }

  // 2. Prune stale slots. No blanket deleteMany before upsert — that would
  //    orphan submissions for tasks that are merely being re-created.
  if (tasks.length === 0) {
    // No intended tasks → remove everything for this lesson.
    await tx.homeworkTask.deleteMany({ where: { lessonId } });
    return;
  }

  // Delete only rows whose primary key is NOT in the just-upserted set. Using
  // id-notIn (rather than NOT on category/order tuples) keeps the prune exact
  // and unambiguous.
  await tx.homeworkTask.deleteMany({
    where: {
      lessonId,
      id: { notIn: keptIds },
    },
  });
}
