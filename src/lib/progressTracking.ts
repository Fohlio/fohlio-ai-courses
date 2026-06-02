/**
 * progressTracking — DB-backed two-metric progress + resume logic (Edinburgh).
 *
 * Pure server reads over `prisma`. No writes, no throws on anonymous users.
 * Ported from the San Francisco reference (src/lib/gamification/courseProgress.ts)
 * and adapted to the Edinburgh schema (Series relation + Course.orderInSeries,
 * not a flat `seriesOrder` column).
 *
 * This module is the SINGLE SOURCE OF TRUTH for lesson completion. The PURE,
 * submission-array helper in `./courseProgress.ts` is kept untouched for the
 * admin/owner dashboards (which already feed it pre-loaded submissions).
 *
 * COMPLETION RULE (single source of truth):
 *   lesson.completed =
 *     (requiredTaskCount > 0 && submittedRequiredCount >= requiredTaskCount)
 *     || (requiredTaskCount === 0 && read === true)
 *
 * "read" = a LessonRead row exists for (userId, lessonId). Only REQUIRED tasks
 * count toward completion. 0-required lessons are completed on read. PDF/empty
 * lessons with no scroll-end sentinel are never auto-completed (read stays false).
 *
 * Anonymous (userId === null): submissions and reads are both zero; completed is
 * always false. No throws.
 *
 * TWO METRICS per course:
 *   homeworkPercent — round(completedLessonCount / totalLessons * 100); headline.
 *   readPercent     — round(readLessonCount / totalLessons * 100); secondary.
 *   `percent` is an alias of homeworkPercent for backward-compat callers.
 */

import { prisma } from "./prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Rich per-lesson status. `completed` is derived via isLessonCompleted. */
export interface LessonStatus {
  /** Single completion rule (required-task gate OR read for 0-required). */
  completed: boolean;
  /** A LessonRead row exists for this user+lesson (scrolled to end). */
  read: boolean;
  /** Count of the lesson's REQUIRED tasks the user has submitted. */
  submittedRequiredCount: number;
  /** Number of REQUIRED tasks on this lesson. */
  requiredTaskCount: number;
}

export interface CourseProgressMetrics {
  courseId: string;
  /** Number of published lessons. */
  totalLessons: number;
  /** Lessons where completed === true. */
  completedLessonCount: number;
  /** Lessons where read === true (includes completed lessons). */
  readLessonCount: number;
  /** homework% — round(completedLessonCount/totalLessons*100); 0 if total=0. Headline. */
  homeworkPercent: number;
  /** read% — round(readLessonCount/totalLessons*100); 0 if total=0. */
  readPercent: number;
  /** Backward-compat alias of homeworkPercent. */
  percent: number;
  /** Per-lesson status keyed by lessonId. */
  lessonStatusMap: Record<string, LessonStatus>;
}

export interface ResumeTarget {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
}

/** Returned when every lesson of every started/catalog course is complete. */
export interface AllCaughtUp {
  allCaughtUp: true;
}

/** Type guard: narrows a resume result to a concrete ResumeTarget. */
export function isResumeTarget(
  result: ResumeTarget | AllCaughtUp | null,
): result is ResumeTarget {
  return result !== null && !("allCaughtUp" in result);
}

export interface OverallProgress {
  /**
   * Started courses (≥1 LessonRead OR ≥1 TaskSubmission), restricted to
   * currently-published courses, ordered by most-recent activity (max of
   * latest readAt / submission.updatedAt).
   */
  courses: CourseProgressMetrics[];
  /** Total published lessons across started courses. */
  totalLessons: number;
  /** Total completed lessons across started courses. */
  totalCompleted: number;
  /** Total read lessons across started courses. */
  totalRead: number;
  /** round(totalCompleted/totalLessons*100); 0 if none. */
  homeworkPercent: number;
  /** round(totalRead/totalLessons*100); 0 if none. */
  readPercent: number;
}

// ---------------------------------------------------------------------------
// Completion rule — single source of truth
// ---------------------------------------------------------------------------

/**
 * The one completion rule. Only REQUIRED tasks count.
 *   - requiredTaskCount > 0  → completed iff submittedRequiredCount >= requiredTaskCount
 *   - requiredTaskCount === 0 → completed iff read
 */
export function isLessonCompleted(
  requiredTaskCount: number,
  submittedRequiredCount: number,
  read: boolean,
): boolean {
  if (requiredTaskCount > 0) {
    return submittedRequiredCount >= requiredTaskCount;
  }
  return read === true;
}

