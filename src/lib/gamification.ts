/**
 * Gamification service — MVP slice per
 *   skills/course-lesson-writer/references/gamification.md § 6–8.
 *
 * Hard rules baked into the design:
 *   1. XP only for real actions (lesson read, task submit, self-check pass).
 *   2. All XP writes are idempotent — resubmission cannot inflate score.
 *   3. No leaderboard surfaces here. Pseudo-leaderboards demotivate low-rank
 *      learners (Hanus & Fox 2015). Cohort comparison stays absent.
 *   4. Streak is opt-in and never gates content (Brilliant pattern).
 *   5. Badge taxonomy is intentionally small — meaningful, not collectible.
 *
 * Feedback hygiene (Kluger & DeNisi 1996) does not live here — that is a
 * lesson-writing concern. The platform never renders normative or
 * person-directed messages alongside XP/badge awards.
 */

import { Prisma } from "../generated/prisma/client";
import { prisma } from "./prisma";

export const XP_AWARDS = {
  lessonRead: 5,
  taskSubmittedRequired: 25,
  taskSubmittedAdvanced: 30,
  taskSelfChecked: 10,
  badgeAwarded: 50,
} as const;

const MASTERY_DELTA_PER_REP = 0.18;
const MASTERY_MAX = 1;

type TxLike = Prisma.TransactionClient | typeof prisma;

interface AwardXpInput {
  userId: string;
  courseId?: string | null;
  lessonId?: string | null;
  source:
    | "lesson_read"
    | "task_submitted"
    | "task_self_checked"
    | "badge_awarded"
    | "streak_milestone";
  sourceRef: string;
  amount: number;
  idempotencyKey: string;
  tx?: TxLike;
}

/**
 * Append-only XP write. Idempotent on idempotencyKey — calling twice with the
 * same key is a no-op. Returns the awarded amount (0 if duplicate).
 */
export async function awardXp(input: AwardXpInput): Promise<number> {
  const client = input.tx ?? prisma;

  try {
    await client.xpEvent.create({
      data: {
        userId: input.userId,
        courseId: input.courseId ?? null,
        lessonId: input.lessonId ?? null,
        source: input.source,
        sourceRef: input.sourceRef,
        amount: input.amount,
        idempotencyKey: input.idempotencyKey,
      },
    });
    return input.amount;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Duplicate idempotency key — already awarded.
      return 0;
    }
    throw error;
  }
}

/**
 * Bump mastery for every skill linked to a lesson. Mastery is a 0..1 scale
 * that grows on each rep with diminishing returns. There is no decay in the
 * MVP — that needs the spaced-review queue, which is a later slice.
 */
export async function bumpLessonSkillMastery(args: {
  userId: string;
  lessonId: string;
  tx?: TxLike;
}): Promise<void> {
  const client = args.tx ?? prisma;

  const links = await client.lessonSkill.findMany({
    where: { lessonId: args.lessonId },
    select: { skillId: true, weight: true },
  });

  if (links.length === 0) return;

  await Promise.all(
    links.map(async (link) => {
      const existing = await client.userSkillState.findUnique({
        where: {
          userId_skillId: { userId: args.userId, skillId: link.skillId },
        },
      });

      const reps = (existing?.reps ?? 0) + 1;
      const delta = MASTERY_DELTA_PER_REP * Math.max(1, link.weight);
      const masteryBefore = existing?.mastery ?? 0;
      const masteryAfter = Math.min(
        MASTERY_MAX,
        masteryBefore + delta * (1 - masteryBefore),
      );

      await client.userSkillState.upsert({
        where: {
          userId_skillId: { userId: args.userId, skillId: link.skillId },
        },
        create: {
          userId: args.userId,
          skillId: link.skillId,
          reps,
          mastery: masteryAfter,
          lastPracticed: new Date(),
        },
        update: {
          reps,
          mastery: masteryAfter,
          lastPracticed: new Date(),
        },
      });
    }),
  );
}

/**
 * Opt-in streak bump. Increments the streak if the user already had activity
 * today (no-op) or yesterday; resets to 1 otherwise. Returns the new streak
 * length so the caller can decide whether a milestone fired.
 */
