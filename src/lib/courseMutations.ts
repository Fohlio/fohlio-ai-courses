import { z } from "zod";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "./prisma";
import { err, ok, type Result } from "./result";
import { getCourseBySlugOrId } from "./courseQueries";
import { hasPublishableLessonContent, prepareLessonHtml } from "./lessonHtml";
import type { CourseDetail, LessonAsset, UserRole } from "./types";

interface Viewer {
  id: string;
  role: UserRole;
}

const CourseCreateSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().min(10).max(5000),
  slug: z.string().trim().min(2).max(120).optional(),
});

const CourseUpdateSchema = CourseCreateSchema.extend({
  coverImageUrl: z.string().trim().url().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

const LessonUpdateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  subtitle: z.string().trim().max(160).optional().nullable(),
  description: z.string().trim().max(4000),
  slug: z.string().trim().min(1).max(160),
  order: z.number().int().positive(),
  learningGoals: z.array(z.string().trim().min(1)).max(20),
  contentType: z.enum(["html", "pdf"]),
  contentHtml: z.string(),
  pdfUrl: z.string().trim().optional().nullable(),
  videoUrl: z.string().trim().optional().nullable(),
  isPublished: z.boolean().optional(),
});

const LessonAssetCreateSchema = z.object({
  kind: z.enum(["image", "video", "html_source"]),
  fileName: z.string().trim().min(1).max(255),
  pathname: z.string().trim().min(1),
  url: z.string().trim().url(),
  contentType: z.string().trim().min(1).max(255),
  size: z.number().int().nonnegative().nullable().optional(),
});

const HomeworkTaskInputSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(4000),
  category: z.enum(["required", "advanced"]).default("required"),
  submissionType: z.enum(["pr_link", "screenshot", "text", "quiz", "checklist"]).default("text"),
  order: z.number().int().positive(),
  quizQuestions: z.array(z.string().trim().min(1)).optional(),
  checklistItems: z.array(z.string().trim().min(1)).optional(),
});

const HomeworkReplaceSchema = z.array(HomeworkTaskInputSchema);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function isOwnerOrAdmin(ownerId: string, viewer: Viewer): boolean {
  return viewer.role === "admin" || viewer.id === ownerId;
}

async function getOwnedCourse(courseId: string, viewer: Viewer) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        include: {
          assets: true,
          tasks: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    return null;
  }

  if (!isOwnerOrAdmin(course.ownerId, viewer)) {
    return undefined;
  }

  return course;
}

async function assertUniqueCourseSlug(slug: string, currentCourseId?: string): Promise<boolean> {
  const existingCourse = await prisma.course.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!existingCourse) {
    return true;
  }

  return existingCourse.id === currentCourseId;
}

async function validateCoursePublication(courseId: string): Promise<Result<true, string>> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        include: {
          assets: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    return err("Course not found.");
  }

  if (course.lessons.length === 0) {
    return err("A course needs at least one lesson before it can be published.");
  }

  const lessonSlugs = new Set<string>();

  for (const lesson of course.lessons) {
    if (lessonSlugs.has(lesson.slug)) {
      return err("Lesson slugs must be unique within a course before publishing.");
    }

    lessonSlugs.add(lesson.slug);

    if (!lesson.title.trim() || !lesson.slug.trim()) {
      return err("Every lesson needs a title and slug before publishing.");
    }

    if (!hasPublishableLessonContent(lesson.contentHtml, lesson.contentType)) {
      return err(`Lesson "${lesson.title}" is missing content.`);
    }

    const preparedLesson = prepareLessonHtml(
      lesson.contentHtml,
      lesson.assets.map((asset) => ({
        id: asset.id,
        lessonId: asset.lessonId,
        kind: asset.kind,
        fileName: asset.fileName,
        pathname: asset.pathname,
        url: asset.url,
        contentType: asset.contentType,
        size: asset.size,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      })),
    );

    if (preparedLesson.unresolvedMediaSources.length > 0) {
      return err(
        `Lesson "${lesson.title}" still has unresolved media references: ${preparedLesson.unresolvedMediaSources.join(", ")}`,
      );
    }
  }

  return ok(true);
}