// ---------------------------------------------------------------------------
// Internal builder
// ---------------------------------------------------------------------------

type LessonWithRequiredTasks = {
  id: string;
  courseId: string;
  slug: string;
  order: number;
  title: string;
  tasks: Array<{ id: string }>;
};

function emptyCourseProgress(courseId: string): CourseProgressMetrics {
  return {
    courseId,
    totalLessons: 0,
    completedLessonCount: 0,
    readLessonCount: 0,
    homeworkPercent: 0,
    readPercent: 0,
    percent: 0,
    lessonStatusMap: {},
  };
}

function buildCourseProgress(
  courseId: string,
  lessons: LessonWithRequiredTasks[],
  submittedCountByLesson: Map<string, number>,
  readLessonIds: Set<string>,
): CourseProgressMetrics {
  const lessonStatusMap: Record<string, LessonStatus> = {};
  let completedLessonCount = 0;
  let readLessonCount = 0;

  for (const lesson of lessons) {
    const requiredTaskCount = lesson.tasks.length;
    const submittedRequiredCount = submittedCountByLesson.get(lesson.id) ?? 0;
    const read = readLessonIds.has(lesson.id);
    const completed = isLessonCompleted(
      requiredTaskCount,
      submittedRequiredCount,
      read,
    );

    lessonStatusMap[lesson.id] = {
      completed,
      read,
      submittedRequiredCount,
      requiredTaskCount,
    };

    if (completed) completedLessonCount += 1;
    if (read) readLessonCount += 1;
  }

  const totalLessons = lessons.length;
  const homeworkPercent =
    totalLessons > 0 ? Math.round((completedLessonCount / totalLessons) * 100) : 0;
  const readPercent =
    totalLessons > 0 ? Math.round((readLessonCount / totalLessons) * 100) : 0;

  return {
    courseId,
    totalLessons,
    completedLessonCount,
    readLessonCount,
    homeworkPercent,
    readPercent,
    percent: homeworkPercent,
    lessonStatusMap,
  };
}

// ---------------------------------------------------------------------------
// getCourseProgressForCourses — exactly 3 queries regardless of N
// ---------------------------------------------------------------------------

/**
 * Multi-course progress in exactly 3 queries:
 *   Q1: lesson.findMany (published, courseId IN courseIds, with required taskIds)
 *   Q2: taskSubmission.groupBy by lessonId (user's required-task submissions)
 *   Q3: lessonRead.groupBy by lessonId (user's reads)
 *
 * Anonymous (userId === null) → Q2/Q3 are skipped; all progress is zero. No throw.
 * Returns a Map<courseId, CourseProgressMetrics>; every requested courseId is
 * present (courses with no published lessons get a zero-progress entry).
 *
 * SECURITY: userId MUST come from the session. Never accept it from request input.
 */
