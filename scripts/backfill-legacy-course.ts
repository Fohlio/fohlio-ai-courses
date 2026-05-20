import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { backfillLegacyCourse } from "../src/lib/legacyCourse";
import { ADMIN_GITHUB_NICKNAME } from "../src/lib/constants";
import { seedCourseSkills, seedBadges } from "../src/lib/skillSeeder";
import {
  GTM_SKILLS,
  GTM_LESSON_SKILLS,
  BADGES,
} from "./gamification-seeds";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findUnique({
    where: { githubNickname: ADMIN_GITHUB_NICKNAME },
    select: { id: true },
  });

  if (!admin) {
    console.warn(
      `Skipping legacy course backfill because admin user "${ADMIN_GITHUB_NICKNAME}" does not exist yet.`,
    );
    return;
  }

  await backfillLegacyCourse(prisma);

  await seedCourseSkills(prisma, {
    courseId: "course-fohlio-tech-course",
    skills: GTM_SKILLS,
    lessonSkills: GTM_LESSON_SKILLS,
  });
  await seedBadges(prisma, BADGES);

  console.log("Legacy course backfilled.");
  console.log(`Skills: ${GTM_SKILLS.length}, lesson links: ${GTM_LESSON_SKILLS.length}, badges: ${BADGES.length} (global catalog).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
