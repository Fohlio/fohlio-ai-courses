import type { TaskSubmission as DbTaskSubmission } from "../generated/prisma/client";
import { prisma } from "./prisma";
import { calculateCourseProgress, calculateOverallProgress } from "./courseProgress";
import type {
  AdminCourseSummary,
  AdminStudentSummary,
  CourseCard,
  CourseDetail,
  CourseProgress,
  CourseStatus,
  CourseOwner,
  HomeworkSection,
  HomeworkTask,
  Lesson,
  LessonAsset,
  OverallProgressSummary,
  OwnerCourseDashboard,
  OwnerCourseStudentSummary,
  OwnerSubmissionSummary,
  SubmissionContent,
  SubmissionStatus,
  SubmissionType,
  TaskSubmission,
  UserRole,
} from "./types";

export interface Viewer {
  id: string;
  role: UserRole;
}

function assertAdmin(viewer: Viewer): void {
  if (viewer.role !== "admin") {
    throw new Error("Forbidden");
  }
}

function isOwnerOrAdmin(courseOwnerId: string, viewer: Viewer | null): boolean {
  if (!viewer) {
    return false;
  }

  return viewer.role === "admin" || viewer.id === courseOwnerId;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function toSubmissionContent(
  value: DbTaskSubmission["content"],
): TaskSubmission["content"] {
  return value as unknown as TaskSubmission["content"];
}

async function getCourseRecords() {
  return prisma.course.findMany({
    include: {
      owner: {
        select: {
          id: true,
          githubNickname: true,
          displayName: true,
        },
      },
      lessons: {
        orderBy: { order: "asc" },
        include: {
          assets: {
            orderBy: { createdAt: "asc" },
          },
          tasks: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

async function getOwnerDashboardSubmissionRecords(courseId: string, studentIds: string[]) {
  return prisma.taskSubmission.findMany({
    where: {
      courseId,
      userId: { in: studentIds },
    },
    include: {
      user: {
        select: {
          id: true,
          githubNickname: true,
          displayName: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

type CourseRecord = Awaited<ReturnType<typeof getCourseRecords>>[number];
type CourseRecordOwner = CourseRecord["owner"];
type CourseRecordLesson = CourseRecord["lessons"][number];
type CourseRecordAsset = CourseRecordLesson["assets"][number];
type CourseRecordTask = CourseRecordLesson["tasks"][number];
type OwnerDashboardSubmissionRecord = Awaited<
  ReturnType<typeof getOwnerDashboardSubmissionRecords>
>[number];

function mapOwner(owner: CourseRecordOwner): CourseOwner {
  return {
    id: owner.id,
    githubNickname: owner.githubNickname,
    displayName: owner.displayName,
  };
}

function mapAsset(asset: CourseRecordAsset): LessonAsset {
  return {
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
  };
}

function mapTask(task: CourseRecordTask, courseId: string): HomeworkTask {
  return {
    id: task.id,
    courseId,
    lessonId: task.lessonId,
    title: task.title,
    description: task.description,
    category: task.category,
    submissionType: task.submissionType,
    order: task.order,
    quizQuestions: toStringArray(task.quizQuestions),
    checklistItems: toStringArray(task.checklistItems),
    modelAnswer: task.modelAnswer ?? null,
    estimatedMinutes: task.estimatedMinutes ?? null,
  };
}

export function buildHomeworkSections(
  tasks: CourseRecordTask[],
  courseId: string,
): HomeworkSection[] {
  const sortedTasks = [...tasks].sort((left, right) => left.order - right.order);
  const lessonId = sortedTasks[0]?.lessonId ?? courseId;
  const requiredTasks = sortedTasks
    .filter((task) => task.category === "required")
    .map((task) => mapTask(task, courseId));
  const advancedTasks = sortedTasks
    .filter((task) => task.category === "advanced")
    .map((task) => mapTask(task, courseId));

  const sections: HomeworkSection[] = [];

  if (requiredTasks.length > 0) {
    sections.push({
      id: `required-${lessonId}`,
      category: "required",
      tasks: requiredTasks,
    });
  }

  if (advancedTasks.length > 0) {
    sections.push({
      id: `advanced-${lessonId}`,
      category: "advanced",
      tasks: advancedTasks,
    });
  }

  return sections;
}

function mapLesson(lesson: CourseRecordLesson, courseSlug: string): Lesson {
  return {
    id: lesson.id,
    courseId: lesson.courseId,
    courseSlug,
    slug: lesson.slug,
    number: lesson.order,
    order: lesson.order,
    title: lesson.title,
    subtitle: lesson.subtitle,
    description: lesson.description,
    learningGoals: toStringArray(lesson.learningGoals),
    contentType: lesson.contentType,
    contentHtml: lesson.contentHtml,
    pdfUrl: lesson.pdfUrl,
    videoUrl: lesson.videoUrl,
    isPublished: lesson.isPublished,
    unresolvedMediaSources: toStringArray(lesson.unresolvedMediaSources),
    assets: lesson.assets.map(mapAsset),
    homework: buildHomeworkSections(lesson.tasks, lesson.courseId),
  };
}

function mapCourseDetailRecord(course: CourseRecord, viewer: Viewer | null): CourseDetail {
  const canEdit = isOwnerOrAdmin(course.ownerId, viewer);
  const lessons = course.lessons
    .filter((lesson) => canEdit || lesson.isPublished)
    .map((lesson) => mapLesson(lesson, course.slug));
  const publishedLessons = course.lessons.filter((lesson) => lesson.isPublished);
  const totalTasks = publishedLessons.reduce((sum, lesson) => sum + lesson.tasks.length, 0);

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    coverImageUrl: course.coverImageUrl,
    status: course.status,
    owner: mapOwner(course.owner),
    lessonCount: course.lessons.length,
    publishedLessonCount: publishedLessons.length,
    totalTasks,
    updatedAt: course.updatedAt,
    createdAt: course.createdAt,
    lessons,
  };
}

function withProgress(course: CourseDetail, progress: CourseProgress | null): CourseCard {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    coverImageUrl: course.coverImageUrl,
    status: course.status,
    owner: course.owner,
    lessonCount: course.lessonCount,
    publishedLessonCount: course.publishedLessonCount,
    totalTasks: course.totalTasks,
    updatedAt: course.updatedAt,
    progress,
  };
}

function mapSubmission(record: DbTaskSubmission): TaskSubmission {
  return {
    id: record.id,
    userId: record.userId,
    courseId: record.courseId ?? "",
    taskId: record.taskId,
    lessonId: record.lessonId,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    content: toSubmissionContent(record.content),
  };
}

export async function getCourseCatalog(viewer: Viewer): Promise<CourseCard[]> {
  const courses = (await getCourseRecords())
    .filter((course) => course.status === "published")
    .map((course) => mapCourseDetailRecord(course, viewer));
  const submissions = await prisma.taskSubmission.findMany({
    where: {
      userId: viewer.id,
      courseId: { in: courses.map((course) => course.id) },
    },
    orderBy: { updatedAt: "desc" },
  });
  const mappedSubmissions = submissions.map(mapSubmission);

  return courses.map((course) =>
    withProgress(
      course,
      calculateCourseProgress(
        course,
        mappedSubmissions.filter((submission) => submission.courseId === course.id),
      ),
    ),
  );
}

export async function getStudioCourses(viewer: Viewer): Promise<CourseCard[]> {
  const courses = await getCourseRecords();
  const visibleCourses =
    viewer.role === "admin"
      ? courses
      : courses.filter((course) => course.ownerId === viewer.id);

  return visibleCourses.map((course) =>
    withProgress(mapCourseDetailRecord(course, viewer), null),
  );
}

export async function getCourseBySlugOrId(
  courseSlugOrId: string,
  viewer: Viewer | null,
): Promise<CourseDetail | null> {
  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id: courseSlugOrId }, { slug: courseSlugOrId }],
    },
    include: {
      owner: {
        select: {
          id: true,
          githubNickname: true,
          displayName: true,
        },
      },
      lessons: {
        orderBy: { order: "asc" },
        include: {
          assets: {
            orderBy: { createdAt: "asc" },
          },
          tasks: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!course) {
    return null;
  }

  if (course.status !== "published" && !isOwnerOrAdmin(course.ownerId, viewer)) {
    return null;
  }

  return mapCourseDetailRecord(course, viewer);
}

export async function getOverallStudentProgress(viewer: Viewer): Promise<OverallProgressSummary> {
  const publishedCourses = (await getCourseRecords())
    .filter((course) => course.status === "published")
    .map((course) => mapCourseDetailRecord(course, viewer));
  const submissions = await prisma.taskSubmission.findMany({
    where: {
      userId: viewer.id,
      courseId: { in: publishedCourses.map((course) => course.id) },
    },
  });

  return calculateOverallProgress(publishedCourses, submissions.map(mapSubmission));
}

export async function getAdminStudentSummaries(): Promise<AdminStudentSummary[]> {
  const users = await prisma.user.findMany({
    orderBy: { githubNickname: "asc" },
    select: {
      id: true,
      githubNickname: true,
      displayName: true,
      role: true,
      createdAt: true,
    },
  });
  const publishedCourses = (await getCourseRecords())
    .filter((course) => course.status === "published")
    .map((course) => mapCourseDetailRecord(course, null));
  const submissions = (await prisma.taskSubmission.findMany({
    where: { userId: { in: users.map((user) => user.id) } },
    orderBy: { updatedAt: "desc" },
  })).map(mapSubmission);

  return users.map((user) => {
    const userSubmissions = submissions.filter(
      (submission) => submission.userId === user.id,
    );
    return {
      user,
      progress: calculateOverallProgress(publishedCourses, userSubmissions),
      hasSubmissions: userSubmissions.length > 0,
    };
  });
}

export interface AdminStudentSubmissionEntry {
  submissionId: string;
  taskId: string;
  taskTitle: string;
  taskCategory: "required" | "advanced";
  submissionType: SubmissionType;
  lessonId: string;
  lessonNumber: number;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  status: SubmissionStatus;
  submittedAt: Date;
  content: SubmissionContent;
}

export async function getAdminStudentSubmissionsByNickname(
  githubNickname: string,
): Promise<AdminStudentSubmissionEntry[]> {
  const user = await prisma.user.findUnique({
    where: { githubNickname },
    select: { id: true },
  });
  if (!user) return [];

  const submissions = await prisma.taskSubmission.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const courses = (await getCourseRecords()).map((record) =>
    mapCourseDetailRecord(record, null),
  );

  const taskMetaById = new Map<
    string,
    {
      taskTitle: string;
      taskCategory: "required" | "advanced";
      submissionType: SubmissionType;
      lessonId: string;
      lessonNumber: number;
      lessonTitle: string;
      courseId: string;
      courseTitle: string;
    }
  >();
  for (const course of courses) {
    for (const lesson of course.lessons) {
      for (const section of lesson.homework) {
        for (const task of section.tasks) {
          taskMetaById.set(task.id, {
            taskTitle: task.title,
            taskCategory: task.category,
            submissionType: task.submissionType,
            lessonId: lesson.id,
            lessonNumber: lesson.number,
            lessonTitle: lesson.title,
            courseId: course.id,
            courseTitle: course.title,
          });
        }
      }
    }
  }

  return submissions
    .map((submission) => {
      const meta = taskMetaById.get(submission.taskId);
      if (!meta) return null;
      return {
        submissionId: submission.id,
        taskId: submission.taskId,
        taskTitle: meta.taskTitle,
        taskCategory: meta.taskCategory,
        submissionType: meta.submissionType,
        lessonId: meta.lessonId,
        lessonNumber: meta.lessonNumber,
        lessonTitle: meta.lessonTitle,
        courseId: meta.courseId,
        courseTitle: meta.courseTitle,
        status: submission.status,
        submittedAt: submission.updatedAt,
        content: toSubmissionContent(submission.content),
      };
    })
    .filter((entry): entry is AdminStudentSubmissionEntry => entry !== null);
}

export async function getAdminCourseSummaries(viewer: Viewer): Promise<AdminCourseSummary[]> {
  assertAdmin(viewer);

  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true },
  });
  const submissions = (await prisma.taskSubmission.findMany({
    where: {
      userId: { in: students.map((student) => student.id) },
      courseId: { not: null },
    },
  })).map(mapSubmission);
  const courses = await getCourseRecords();

  return courses.map((courseRecord) => {
    const course = mapCourseDetailRecord(courseRecord, null);
    const progressByStudent = students.map((student) =>
      calculateCourseProgress(
        course,
        submissions.filter(
          (submission) =>
            submission.userId === student.id && submission.courseId === course.id,
        ),
      ),
    );
    const averageCompletion =
      progressByStudent.length > 0
        ? Math.round(
            progressByStudent.reduce(
              (sum, progress) => sum + progress.completionPercentage,
              0,
            ) / progressByStudent.length,
          )
        : 0;

    return {
      course: withProgress(course, null),
      totalStudents: students.length,
      averageCompletion,
      studentsCompleted: progressByStudent.filter(
        (progress) => progress.totalTasks > 0 && progress.completedTasks === progress.totalTasks,
      ).length,
    };
  });
}

export async function getOwnerCourseDashboard(
  courseId: string,
  viewer: Viewer,
): Promise<OwnerCourseDashboard | null> {
  const course = await getCourseBySlugOrId(courseId, viewer);

  if (!course) {
    return null;
  }

  const courseRecord = await prisma.course.findUnique({
    where: { id: course.id },
    select: { ownerId: true },
  });

  if (!courseRecord || !isOwnerOrAdmin(courseRecord.ownerId, viewer)) {
    return null;
  }

  const students = await prisma.user.findMany({
    where: { role: "student" },
    orderBy: { githubNickname: "asc" },
    select: {
      id: true,
      githubNickname: true,
      displayName: true,
    },
  });
  const submissions = await getOwnerDashboardSubmissionRecords(
    course.id,
    students.map((student) => student.id),
  );

  const studentProgress: OwnerCourseStudentSummary[] = students.map((student) => ({
    user: student,
    progress: calculateCourseProgress(
      course,
      submissions
        .filter((submission) => submission.userId === student.id)
        .map(mapSubmission),
    ),
  }));
  const averageCompletion =
    studentProgress.length > 0
      ? Math.round(
          studentProgress.reduce(
            (sum, student) => sum + student.progress.completionPercentage,
            0,
          ) / studentProgress.length,
        )
      : 0;

  const taskTitleById = new Map(
    course.lessons
      .flatMap((lesson) =>
        lesson.homework.flatMap((section) =>
          section.tasks.map((task) => [task.id, { taskTitle: task.title, lesson }] as const),
        ),
      ),
  );

  const recentSubmissions: OwnerSubmissionSummary[] = submissions
    .slice(0, 20)
    .map((submission: OwnerDashboardSubmissionRecord) => {
      const taskMeta = taskTitleById.get(submission.taskId);

      return {
        submissionId: submission.id,
        taskId: submission.taskId,
        taskTitle: taskMeta?.taskTitle ?? "Task",
        lessonId: submission.lessonId,
        lessonTitle: taskMeta?.lesson.title ?? "Lesson",
        status: submission.status,
        submittedAt: submission.updatedAt,
        user: submission.user,
        content: toSubmissionContent(submission.content),
      };
    });

  return {
    course: withProgress(course, null),
    totalStudents: students.length,
    averageCompletion,
    students: studentProgress,
    recentSubmissions,
  };
}

export async function getCourseStatusOptions(): Promise<CourseStatus[]> {
  return ["draft", "published", "archived"];
}
