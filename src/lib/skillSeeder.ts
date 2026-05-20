/**
 * Helpers consumed by scripts/create-*-course.ts to idempotently seed the
 * skill taxonomy and lesson<->skill mappings introduced in the platform
 * gamification slice. Designed to be safe to re-run on every deploy.
 *
 * Usage pattern in a seed script:
 *
 *   const skills: SkillSeed[] = [
 *     { slug: "modules",            title: "Modules & DI",        order: 1 },
 *     { slug: "request-pipeline",   title: "Request pipeline",    order: 2 },
 *     // ...
 *   ];
 *
 *   const lessonSkills: LessonSkillSeed[] = [
 *     { lessonId: "nestjs-lesson-1", skillSlug: "modules" },
 *     { lessonId: "nestjs-lesson-3", skillSlug: "request-pipeline" },
 *     // ...
 *   ];
 *
 *   await seedCourseSkills(prisma, { courseId, skills, lessonSkills });
 *
 * The helper accepts a Prisma client directly so seed scripts that already
 * use the pg adapter do not need to import the shared prisma singleton.
 */

import type { PrismaClient, Prisma } from "../generated/prisma/client";

export interface SkillSeed {
  slug: string;
  title: string;
  description?: string;
  order?: number;
}

export interface LessonSkillSeed {
  lessonId: string;
  skillSlug: string;
  weight?: number;
}

export interface BadgeSeed {
  slug: string;
  title: string;
  description: string;
  iconKey: string;
  criteria: Prisma.InputJsonValue;
  courseId?: string | null;
}

export async function seedCourseSkills(
  prisma: PrismaClient,
  args: {
    courseId: string;
    skills: SkillSeed[];
    lessonSkills: LessonSkillSeed[];
  },
): Promise<void> {
  for (const skill of args.skills) {
    await prisma.skill.upsert({
      where: { courseId_slug: { courseId: args.courseId, slug: skill.slug } },
      create: {
        courseId: args.courseId,
        slug: skill.slug,
        title: skill.title,
        description: skill.description ?? null,
        order: skill.order ?? 0,
      },
      update: {
        title: skill.title,
        description: skill.description ?? null,
        order: skill.order ?? 0,
      },
    });
  }

  const slugToId = new Map<string, string>();
  const rows = await prisma.skill.findMany({
    where: { courseId: args.courseId },
    select: { id: true, slug: true },
  });
  for (const row of rows) slugToId.set(row.slug, row.id);

  for (const mapping of args.lessonSkills) {
    const skillId = slugToId.get(mapping.skillSlug);
    if (!skillId) {
      console.warn(
        `[seedCourseSkills] unknown skill slug "${mapping.skillSlug}" for lesson ${mapping.lessonId} — skipped`,
      );
      continue;
    }
    await prisma.lessonSkill.upsert({
      where: {
        lessonId_skillId: { lessonId: mapping.lessonId, skillId },
      },
      create: {
        lessonId: mapping.lessonId,
        skillId,
        weight: mapping.weight ?? 1,
      },
      update: {
        weight: mapping.weight ?? 1,
      },
    });
  }
}

export async function seedBadges(
  prisma: PrismaClient,
  badges: BadgeSeed[],
): Promise<void> {
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      create: {
        slug: badge.slug,
        title: badge.title,
        description: badge.description,
        iconKey: badge.iconKey,
        criteria: badge.criteria,
        courseId: badge.courseId ?? null,
      },
      update: {
        title: badge.title,
        description: badge.description,
        iconKey: badge.iconKey,
        criteria: badge.criteria,
        courseId: badge.courseId ?? null,
      },
    });
  }
}
