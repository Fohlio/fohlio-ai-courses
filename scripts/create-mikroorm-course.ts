import "dotenv/config";
import { readFile } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ADMIN_GITHUB_NICKNAME } from "../src/lib/constants";
import { seedCourseSkills, seedBadges } from "../src/lib/skillSeeder";
import {
  MIKROORM_SKILLS,
  MIKROORM_LESSON_SKILLS,
  BADGES,
} from "./gamification-seeds";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const adminNickname = process.env.ADMIN_GITHUB_NICKNAME ?? ADMIN_GITHUB_NICKNAME;

const COURSE_ID = "course-mikroorm";
const COURSE_SLUG = "mikroorm";

type HomeworkTaskSeed = {
  id: string;
  title: string;
  description: string;
  category: "required" | "advanced";
  submissionType: "pr_link" | "screenshot" | "text" | "quiz" | "checklist" | "widget";
  order: number;
  widgetId?: string;
  widgetConfig?: Record<string, unknown>;
  modelAnswer?: string;
  estimatedMinutes?: number;
};

type LessonSeed = {
  id: string;
  slug: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  learningGoals: string[];
  contentFile: string;
  homeworkFile: string;
  isPublished: boolean;
};

const LESSONS: LessonSeed[] = [
  {
    id: "mikroorm-lesson-1",
    slug: "intro",
    order: 1,
    title: "Why MikroORM? DataMapper, Identity Map, and the Library That Tracks Itself",
    subtitle: "DataMapper, Identity Map, and the Library That Tracks Itself",
    description:
      "Why MikroORM picks DataMapper over Active Record, what the Identity Map and Unit of Work actually do, and the Records Library mental model that grounds every later lesson. Scaffold archive-api, define your first entity, and prove book1 === book2.",
    learningGoals: [
      "Understand the difference between Active Record and Data Mapper, and why MikroORM picks the latter",
      "Know what the Identity Map and Unit of Work do, and why they are not just a cache",
      "Have a mental model (the Records Library) you can use for every lesson ahead",
      "Install MikroORM with the PostgreSQL driver and write your first mikro-orm.config.ts",
      "Define a Book entity, persist it, re-fetch it, and see the Identity Map proof",
    ],
    contentFile: "mikroorm-1-intro.html",
    homeworkFile: "L1.json",
    isPublished: true,
  },
  {
    id: "mikroorm-lesson-2",
    slug: "entities",
    order: 2,
    title: "Defining Entities: Properties, Primary Keys, and the Modeling Toolbox",
    subtitle: "Properties, Primary Keys, and the Modeling Toolbox",
    description:
      "Three ways to define an entity in MikroORM, the property types and modifiers you will use 95% of the time, primary key choices (bigint vs uuid vs composite), naming strategy, and the difference between TypeScript-optional and DB-nullable.",
    learningGoals: [
      "Know the three ways to define a MikroORM entity, and which one we use in this course",
      "Memorize the property types and modifiers you reach for 95% of the time",
      "Pick between bigint, uuid, and composite primary keys based on real trade-offs",
      "Understand the naming strategy: how publishedYear becomes published_year",
      "Distinguish nullable (DB) from optional (TypeScript) and avoid the common confusion",
    ],
    contentFile: "mikroorm-2-entities.html",
    homeworkFile: "L2.json",
    isPublished: true,
  },
  {
    id: "mikroorm-lesson-3",
    slug: "entity-manager",
    order: 3,
    title: "The EntityManager: persist, find, and the Unit of Work in action",
    subtitle: "persist, find, and the Unit of Work in action",
    description:
      "The four entity states, persist + flush mechanics, the FilterQuery DSL, references vs hydrated entities, and an Identity Map proof-of-life from real query logs.",
    learningGoals: [
      "Name the four entity lifecycle states (New / Managed / Detached / Removed) and their transitions",
      "Read a query log and prove the Identity Map is doing its job",
      "Build complex find conditions with $and, $or, $gt, $in, and nested relation filters",
      "Use em.getReference to update a relation without loading the related entity",
      "Use partial loading and know which FK gotcha silently breaks relations",
    ],
    contentFile: "mikroorm-3-entity-manager.html",
    homeworkFile: "L3.json",
    isPublished: true,
  },
  {
    id: "mikroorm-lesson-4",
    slug: "relations",
    order: 4,
    title: "Relationships: Owning Sides, Inverse Sides, and Collections",
    subtitle: "Owning Sides, Inverse Sides, and Collections",
    description:
      "The four cardinalities (1:1, 1:M, M:1, M:M), owning vs inverse sides, Collections that are not arrays, and cascade persist/remove vs orphan removal.",
    learningGoals: [
      "Identify the four relationship cardinalities and which side owns the foreign key",
      "Configure cascade persist, cascade remove, and orphan removal and predict their SQL effects",
      "Use Collections correctly: init(), add(), remove(), set() — and avoid the iterate-uninitialized trap",
      "Understand pivot tables in M:M and why MikroORM creates them automatically",
      "Tell ORM-level cascade from DB-level updateRule/deleteRule",
    ],
    contentFile: "mikroorm-4-relations.html",
    homeworkFile: "L4.json",
    isPublished: true,
  },
  {
    id: "mikroorm-lesson-5",
    slug: "loading",
    order: 5,
    title: "Populating Relations and Loading Strategies",
    subtitle: "Populating Relations Without Drowning the Database",
    description:
      "The N+1 problem and its fix, the three loading strategies (SELECT_IN, JOINED, BALANCED) and which to pick, partial loading with fields/exclude, and dataloaders for fine-grained batching.",
    learningGoals: [
      "Recognize an N+1 query pattern in a log within five seconds",
      "Use populate to fix N+1 and understand the difference vs JOINED strategy",
      "Pick between SELECT_IN, JOINED, and BALANCED based on relation shape (not round-trip count)",
      "Use partial loading with fields/exclude — and know which FK omission silently breaks relations",
      "Apply dataloaders when populate is the wrong tool",
    ],
    contentFile: "mikroorm-5-loading.html",
    homeworkFile: "L5.json",
    isPublished: true,
  },
  {
    id: "mikroorm-lesson-6",
    slug: "query-builder",
    order: 6,
    title: "QueryBuilder, Filters, and the SQL Escape Hatches",
    subtitle: "QueryBuilder, Filters, and the SQL Escape Hatches",
    description:
      "When em.find is not enough: the QueryBuilder, the full FilterQuery operator set, raw SQL fragments, soft-delete via Filters, and custom Repositories that earn their keep.",
    learningGoals: [
      "Recognize when em.find is not enough and reach for QueryBuilder confidently",
      "Use the full FilterQuery operator set: $and, $or, $gt, $in, $like, $contains, $exists",
      "Know the difference between qb.execute() (raw rows) and qb.getResult() (hydrated entities)",
      "Implement soft-delete and multi-tenant isolation with Filters",
      "Understand why custom Repositories are optional, and write one when it pays off",
    ],
    contentFile: "mikroorm-6-query-builder.html",
    homeworkFile: "L6.json",
    isPublished: true,
  },
  {
    id: "mikroorm-lesson-7",
    slug: "migrations",
    order: 7,
    title: "Migrations, Schema Generation, and Seeding",
    subtitle: "Migrations, Schema Generation, and Seeding",
    description:
      "Schema generation for dev vs migrations for prod, anatomy of a migration file, snapshot-based diffing for CI determinism, and Faker-powered seeders.",
    learningGoals: [
      "Distinguish schema:update (dev) from migrations (prod) and pick the right tool per situation",
      "Read and write a migration file: up(), down(), and inline SQL",
      "Understand why MikroORM uses a snapshot file rather than diffing the live database",
      "Build a Faker-powered seeder that produces realistic data with relations",
      "Hand-edit a generated migration to add a safe backfill",
    ],
    contentFile: "mikroorm-7-migrations.html",
    homeworkFile: "L7.json",
    isPublished: true,
  },
  {
    id: "mikroorm-lesson-8",
    slug: "advanced",
    order: 8,
    title: "Embeddables, Inheritance, JSON, Virtual Entities, and Lifecycle Hooks",
    subtitle: "When one row needs to hold a small universe",
    description:
      "Embeddables (inline vs JSON), inheritance strategies (STI vs TPT), typed JSONB properties (and the concurrent-counter trap), virtual/view entities, lifecycle hooks, and custom types.",
    learningGoals: [
      "Use embeddables to compose value objects (Address, Money) without separate tables",
      "Pick between STI, TPT, and mapped superclass strategies",
      "Type JSONB columns and know when an in-JSON counter is dangerous under concurrency",
      "Tell virtual entities (in-memory expression) apart from view entities (real DB view)",
      "Choose lifecycle hooks vs subscribers and write a custom Type for a value object",
    ],
    contentFile: "mikroorm-8-advanced.html",
    homeworkFile: "L8.json",
    isPublished: true,
  },
  {
    id: "mikroorm-lesson-9",
    slug: "nestjs-integration",
    order: 9,
    title: "MikroORM in NestJS: Modules, Request Scope, and Transactions",
    subtitle: "Modules, Request Scope, and Transactions",
    description:
      "MikroOrmModule.forRoot/forFeature, automatic request-scoped EntityManager, @CreateRequestContext for workers and cron, the three transaction levels, and the Transactional Outbox pattern.",
    learningGoals: [
      "Wire MikroOrmModule.forRoot and forFeature into a NestJS app",
      "Understand how request-scoped EntityManager works and why fork-per-request matters",
      "Use @CreateRequestContext for queue handlers and scheduled tasks",
      "Choose between implicit transactions, @Transactional, and em.transactional",
      "Implement a Transactional Outbox so domain events never get lost between commit and broker publish",
    ],
    contentFile: "mikroorm-9-nestjs-integration.html",
    homeworkFile: "L9.json",
    isPublished: true,
  },
  {
    id: "mikroorm-lesson-10",
    slug: "production",
    order: 10,
    title: "Capstone — Production-Ready archive-api",
    subtitle: "Capstone - Production-Ready archive-api",
    description:
      "Synthesis lesson combining everything from L1-L9 into a deployed archive-api: structured logging, metadata cache, read replicas, multi-schema multi-tenancy, and a capstone PR that combines at least four prior lessons.",
    learningGoals: [
      "Configure structured production logging with slow-query highlighting",
      "Generate and ship the metadata cache to eliminate cold-start tax",
      "Wire read replicas for read/write split with read-after-write safety",
      "Know when to reach for read replicas, multiple schemas, and request contexts",
      "Ship a capstone PR combining at least 4 patterns from the course",
    ],
    contentFile: "mikroorm-10-production.html",
    homeworkFile: "L10.json",
    isPublished: true,
  },
];

