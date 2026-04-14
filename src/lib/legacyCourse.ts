import { readFile } from "fs/promises";
import { join } from "path";
import { Prisma, type PrismaClient } from "../generated/prisma/client";
import { ADMIN_GITHUB_NICKNAME, LESSONS } from "./constants";
import { prepareLessonHtml } from "./lessonHtml";

const LEGACY_COURSE_ID = "course-fohlio-tech-course";
const LEGACY_COURSE_SLUG = "fohlio-tech-course";

export async function backfillLegacyCourse(prisma: PrismaClient): Promise<void> {
  const admin = await prisma.user.findUnique({
    where: { githubNickname: ADMIN_GITHUB_NICKNAME },
    select: { id: true },
  });

  if (!admin) {
    throw new Error("Cannot backfill legacy course before the admin user exists.");
  }

  const existingCourse = await prisma.course.findUnique({
    where: { id: LEGACY_COURSE_ID },
    select: { id: true },
  });

  if (existingCourse) {
    await prisma.taskSubmission.updateMany({
      where: { courseId: null },
      data: { courseId: LEGACY_COURSE_ID },
    });
    return;
  }

  const lessonData = await Promise.all(
    LESSONS.map(async (lesson) => {
      let rawHtml = "";
      let unresolvedMediaSources: string[] = [];
      let pdfUrl: string | null = null;

      if (lesson.contentType === "html") {
        rawHtml = await readFile(
          join(process.cwd(), "public", "lessons", lesson.contentFile),
          "utf-8",
        );
        unresolvedMediaSources = prepareLessonHtml(rawHtml, []).unresolvedMediaSources;
      } else if (lesson.contentType === "pdf") {
        pdfUrl = `/lessons/${lesson.contentFile}`;
      }

      return {
        id: lesson.id,
        slug: lesson.slug,
        order: lesson.order,
        title: lesson.title,
        subtitle: lesson.subtitle,
        description: lesson.description,
        learningGoals: lesson.learningGoals,
        contentType: lesson.contentType === "pdf" ? ("pdf" as const) : ("html" as const),
        contentHtml: rawHtml,
        pdfUrl,
        videoUrl: lesson.videoUrl,
        isPublished: lesson.isPublished,
        unresolvedMediaSources,
        tasks: lesson.homework.flatMap((section) =>
          section.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            category: task.category,
            submissionType: task.submissionType,
            order: task.order,
            quizQuestions: task.quizQuestions ?? Prisma.JsonNull,
            checklistItems: task.checklistItems ?? Prisma.JsonNull,
          })),
        ),
      };
    }),
  );

  await prisma.$transaction(async (tx) => {
    await tx.course.create({
      data: {
        id: LEGACY_COURSE_ID,
        slug: LEGACY_COURSE_SLUG,
        title: "Fohlio Tech Course",
        subtitle: "Legacy migrated course",
        description:
          "The original Fohlio internal course, migrated from static lesson files into the multi-course platform.",
        status: "published",
        ownerId: admin.id,
        publishedAt: new Date(),
        lessons: {
          create: lessonData.map((lesson) => ({
            id: lesson.id,
            slug: lesson.slug,
            order: lesson.order,
            title: lesson.title,
            subtitle: lesson.subtitle,
            description: lesson.description,
            learningGoals: lesson.learningGoals,
            contentType: lesson.contentType,
            contentHtml: lesson.contentHtml,
            pdfUrl: lesson.pdfUrl,
            videoUrl: lesson.videoUrl,
            isPublished: lesson.isPublished,
            unresolvedMediaSources: lesson.unresolvedMediaSources,
            tasks: {
              create: lesson.tasks,
            },
          })),
        },
      },
    });

    await tx.taskSubmission.updateMany({
      where: { courseId: null },
      data: { courseId: LEGACY_COURSE_ID },
    });
  });
}

export const legacyCourse = {
  id: LEGACY_COURSE_ID,
  slug: LEGACY_COURSE_SLUG,
};
