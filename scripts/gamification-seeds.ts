/**
 * Skill taxonomy + lesson<->skill mapping + badge catalog for every course.
 * Re-import from each scripts/create-*-course.ts (or backfill) seed.
 *
 * Constraints — same as src/lib/gamification.ts:
 *   - One taxonomy per course (slug-scoped); 6–10 skills max.
 *   - Badges are real milestones, not "first click" pointsification.
 *   - Total badges ≤ 30 globally so each one still means something.
 */

import type {
  SkillSeed,
  LessonSkillSeed,
  BadgeSeed,
} from "../src/lib/skillSeeder";

// ───── NestJS ────────────────────────────────────────────────────────────────

export const NESTJS_SKILLS: SkillSeed[] = [
  { slug: "modules-and-di",         title: "Modules & dependency injection",  order: 1 },
  { slug: "request-pipeline",       title: "Request pipeline",                 order: 2 },
  { slug: "data-layer",             title: "Data layer & persistence",         order: 3 },
  { slug: "auth-security",          title: "Auth & security",                  order: 4 },
  { slug: "validation-and-dtos",    title: "Validation & DTOs",                order: 5 },
  { slug: "apis-at-scale",          title: "APIs at scale",                    order: 6 },
  { slug: "async-and-microservices",title: "Async work & microservices",       order: 7 },
  { slug: "production-readiness",   title: "Production readiness",             order: 8 },
  { slug: "fohlio-architecture",    title: "Fohlio architecture (capstone)",   order: 9 },
];

export const NESTJS_LESSON_SKILLS: LessonSkillSeed[] = [
  { lessonId: "nestjs-lesson-1",  skillSlug: "modules-and-di" },
  { lessonId: "nestjs-lesson-2",  skillSlug: "modules-and-di",          weight: 2 },
  { lessonId: "nestjs-lesson-3",  skillSlug: "request-pipeline",        weight: 2 },
  { lessonId: "nestjs-lesson-4",  skillSlug: "data-layer",              weight: 2 },
  { lessonId: "nestjs-lesson-5",  skillSlug: "auth-security",           weight: 2 },
  { lessonId: "nestjs-lesson-6",  skillSlug: "validation-and-dtos",     weight: 2 },
  { lessonId: "nestjs-lesson-7",  skillSlug: "apis-at-scale",           weight: 2 },
  { lessonId: "nestjs-lesson-8",  skillSlug: "async-and-microservices" },
  { lessonId: "nestjs-lesson-9",  skillSlug: "async-and-microservices", weight: 2 },
  { lessonId: "nestjs-lesson-10", skillSlug: "production-readiness",    weight: 2 },
  { lessonId: "nestjs-lesson-11", skillSlug: "fohlio-architecture" },
  { lessonId: "nestjs-lesson-12", skillSlug: "fohlio-architecture",     weight: 2 },
];

// ───── MikroORM ──────────────────────────────────────────────────────────────

export const MIKROORM_SKILLS: SkillSeed[] = [
  { slug: "orm-fundamentals",   title: "ORM fundamentals",          order: 1 },
  { slug: "entity-manager",     title: "EntityManager & identity",  order: 2 },
  { slug: "relations-loading",  title: "Relations & loading",       order: 3 },
  { slug: "query-builder",      title: "Query builder",             order: 4 },
  { slug: "migrations",         title: "Migrations",                order: 5 },
  { slug: "advanced-orm",       title: "Advanced ORM features",     order: 6 },
  { slug: "nestjs-integration", title: "NestJS integration",        order: 7 },
  { slug: "production-orm",     title: "Production ORM",            order: 8 },
];

export const MIKROORM_LESSON_SKILLS: LessonSkillSeed[] = [
  { lessonId: "mikroorm-lesson-1",  skillSlug: "orm-fundamentals" },
  { lessonId: "mikroorm-lesson-2",  skillSlug: "orm-fundamentals",   weight: 2 },
  { lessonId: "mikroorm-lesson-3",  skillSlug: "entity-manager",     weight: 2 },
  { lessonId: "mikroorm-lesson-4",  skillSlug: "relations-loading",  weight: 2 },
  { lessonId: "mikroorm-lesson-5",  skillSlug: "relations-loading",  weight: 2 },
  { lessonId: "mikroorm-lesson-6",  skillSlug: "query-builder",      weight: 2 },
  { lessonId: "mikroorm-lesson-7",  skillSlug: "migrations",         weight: 2 },
  { lessonId: "mikroorm-lesson-8",  skillSlug: "advanced-orm",       weight: 2 },
  { lessonId: "mikroorm-lesson-9",  skillSlug: "nestjs-integration", weight: 2 },
  { lessonId: "mikroorm-lesson-10", skillSlug: "production-orm",     weight: 2 },
];

