import "dotenv/config";
import { readFile } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Re-attaches pre-upgrade homework progress to the new 2+2 task set. Run this
// AFTER snapshot-submissions.ts and the three course re-seeds.
//
// Strategy: the old homework (5 tasks/lesson) and the new (4 tasks/lesson) have
// no faithful 1:1 mapping — the tasks were rewritten. So we preserve the
// *amount* of progress: if a student had N submitted tasks for a lesson, the
// first N new tasks of that lesson (required first, then advanced, by order)
// are marked submitted with a migration note. Idempotent; never clobbers a real
// post-upgrade submission.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const MIGRATION_NOTE =
  "Carried over from the homework as it was before the 2026-05 update. " +
  "The tasks for this lesson were rewritten — open the task and resubmit if " +
  "you want to complete the new version.";

type ProgressRecord = {
  userId: string;
  lessonId: string;
  courseId: string | null;
  count: number;
};

async function main() {
  const raw = await readFile(
    join(process.cwd(), ".context", "submissions-snapshot.json"),
    "utf-8",
  );
  const snapshot = JSON.parse(raw) as ProgressRecord[];

  const tasks = await prisma.homeworkTask.findMany({
    select: { id: true, lessonId: true, category: true, order: true },
  });
  const lessons = await prisma.lesson.findMany({
    select: { id: true, courseId: true },
  });
  const courseByLesson = new Map(lessons.map((l) => [l.id, l.courseId]));

  const byLesson = new Map<string, typeof tasks>();
  for (const task of tasks) {
    const arr = byLesson.get(task.lessonId) ?? [];
    arr.push(task);
    byLesson.set(task.lessonId, arr);
  }
  for (const arr of byLesson.values()) {
    arr.sort((a, b) => {
      if (a.category !== b.category) return a.category === "required" ? -1 : 1;
      return a.order - b.order;
    });
  }

  let ensured = 0;
  let skippedNoLesson = 0;
  for (const rec of snapshot) {
    const lessonTasks = byLesson.get(rec.lessonId);
    if (!lessonTasks || lessonTasks.length === 0) {
      skippedNoLesson += 1;
      continue;
    }
    const courseId = rec.courseId ?? courseByLesson.get(rec.lessonId) ?? null;
    const take = Math.min(rec.count, lessonTasks.length);
    for (let i = 0; i < take; i += 1) {
      const task = lessonTasks[i];
      await prisma.taskSubmission.upsert({
        where: { userId_taskId: { userId: rec.userId, taskId: task.id } },
        update: {},
        create: {
          userId: rec.userId,
          taskId: task.id,
          lessonId: rec.lessonId,
          courseId,
          status: "submitted",
          content: { type: "text", text: MIGRATION_NOTE },
        },
      });
      ensured += 1;
    }
  }

  console.log(
    `Remap done. Submissions ensured: ${ensured}. Snapshot lessons not found in new task set (skipped): ${skippedNoLesson}.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