export async function getCourseProgressForCourses(
  userId: string | null,
  courseIds: string[],
): Promise<Map<string, CourseProgressMetrics>> {
  if (courseIds.length === 0) return new Map();

  // Q1 — published lessons + their required task ids for all requested courses.
  const lessons = await prisma.lesson.findMany({
    where: { courseId: { in: courseIds }, isPublished: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      courseId: true,
      slug: true,
      order: true,
      title: true,
      tasks: {
        where: { category: "required" },
        select: { id: true },
      },
    },
  });

  const allLessonIds = lessons.map((l) => l.id);
  const allRequiredTaskIds = lessons.flatMap((l) => l.tasks.map((t) => t.id));

  // Q2 — required-task submission counts per lesson. Anonymous → skipped.
  const submissionGroups =
    userId && allRequiredTaskIds.length
      ? await prisma.taskSubmission.groupBy({
          by: ["lessonId"],
          where: { userId, taskId: { in: allRequiredTaskIds } },
          _count: { id: true },
        })
      : [];
  const submittedCountByLesson = new Map<string, number>(
    submissionGroups.map((g) => [g.lessonId, g._count.id]),
  );

  // Q3 — which lessons have been read. Anonymous → skipped.
  const readGroups =
    userId && allLessonIds.length
      ? await prisma.lessonRead.groupBy({
          by: ["lessonId"],
          where: { userId, lessonId: { in: allLessonIds } },
          _count: { id: true },
        })
      : [];
  const readLessonIds = new Set<string>(readGroups.map((g) => g.lessonId));

  // Partition lessons by courseId and build per-course metrics.
  const lessonsByCourse = new Map<string, LessonWithRequiredTasks[]>();
  for (const lesson of lessons) {
    const bucket = lessonsByCourse.get(lesson.courseId);
    if (bucket) {
      bucket.push(lesson);
    } else {
      lessonsByCourse.set(lesson.courseId, [lesson]);
    }
  }

  const result = new Map<string, CourseProgressMetrics>();
  for (const courseId of courseIds) {
    result.set(
      courseId,
      buildCourseProgress(
        courseId,
        lessonsByCourse.get(courseId) ?? [],
        submittedCountByLesson,
        readLessonIds,
      ),
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCourseProgress — single course (delegates to the batch)
// ---------------------------------------------------------------------------

/**
 * Per-course progress for one course. Anonymous → all counts zero.
 *
 * SECURITY: userId MUST come from the session.
 */
export async function getCourseProgress(
  userId: string | null,
  courseId: string,
): Promise<CourseProgressMetrics> {
  const map = await getCourseProgressForCourses(userId, [courseId]);
  return map.get(courseId) ?? emptyCourseProgress(courseId);
}

// ---------------------------------------------------------------------------
// getOverallProgress — all started courses
// ---------------------------------------------------------------------------

/**
 * Overall progress across STARTED courses.
 *
 * "started" = the user has ≥1 LessonRead OR ≥1 TaskSubmission in the course,
 * restricted to courses that are currently published (a course later set to
 * draft/archived must not surface here). Ordered by most-recent activity
 * (max of latest readAt / submission.updatedAt), descending.
 *
 * SECURITY: userId MUST come from the caller's session.
 */
export async function getOverallProgress(userId: string): Promise<OverallProgress> {
  // Two indexed reads; union into a courseId → most-recent-activity map.
  const [readRows, submissionRows] = await Promise.all([
    prisma.lessonRead.findMany({
      where: { userId },
      select: { courseId: true, readAt: true },
    }),
    prisma.taskSubmission.findMany({
      where: { userId },
      select: { courseId: true, updatedAt: true },
    }),
  ]);

  const activityByCourse = new Map<string, Date>();
  for (const r of readRows) {
    if (!r.courseId) continue;
    const current = activityByCourse.get(r.courseId);
    if (!current || r.readAt > current) activityByCourse.set(r.courseId, r.readAt);
  }
  for (const s of submissionRows) {
    if (!s.courseId) continue;
    const current = activityByCourse.get(s.courseId);
    if (!current || s.updatedAt > current) {
      activityByCourse.set(s.courseId, s.updatedAt);
    }
  }

  const activeCourseIds = Array.from(activityByCourse.keys());
  if (activeCourseIds.length === 0) {
    return {
      courses: [],
      totalLessons: 0,
      totalCompleted: 0,
      totalRead: 0,
      homeworkPercent: 0,
      readPercent: 0,
    };
  }

  // Restrict to currently-published courses.
  const publishedStarted = await prisma.course.findMany({
    where: { id: { in: activeCourseIds }, status: "published" },
    select: { id: true },
  });
  const startedCourseIds = publishedStarted.map((c) => c.id);
  if (startedCourseIds.length === 0) {
    return {
      courses: [],
      totalLessons: 0,
      totalCompleted: 0,
      totalRead: 0,
      homeworkPercent: 0,
      readPercent: 0,
    };
  }

  const progressMap = await getCourseProgressForCourses(userId, startedCourseIds);

  // Order by most-recent activity (descending).
  const sortedCourseIds = [...startedCourseIds].sort((a, b) => {
    const aTime = activityByCourse.get(a)?.getTime() ?? 0;
    const bTime = activityByCourse.get(b)?.getTime() ?? 0;
    return bTime - aTime;
  });

  const courses = sortedCourseIds
    .map((id) => progressMap.get(id))
    .filter((p): p is CourseProgressMetrics => p !== undefined);

  const totalLessons = courses.reduce((s, c) => s + c.totalLessons, 0);
  const totalCompleted = courses.reduce((s, c) => s + c.completedLessonCount, 0);
  const totalRead = courses.reduce((s, c) => s + c.readLessonCount, 0);

  return {
    courses,
    totalLessons,
    totalCompleted,
    totalRead,
    homeworkPercent:
      totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0,
    readPercent:
      totalLessons > 0 ? Math.round((totalRead / totalLessons) * 100) : 0,
  };
}

// ---------------------------------------------------------------------------
// Catalog loading + completion lookup shared by resume helpers
// ---------------------------------------------------------------------------

type CatalogCourse = {
  id: string;
  slug: string;
  title: string;
  lessons: Array<{
    id: string;
    slug: string;
    order: number;
    title: string;
    tasks: Array<{ id: string }>;
  }>;
};

/**
 * Load all published courses with their published lessons + required task ids,
 * in catalog order [series.order asc, orderInSeries asc, createdAt asc].
 */
async function loadPublishedCatalog(): Promise<CatalogCourse[]> {
  return prisma.course.findMany({
    where: { status: "published" },
    orderBy: [
      { series: { order: "asc" } },
      { orderInSeries: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      slug: true,
      title: true,
      lessons: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          slug: true,
          order: true,
          title: true,
          tasks: {
            where: { category: "required" },
            select: { id: true },
          },
        },
      },
    },
  });
}

/**
 * Build a (lessonId → isComplete) predicate for a loaded catalog, loading the
 * user's required-task submission counts and reads. Anonymous → everything
 * resolves incomplete (empty maps).
 */
async function buildCompletionLookup(
  userId: string | null,
  courses: CatalogCourse[],
): Promise<{
  isComplete: (requiredTaskCount: number, lessonId: string) => boolean;
  lessonToCourse: Map<string, string>;
  allLessonIds: string[];
}> {
  const allLessonIds = courses.flatMap((c) => c.lessons.map((l) => l.id));
  const allRequiredTaskIds = courses.flatMap((c) =>
    c.lessons.flatMap((l) => l.tasks.map((t) => t.id)),
  );

  const submissionGroups =
    userId && allRequiredTaskIds.length
      ? await prisma.taskSubmission.groupBy({
          by: ["lessonId"],
          where: { userId, taskId: { in: allRequiredTaskIds } },
          _count: { id: true },
        })
      : [];
  const submittedCountByLesson = new Map<string, number>(
    submissionGroups.map((g) => [g.lessonId, g._count.id]),
  );

  const readGroups =
    userId && allLessonIds.length
      ? await prisma.lessonRead.groupBy({
          by: ["lessonId"],
          where: { userId, lessonId: { in: allLessonIds } },
          _count: { id: true },
        })
      : [];
  const readLessonIds = new Set<string>(readGroups.map((g) => g.lessonId));

  const lessonToCourse = new Map<string, string>();
  for (const c of courses) {
    for (const l of c.lessons) lessonToCourse.set(l.id, c.id);
  }

  const isComplete = (requiredTaskCount: number, lessonId: string): boolean =>
    isLessonCompleted(
      requiredTaskCount,
      submittedCountByLesson.get(lessonId) ?? 0,
      readLessonIds.has(lessonId),
    );

  return { isComplete, lessonToCourse, allLessonIds };
}

/** First incomplete lesson of a course as a ResumeTarget, or null if complete. */
function firstIncompleteTarget(
  course: CatalogCourse,
  isComplete: (requiredTaskCount: number, lessonId: string) => boolean,
): ResumeTarget | null {
  const lesson = course.lessons.find((l) => !isComplete(l.tasks.length, l.id));
  if (!lesson) return null;
  return {
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    lessonId: lesson.id,
    lessonSlug: lesson.slug,
    lessonTitle: lesson.title,
  };
}

/**
 * Determine the active course id = most-recently-touched (max latest
 * TaskSubmission.createdAt vs latest LessonRead.readAt, mapped lesson→course).
 * Returns null for anonymous / zero-activity users.
 */
async function resolveActiveCourseId(
  userId: string | null,
  allLessonIds: string[],
  lessonToCourse: Map<string, string>,
): Promise<string | null> {
  if (!userId || allLessonIds.length === 0) return null;

  const [latestSubmission, latestRead] = await Promise.all([
    prisma.taskSubmission.findFirst({
      where: { userId, lessonId: { in: allLessonIds } },
      orderBy: { createdAt: "desc" },
      select: { lessonId: true, createdAt: true },
    }),
    prisma.lessonRead.findFirst({
      where: { userId, lessonId: { in: allLessonIds } },
      orderBy: { readAt: "desc" },
      select: { lessonId: true, readAt: true },
    }),
  ]);

  let activeLessonId: string | null = null;
  if (latestSubmission && latestRead) {
    activeLessonId =
      latestSubmission.createdAt >= latestRead.readAt
        ? latestSubmission.lessonId
        : latestRead.lessonId;
  } else if (latestSubmission) {
    activeLessonId = latestSubmission.lessonId;
  } else if (latestRead) {
    activeLessonId = latestRead.lessonId;
  }

  return activeLessonId ? (lessonToCourse.get(activeLessonId) ?? null) : null;
}

// ---------------------------------------------------------------------------
// getResumeTarget — first-incomplete gap / cross-course advance / all-caught-up
// ---------------------------------------------------------------------------

/**
 * Continue semantics:
 *   1. ACTIVE course = most-recently-touched (submission or read). Zero-activity
 *      or anonymous → first published course that has lessons.
 *   2. Return the GAP = first incomplete lesson of the active course.
 *   3. If the active course is fully complete, iterate remaining courses in
 *      catalog order and return the first incomplete lesson found.
 *   4. If everything is complete → { allCaughtUp: true }. Never replay lesson[0].
 *   5. null only if there are no published courses / no published lessons.
 *
 * SECURITY: userId MUST come from the caller's session.
 */
export async function getResumeTarget(
  userId: string | null,
): Promise<ResumeTarget | AllCaughtUp | null> {
  const courses = await loadPublishedCatalog();
  if (courses.length === 0) return null;
  if (courses.every((c) => c.lessons.length === 0)) return null;

  const { isComplete, lessonToCourse, allLessonIds } =
    await buildCompletionLookup(userId, courses);

  const activeCourseId = await resolveActiveCourseId(
    userId,
    allLessonIds,
    lessonToCourse,
  );

  // Active course = the touched one, else first course that has lessons.
  const activeCourse =
    (activeCourseId ? courses.find((c) => c.id === activeCourseId) : undefined) ??
    courses.find((c) => c.lessons.length > 0) ??
    null;

  if (!activeCourse) return null;

  // 1. Resume within the active course.
  const activeTarget = firstIncompleteTarget(activeCourse, isComplete);
  if (activeTarget) return activeTarget;

  // 2. Active course complete — advance through the rest of the catalog.
  for (const course of courses) {
    if (course.id === activeCourse.id) continue;
    const target = firstIncompleteTarget(course, isComplete);
    if (target) return target;
  }

  // 3. Everything complete.
  return { allCaughtUp: true };
}

// ---------------------------------------------------------------------------
// getNextLessonAfter — homework "Continue" button advance
// ---------------------------------------------------------------------------

/**
 * Next incomplete lesson AFTER a given lesson (used by the homework Continue
 * button on the lesson page).
 *
 *   1. Look at lessons AFTER `lessonId` (catalog order) in the SAME course and
 *      return the first that is not yet completed.
 *   2. If none remain in this course, fall back to the cross-course advance:
 *      iterate the catalog (in order) starting AFTER the current course and
 *      return the first incomplete lesson.
 *   3. If everything is complete → { allCaughtUp: true }.
 *   4. null if there are no published courses/lessons, or the lesson/course is
 *      not found in the published catalog.
 *
 * SECURITY: userId MUST come from the caller's session.
 */
export async function getNextLessonAfter(
  userId: string | null,
  courseId: string,
  lessonId: string,
): Promise<ResumeTarget | AllCaughtUp | null> {
  const courses = await loadPublishedCatalog();
  if (courses.length === 0) return null;

  const courseIndex = courses.findIndex((c) => c.id === courseId);
  if (courseIndex === -1) return null;

  const course = courses[courseIndex];
  const lessonIndex = course.lessons.findIndex((l) => l.id === lessonId);
  if (lessonIndex === -1) return null;

  const { isComplete } = await buildCompletionLookup(userId, courses);

  // 1. Remaining lessons in the same course, after the current one.
  for (let i = lessonIndex + 1; i < course.lessons.length; i += 1) {
    const lesson = course.lessons[i];
    if (!isComplete(lesson.tasks.length, lesson.id)) {
      return {
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        lessonId: lesson.id,
        lessonSlug: lesson.slug,
        lessonTitle: lesson.title,
      };
    }
  }

  // 2. Advance to subsequent courses in catalog order.
  for (let c = courseIndex + 1; c < courses.length; c += 1) {
    const target = firstIncompleteTarget(courses[c], isComplete);
    if (target) return target;
  }

  // 3. Nothing left to do.
  return { allCaughtUp: true };
}