export async function createCourse(
  viewer: Viewer,
  input: unknown,
): Promise<Result<CourseDetail, string>> {
  const parsedInput = CourseCreateSchema.safeParse(input);

  if (!parsedInput.success) {
    return err(parsedInput.error.issues[0]?.message ?? "Invalid course payload.");
  }

  const slug = slugify(parsedInput.data.slug ?? parsedInput.data.title);

  if (!slug) {
    return err("Could not generate a valid course slug.");
  }

  const uniqueSlug = await assertUniqueCourseSlug(slug);

  if (!uniqueSlug) {
    return err("A course with this slug already exists.");
  }

  const createdCourse = await prisma.course.create({
    data: {
      title: parsedInput.data.title,
      subtitle: parsedInput.data.subtitle ?? null,
      description: parsedInput.data.description,
      slug,
      ownerId: viewer.id,
      status: "draft",
    },
  });

  const course = await getCourseBySlugOrId(createdCourse.id, viewer);

  if (!course) {
    return err("Failed to load the course after creation.");
  }

  return ok(course);
}

export async function updateCourse(
  viewer: Viewer,
  courseId: string,
  input: unknown,
): Promise<Result<CourseDetail, string>> {
  const parsedInput = CourseUpdateSchema.safeParse(input);

  if (!parsedInput.success) {
    return err(parsedInput.error.issues[0]?.message ?? "Invalid course payload.");
  }

  const course = await getOwnedCourse(courseId, viewer);

  if (course === undefined) {
    return err("Forbidden");
  }

  if (!course) {
    return err("Course not found.");
  }

  const slug = slugify(parsedInput.data.slug ?? parsedInput.data.title);

  if (!slug) {
    return err("Could not generate a valid course slug.");
  }

  const uniqueSlug = await assertUniqueCourseSlug(slug, course.id);

  if (!uniqueSlug) {
    return err("A course with this slug already exists.");
  }

  if (parsedInput.data.status === "published") {
    const publicationCheck = await validateCoursePublication(courseId);

    if (!publicationCheck.ok) {
      return publicationCheck;
    }
  }

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title: parsedInput.data.title,
      subtitle: parsedInput.data.subtitle ?? null,
      description: parsedInput.data.description,
      coverImageUrl: parsedInput.data.coverImageUrl ?? null,
      slug,
      status: parsedInput.data.status,
      publishedAt:
        parsedInput.data.status === "published" ? new Date() : course.publishedAt,
      archivedAt:
        parsedInput.data.status === "archived" ? new Date() : null,
    },
  });

  const updatedCourse = await getCourseBySlugOrId(courseId, viewer);

  if (!updatedCourse) {
    return err("Failed to load the course after update.");
  }

  return ok(updatedCourse);
}

