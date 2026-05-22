import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

type SeriesSeed = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  coverImageUrl: string | null;
  order: number;
  courses: { courseId: string; orderInSeries: number }[];
};

const SERIES: SeriesSeed[] = [
  {
    id: "series-backend",
    slug: "backend",
    title: "Backend Track",
    subtitle: "NestJS plus MikroORM, end-to-end",
    description:
      "From scaffolding your first NestJS module to running a production-ready service backed by MikroORM. Two sequential courses that together cover request lifecycle, dependency injection, validation, persistence, migrations, and operational concerns.",
    coverImageUrl: null,
    order: 1,
    courses: [
      { courseId: "course-nestjs", orderInSeries: 1 },
      { courseId: "course-mikroorm", orderInSeries: 2 },
    ],
  },
  {
    id: "series-ai-gtm",
    slug: "ai-gtm",
    title: "AI for GTM",
    subtitle: "How non-engineers ship with AI",
    description:
      "Practical foundations for the Fohlio GTM team — git, architecture, the codebase, what AI actually does, how to drive it via MCP, and how to wire reusable skills into your daily workflow.",
    coverImageUrl: null,
    order: 2,
    courses: [
      { courseId: "course-fohlio-tech-course", orderInSeries: 1 },
    ],
  },
];

async function main() {
  for (const series of SERIES) {
    await prisma.series.upsert({
      where: { id: series.id },
      update: {
        slug: series.slug,
        title: series.title,
        subtitle: series.subtitle,
        description: series.description,
        coverImageUrl: series.coverImageUrl,
        order: series.order,
      },
      create: {
        id: series.id,
        slug: series.slug,
        title: series.title,
        subtitle: series.subtitle,
        description: series.description,
        coverImageUrl: series.coverImageUrl,
        order: series.order,
      },
    });

    for (const link of series.courses) {
      const course = await prisma.course.findUnique({
        where: { id: link.courseId },
        select: { id: true },
      });
      if (!course) {
        console.warn(
          `[seed-series] Course ${link.courseId} not found — skipping. Run its seeder first.`,
        );
        continue;
      }
      await prisma.course.update({
        where: { id: link.courseId },
        data: {
          seriesId: series.id,
          orderInSeries: link.orderInSeries,
        },
      });
    }
  }

  console.log(
    `Seeded ${SERIES.length} series and updated ${SERIES.reduce((acc, s) => acc + s.courses.length, 0)} course→series links.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
