import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [courses, lessons, skills, badges, lessonSkills] = await Promise.all([
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.skill.count(),
    prisma.badge.count(),
    prisma.lessonSkill.count(),
  ]);

  const sample = await prisma.lesson.findMany({
    select: { id: true, slug: true, contentHtml: true },
    take: 30,
  });
  const withHero = sample.filter((l) =>
    l.contentHtml.includes("LESSON_HERO_INJECTED"),
  ).length;

  const skillsByCourse = await prisma.skill.groupBy({
    by: ["courseId"],
    _count: { _all: true },
  });

  console.log({
    courses,
    lessons,
    lessonsWithHero: `${withHero}/${sample.length}`,
    skills,
    lessonSkills,
    badges,
    skillsByCourse,
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