export async function createLesson(
  viewer: Viewer,
  courseId: string,
): Promise<Result<CourseDetail, string>> {
  const course = await getOwnedCourse(courseId, viewer);

  if (course === undefined) {
    return err("Forbidden");
  }

  if (!course) {
    return err("Course not found.");
  }

  const nextOrder =
    course.lessons.length > 0
      ? Math.max(...course.lessons.map((lesson) => lesson.order)) + 1
      : 1;

  const baseSlug = `lesson-${nextOrder}`;
  let slug = baseSlug;
  let suffix = 1;

  while (course.lessons.some((lesson) => lesson.slug === slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  await prisma.lesson.create({
    data: {
      courseId,
      slug,
      order: nextOrder,
      title: `Lesson ${nextOrder}`,
      subtitle: "",
      description: "",
      learningGoals: [],
      contentType: "html",
      contentHtml: "",
      isPublished: true,
      unresolvedMediaSources: [],
    },
  });

  const updatedCourse = await getCourseBySlugOrId(courseId, viewer);

  if (!updatedCourse) {
    return err("Failed to load the course after lesson creation.");
  }

  return ok(updatedCourse);
}

export async function updateLesson(
  viewer: Viewer,
  courseId: string,
  lessonId: string,
  input: unknown,
): Promise<Result<CourseDetail, string>> {
  const parsedInput = LessonUpdateSchema.safeParse(input);

  if (!parsedInput.success) {
    return err(parsedInput.error.issues[0]?.message ?? "Invalid lesson payload.");
  }

  const course = await getOwnedCourse(courseId, viewer);

  if (course === undefined) {
    return err("Forbidden");
  }

  if (!course) {
    return err("Course not found.");
  }

  const lesson = course.lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    return err("Lesson not found.");
  }

  const slug = slugify(parsedInput.data.slug);

  if (!slug) {
    return err("Lesson slug is invalid.");
  }

  const duplicateLesson = course.lessons.find(
    (item) => item.slug === slug && item.id !== lessonId,
  );

  if (duplicateLesson) {
    return err("Lesson slugs must be unique within the course.");
  }

  const preparedHtml = prepareLessonHtml(
    parsedInput.data.contentHtml,
    lesson.assets.map((asset) => ({
      id: asset.id,
      lessonId: asset.lessonId,
      kind: asset.kind,
      fileName: asset.fileName,
      pathname: asset.pathname,
      url: asset.url,
      contentType: asset.contentType,
      size: asset.size,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    })),
  );

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title: parsedInput.data.title,
      subtitle: parsedInput.data.subtitle ?? null,
      description: parsedInput.data.description,
      slug,
      order: parsedInput.data.order,
      learningGoals: parsedInput.data.learningGoals,
      contentType: parsedInput.data.contentType,
      contentHtml: parsedInput.data.contentHtml,
      pdfUrl:
        parsedInput.data.contentType === "pdf"
          ? parsedInput.data.pdfUrl ?? null
          : null,
      videoUrl: parsedInput.data.videoUrl ?? null,
      isPublished: parsedInput.data.isPublished ?? lesson.isPublished,
      unresolvedMediaSources: preparedHtml.unresolvedMediaSources,
    },
  });

  const updatedCourse = await getCourseBySlugOrId(courseId, viewer);

  if (!updatedCourse) {
    return err("Failed to load the course after lesson update.");
  }

  return ok(updatedCourse);
}

export async function saveLessonAsset(
  viewer: Viewer,
  courseId: string,
  lessonId: string,
  input: unknown,
): Promise<Result<LessonAsset, string>> {
  const parsedInput = LessonAssetCreateSchema.safeParse(input);

  if (!parsedInput.success) {
    return err(parsedInput.error.issues[0]?.message ?? "Invalid asset payload.");
  }

  const course = await getOwnedCourse(courseId, viewer);

  if (course === undefined) {
    return err("Forbidden");
  }

  if (!course) {
    return err("Course not found.");
  }

  const lesson = course.lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    return err("Lesson not found.");
  }

  const existingAsset = await prisma.lessonAsset.findFirst({
    where: {
      lessonId,
      pathname: parsedInput.data.pathname,
    },
  });

  if (existingAsset) {
    return ok({
      id: existingAsset.id,
      lessonId: existingAsset.lessonId,
      kind: existingAsset.kind,
      fileName: existingAsset.fileName,
      pathname: existingAsset.pathname,
      url: existingAsset.url,
      contentType: existingAsset.contentType,
      size: existingAsset.size,
      createdAt: existingAsset.createdAt,
      updatedAt: existingAsset.updatedAt,
    });
  }

  const asset = await prisma.lessonAsset.create({
    data: {
      lessonId,
      kind: parsedInput.data.kind,
      fileName: parsedInput.data.fileName,
      pathname: parsedInput.data.pathname,
      url: parsedInput.data.url,
      contentType: parsedInput.data.contentType,
      size: parsedInput.data.size ?? null,
    },
  });

  return ok({
    id: asset.id,
    lessonId: asset.lessonId,
    kind: asset.kind,
    fileName: asset.fileName,
    pathname: asset.pathname,
    url: asset.url,
    contentType: asset.contentType,
    size: asset.size,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  });
}

