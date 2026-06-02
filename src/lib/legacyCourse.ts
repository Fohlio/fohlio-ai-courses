import { readFile } from "fs/promises";
import { join } from "path";
import { type PrismaClient } from "../generated/prisma/client";
import { ADMIN_GITHUB_NICKNAME, LESSONS } from "./constants";
import { prepareLessonHtml } from "./lessonHtml";
import {
  upsertLessonHomework,
  type TaskSpec,
} from "../../scripts/lib/upsertLessonHomework";

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
        // Build TaskSpec[] for the stable upsert helper. category + order are
        // taken verbatim from the source (no renumbering), so existing
        // HomeworkTask.id (and thus every TaskSubmission) stays attached.
        tasks: lesson.homework.flatMap((section) =>
          section.tasks.map(
            (task): TaskSpec => ({
              title: task.title,
              description: task.description,
              category: task.category,
              order: task.order,
              submissionType: task.submissionType,
              quizQuestions: task.quizQuestions ?? null,
              checklistItems: task.checklistItems ?? null,
              widgetId: task.widgetId ?? null,
              widgetConfig: task.widgetConfig ?? null,
              modelAnswer: task.modelAnswer ?? null,
              estimatedMinutes: task.estimatedMinutes ?? null,
            }),
          ),
        ),
      };
    }),
  );

  await prisma.$transaction(async (tx) => {
    await tx.course.upsert({
      where: { id: LEGACY_COURSE_ID },
      update: {
        slug: LEGACY_COURSE_SLUG,
        title: "Fohlio Tech Course",
        subtitle: "Legacy migrated course",
        description:
          "The original Fohlio internal course, migrated from static lesson files into the multi-course platform.",
        status: "published",
        ownerId: admin.id,
      },
      create: {
        id: LEGACY_COURSE_ID,
        slug: LEGACY_COURSE_SLUG,
        title: "Fohlio Tech Course",
        subtitle: "Legacy migrated course",
        description:
          "The original Fohlio internal course, migrated from static lesson files into the multi-course platform.",
        status: "published",
        ownerId: admin.id,
        publishedAt: new Date(),
      },
    });

    for (const lesson of lessonData) {
      await tx.lesson.upsert({
        where: { id: lesson.id },
        update: {
          courseId: LEGACY_COURSE_ID,
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
        },
        create: {
          id: lesson.id,
          courseId: LEGACY_COURSE_ID,
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
        },
      });

      // Stable upsert by the (lessonId, category, order) natural key — preserves
      // each task's existing HomeworkTask.id so TaskSubmission rows never orphan.
      await upsertLessonHomework(tx, lesson.id, lesson.tasks);
    }

    await tx.taskSubmission.updateMany({
      where: { courseId: null },
      data: { courseId: LEGACY_COURSE_ID },
    });
  }, { timeout: 60_000, maxWait: 10_000 });
}

export const legacyCourse = {
  id: LEGACY_COURSE_ID,
  slug: LEGACY_COURSE_SLUG,
};