// ───── Legacy GTM (Fohlio Tech Course) ───────────────────────────────────────

export const GTM_SKILLS: SkillSeed[] = [
  { slug: "git-basics",            title: "Git basics for non-devs",      order: 1 },
  { slug: "system-architecture",   title: "How a SaaS app is built",       order: 2 },
  { slug: "frontend-fundamentals", title: "Frontend fundamentals",         order: 3 },
  { slug: "ai-fundamentals",       title: "AI fundamentals",               order: 4 },
  { slug: "mcp-in-practice",       title: "MCP in practice",               order: 5 },
  { slug: "skills-for-gtm",        title: "Working with skills as a GTM",  order: 6 },
];

export const GTM_LESSON_SKILLS: LessonSkillSeed[] = [
  { lessonId: "lesson-1", skillSlug: "git-basics" },
  { lessonId: "lesson-2", skillSlug: "system-architecture" },
  { lessonId: "lesson-3", skillSlug: "frontend-fundamentals" },
  { lessonId: "lesson-4", skillSlug: "ai-fundamentals" },
  { lessonId: "lesson-5", skillSlug: "mcp-in-practice" },
  { lessonId: "lesson-6", skillSlug: "skills-for-gtm" },
];

// ───── Badge catalog (≤ 30 total) ────────────────────────────────────────────
//
// Criteria are stored as JSON for the future BadgeAwarder to evaluate. The
// award engine itself ships in a later slice — for now seeding the catalog
// lets us reference badge slugs from UI and tests.

export const BADGES: BadgeSeed[] = [
  // Per-course completion (3)
  {
    slug: "nestjs-finisher",
    title: "NestJS — finished",
    description: "Submitted at least one task in every lesson of the NestJS course.",
    iconKey: "graduation",
    courseId: "course-nestjs",
    criteria: { kind: "every-lesson-touched", courseId: "course-nestjs" },
  },
  {
    slug: "mikroorm-finisher",
    title: "MikroORM — finished",
    description: "Submitted at least one task in every lesson of the MikroORM course.",
    iconKey: "graduation",
    courseId: "course-mikroorm",
    criteria: { kind: "every-lesson-touched", courseId: "course-mikroorm" },
  },
  {
    slug: "gtm-finisher",
    title: "Fohlio Tech Course — finished",
    description: "Submitted at least one task in every lesson of the Fohlio Tech Course.",
    iconKey: "graduation",
    courseId: "course-fohlio-tech-course",
    criteria: { kind: "every-lesson-touched", courseId: "course-fohlio-tech-course" },
  },

  // Skill-specific masters (3)
  {
    slug: "nestjs-pipeline-master",
    title: "Pipeline master",
    description: "Submitted every task in the NestJS request pipeline lesson.",
    iconKey: "pipeline",
    courseId: "course-nestjs",
    criteria: { kind: "all-tasks-in-lesson", lessonId: "nestjs-lesson-3" },
  },
  {
    slug: "mikroorm-migration-master",
    title: "Migration master",
    description: "Submitted every task in the MikroORM migrations lesson.",
    iconKey: "migration",
    courseId: "course-mikroorm",
    criteria: { kind: "all-tasks-in-lesson", lessonId: "mikroorm-lesson-7" },
  },
  {
    slug: "gtm-mcp-master",
    title: "MCP master",
    description: "Submitted every task in the MCP-in-practice lesson.",
    iconKey: "mcp",
    courseId: "course-fohlio-tech-course",
    criteria: { kind: "all-tasks-in-lesson", lessonId: "lesson-5" },
  },

  // Cross-course (3)
  {
    slug: "tri-course-polyglot",
    title: "Tri-course polyglot",
    description: "Submitted at least one task in each of the three courses.",
    iconKey: "polyglot",
    criteria: {
      kind: "touched-courses",
      courseIds: ["course-nestjs", "course-mikroorm", "course-fohlio-tech-course"],
    },
  },
  {
    slug: "advanced-explorer",
    title: "Advanced explorer",
    description: "Submitted ten or more Advanced tasks across any course.",
    iconKey: "compass",
    criteria: { kind: "min-tasks-of-category", category: "advanced", min: 10 },
  },
  {
    slug: "homework-veteran",
    title: "Homework veteran",
    description: "Submitted fifty or more tasks across the platform.",
    iconKey: "veteran",
    criteria: { kind: "min-tasks-total", min: 50 },
  },
];
