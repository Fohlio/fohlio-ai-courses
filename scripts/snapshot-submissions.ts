import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Snapshots how much homework progress each student had per lesson BEFORE the
// 2026-05 homework re-seed wipes the old HomeworkTask rows. Run this first.
// Output: .context/submissions-snapshot.json — consumed by remap-submissions.ts.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type ProgressRecord = {
  userId: string;
  lessonId: string;
  courseId: string | null;
  count: number;
};

async function main() {
  const submissions = await prisma.taskSubmission.findMany({
    where: { status: "submitted" },
    select: { userId: true, lessonId: true, courseId: true },
  });

  const counts = new Map<string, ProgressRecord>();
  for (const sub of submissions) {
    const key = `${sub.userId}::${sub.lessonId}`;
    const entry =
      counts.get(key) ??
      ({ userId: sub.userId, lessonId: sub.lessonId, courseId: sub.courseId, count: 0 } as ProgressRecord);
    entry.count += 1;
    if (!entry.courseId && sub.courseId) entry.courseId = sub.courseId;
    counts.set(key, entry);
  }

  const snapshot = [...counts.values()];
  const dir = join(process.cwd(), ".context");
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, "submissions-snapshot.json"),
    JSON.stringify(snapshot, null, 2),
  );

  console.log(
    `Snapshot written: ${snapshot.length} user-lesson progress records from ${submissions.length} submitted submissions.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