async function loadHomework(homeworkFile: string): Promise<HomeworkTaskSeed[]> {
  const path = join(process.cwd(), "scripts", "mikroorm-homework", homeworkFile);
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as HomeworkTaskSeed[];
}

async function main() {
  const admin = await prisma.user.findUnique({
    where: { githubNickname: adminNickname },
    select: { id: true },
  });

  if (!admin) {
    console.error(`Admin user "${adminNickname}" not found. Run create-admin.ts first.`);
    process.exit(1);
  }

  const lessonsWithHomework = await Promise.all(
    LESSONS.map(async (lesson) => ({
      ...lesson,
      homework: await loadHomework(lesson.homeworkFile),
    })),
  );

  await prisma.$transaction(
    async (tx) => {
      await tx.course.upsert({
        where: { id: COURSE_ID },
        update: {
          slug: COURSE_SLUG,
          title: "MikroORM Course",
          subtitle: "DataMapper, Identity Map, and Unit of Work for the Fohlio team",
          description:
            "A 10-lesson practical course on MikroORM v7 with PostgreSQL: DataMapper philosophy, Identity Map, Unit of Work, relations, loading strategies, QueryBuilder, migrations, embeddables, NestJS integration, and a deployed capstone. The Records Library analogy carries you the whole way.",
          status: "published",
          ownerId: admin.id,
        },
        create: {
          id: COURSE_ID,
          slug: COURSE_SLUG,
          title: "MikroORM Course",
          subtitle: "DataMapper, Identity Map, and Unit of Work for the Fohlio team",
          description:
            "A 10-lesson practical course on MikroORM v7 with PostgreSQL: DataMapper philosophy, Identity Map, Unit of Work, relations, loading strategies, QueryBuilder, migrations, embeddables, NestJS integration, and a deployed capstone. The Records Library analogy carries you the whole way.",
          status: "published",
          ownerId: admin.id,
        },
      });

      for (const lesson of lessonsWithHomework) {
        const contentHtml = await readFile(
          join(process.cwd(), "public", "lessons", lesson.contentFile),
          "utf-8",
        );

        const upsertedLesson = await tx.lesson.upsert({
          where: { courseId_slug: { courseId: COURSE_ID, slug: lesson.slug } },
          update: {
            order: lesson.order,
            title: lesson.title,
            subtitle: lesson.subtitle,
            description: lesson.description,
            learningGoals: lesson.learningGoals,
            contentType: "html",
            contentHtml,
            isPublished: lesson.isPublished,
          },
          create: {
            id: lesson.id,
            courseId: COURSE_ID,
            slug: lesson.slug,
            order: lesson.order,
            title: lesson.title,
            subtitle: lesson.subtitle,
            description: lesson.description,
            learningGoals: lesson.learningGoals,
            contentType: "html",
            contentHtml,
            isPublished: lesson.isPublished,
          },
        });

        await tx.homeworkTask.deleteMany({ where: { lessonId: upsertedLesson.id } });

        for (const task of lesson.homework) {
          await tx.homeworkTask.create({
            data: {
              id: task.id,
              lessonId: upsertedLesson.id,
              title: task.title,
              description: task.description,
              category: task.category,
              submissionType: task.submissionType,
              order: task.order,
              widgetId: task.widgetId ?? null,
              widgetConfig: task.widgetConfig
                ? (JSON.parse(JSON.stringify(task.widgetConfig)) as object)
                : undefined,
              modelAnswer: task.modelAnswer ?? null,
              estimatedMinutes: task.estimatedMinutes ?? null,
            },
          });
        }
      }
    },
    { timeout: 60_000, maxWait: 10_000 },
  );

  await seedCourseSkills(prisma, {
    courseId: COURSE_ID,
    skills: MIKROORM_SKILLS,
    lessonSkills: MIKROORM_LESSON_SKILLS,
  });
  await seedBadges(prisma, BADGES);

  console.log("MikroORM course seeded successfully.");
  console.log(`Course slug: ${COURSE_SLUG}`);
  console.log(
    `Lessons published: ${lessonsWithHomework.filter((l) => l.isPublished).length}/${lessonsWithHomework.length}`,
  );
  const totalTasks = lessonsWithHomework.reduce((acc, l) => acc + l.homework.length, 0);
  console.log(`Homework tasks seeded: ${totalTasks}`);
  console.log(`Skills: ${MIKROORM_SKILLS.length}, lesson links: ${MIKROORM_LESSON_SKILLS.length}, badges: ${BADGES.length} (global catalog)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