export async function touchStreak(args: {
  userId: string;
  tx?: TxLike;
}): Promise<{ currentDays: number; milestone: number | null }> {
  const client = args.tx ?? prisma;

  const today = startOfUtcDay(new Date());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const existing = await client.userStreak.findUnique({
    where: { userId: args.userId },
  });

  if (!existing || !existing.optedIn) {
    return { currentDays: existing?.currentDays ?? 0, milestone: null };
  }

  const lastActive = existing.lastActiveDate
    ? startOfUtcDay(existing.lastActiveDate)
    : null;

  let nextDays = existing.currentDays;
  if (!lastActive) {
    nextDays = 1;
  } else if (lastActive.getTime() === today.getTime()) {
    // Already counted today.
    return { currentDays: existing.currentDays, milestone: null };
  } else if (lastActive.getTime() === yesterday.getTime()) {
    nextDays = existing.currentDays + 1;
  } else {
    nextDays = 1;
  }

  const longest = Math.max(existing.longestDays, nextDays);
  const milestone = STREAK_MILESTONES.includes(nextDays) ? nextDays : null;

  await client.userStreak.update({
    where: { userId: args.userId },
    data: {
      currentDays: nextDays,
      longestDays: longest,
      lastActiveDate: today,
    },
  });

  return { currentDays: nextDays, milestone };
}

const STREAK_MILESTONES: number[] = [3, 7, 14, 30, 60, 100];

function startOfUtcDay(d: Date): Date {
  const copy = new Date(d);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

/**
 * Submission XP — the main hook. Called from the submissions PUT route.
 * Awards XP and bumps mastery in a single transaction. The idempotency key
 * is derived from (userId, taskId) so repeated PUTs are no-ops on XP but
 * the submission content itself can still be updated.
 */
export async function recordSubmissionAward(args: {
  userId: string;
  taskId: string;
  lessonId: string;
  courseId: string;
  taskCategory: "required" | "advanced";
}): Promise<{ xpAwarded: number; streakDays: number; milestone: number | null }> {
  const amount =
    args.taskCategory === "required"
      ? XP_AWARDS.taskSubmittedRequired
      : XP_AWARDS.taskSubmittedAdvanced;

  const idempotencyKey = `task-submit:${args.userId}:${args.taskId}`;

  const result = await prisma.$transaction(async (tx) => {
    const xp = await awardXp({
      userId: args.userId,
      courseId: args.courseId,
      lessonId: args.lessonId,
      source: "task_submitted",
      sourceRef: `task:${args.taskId}`,
      amount,
      idempotencyKey,
      tx,
    });

    if (xp > 0) {
      await bumpLessonSkillMastery({
        userId: args.userId,
        lessonId: args.lessonId,
        tx,
      });
    }

    const streak = await touchStreak({ userId: args.userId, tx });

    return {
      xpAwarded: xp,
      streakDays: streak.currentDays,
      milestone: streak.milestone,
    };
  });

  return result;
}

export interface UserXpSummary {
  totalXp: number;
  thisWeekXp: number;
  byCourse: Array<{ courseId: string; courseSlug: string; total: number }>;
}

export async function getUserXpSummary(userId: string): Promise<UserXpSummary> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, weekly, perCourse] = await Promise.all([
    prisma.xpEvent.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.xpEvent.aggregate({
      where: { userId, createdAt: { gte: since } },
      _sum: { amount: true },
    }),
    prisma.xpEvent.groupBy({
      by: ["courseId"],
      where: { userId, courseId: { not: null } },
      _sum: { amount: true },
    }),
  ]);

  const courseIds = perCourse
    .map((row) => row.courseId)
    .filter((id): id is string => id !== null);
  const courses = courseIds.length
    ? await prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: { id: true, slug: true },
      })
    : [];
  const slugById = new Map(courses.map((c) => [c.id, c.slug]));

  return {
    totalXp: total._sum.amount ?? 0,
    thisWeekXp: weekly._sum.amount ?? 0,
    byCourse: perCourse
      .filter((row) => row.courseId !== null)
      .map((row) => ({
        courseId: row.courseId as string,
        courseSlug: slugById.get(row.courseId as string) ?? "unknown",
        total: row._sum.amount ?? 0,
      })),
  };
}