export async function deleteLesson(
  viewer: Viewer,
  courseId: string,
  lessonId: string,
): Promise<Result<CourseDetail, string>> {
  const course = await getOwnedCourse(courseId, viewer);

  if (course === undefined) {
    return err("Forbidden");
  }

  if (!course) {
    return err("Course not found.");
  }

  const hasSubmissions = await prisma.taskSubmission.count({
    where: { lessonId },
  });

  if (hasSubmissions > 0) {
    return err("Lessons with student submissions cannot be deleted.");
  }

  await prisma.lesson.delete({
    where: { id: lessonId },
  });

  const remainingLessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: { id: true },
  });

  await Promise.all(
    remainingLessons.map((lesson, index) =>
      prisma.lesson.update({
        where: { id: lesson.id },
        data: { order: index + 1 },
      }),
    ),
  );

  const updatedCourse = await getCourseBySlugOrId(courseId, viewer);

  if (!updatedCourse) {
    return err("Failed to load the course after lesson deletion.");
  }

  return ok(updatedCourse);
}

export async function replaceLessonHomework(
  viewer: Viewer,
  courseId: string,
  lessonId: string,
  input: unknown,
): Promise<Result<CourseDetail, string>> {
  const parsedInput = HomeworkReplaceSchema.safeParse(input);

  if (!parsedInput.success) {
    return err(parsedInput.error.issues[0]?.message ?? "Invalid homework payload.");
  }

  const course = await getOwnedCourse(courseId, viewer);

  if (course === undefined) {
    return err("Forbidden");
  }

  if (!course) {
    return err("Course not found.");
  }

  const lesson = course.lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    return err("Lesson not found.");
  }

  const existingTasks = await prisma.homeworkTask.findMany({
    where: { lessonId },
    orderBy: { order: "asc" },
  });
  const incomingIds = new Set(parsedInput.data.map((task) => task.id).filter(Boolean));
  const tasksToDelete = existingTasks.filter((task) => !incomingIds.has(task.id));

  for (const task of tasksToDelete) {
    const submissionCount = await prisma.taskSubmission.count({
      where: { taskId: task.id },
    });

    if (submissionCount > 0) {
      return err(`Task "${task.title}" already has submissions and cannot be deleted.`);
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (tasksToDelete.length > 0) {
        await tx.homeworkTask.deleteMany({
          where: { id: { in: tasksToDelete.map((task) => task.id) } },
        });
      }

      for (const task of parsedInput.data) {
        if (task.id) {
          const existingTask = existingTasks.find((item) => item.id === task.id);

          if (!existingTask) {
            throw new Error("Homework task does not belong to this lesson.");
          }

          await tx.homeworkTask.update({
            where: { id: task.id },
            data: {
              title: task.title,
              description: task.description,
              category: task.category,
              submissionType: task.submissionType,
              order: task.order,
              quizQuestions: task.quizQuestions ?? Prisma.JsonNull,
              checklistItems: task.checklistItems ?? Prisma.JsonNull,
            },
          });
        } else {
          await tx.homeworkTask.create({
            data: {
              lessonId,
              title: task.title,
              description: task.description,
              category: task.category,
              submissionType: task.submissionType,
              order: task.order,
              quizQuestions: task.quizQuestions ?? Prisma.JsonNull,
              checklistItems: task.checklistItems ?? Prisma.JsonNull,
            },
          });
        }
      }
    });
  } catch (transactionError) {
    return err(
      transactionError instanceof Error
        ? transactionError.message
        : "Failed to update homework tasks.",
    );
  }

  const updatedCourse = await getCourseBySlugOrId(courseId, viewer);

  if (!updatedCourse) {
    return err("Failed to load the course after homework update.");
  }

  return ok(updatedCourse);
}
