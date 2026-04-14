import type {
  CourseDetail,
  CourseProgress,
  HomeworkTask,
  Lesson,
  LessonProgress,
  LessonStatus,
  OverallProgressSummary,
  TaskSubmission,
} from "./types";

function getLessonTasks(lesson: Lesson): HomeworkTask[] {
  return lesson.homework.flatMap((section) => section.tasks);
}

function getVisibleLessons(course: CourseDetail): Lesson[] {
  return course.lessons.filter((lesson) => lesson.isPublished);
}

export function calculateLessonProgress(
  courseId: string,
  lesson: Lesson,
  submissions: TaskSubmission[],
): LessonProgress {
  const tasks = getLessonTasks(lesson);
  const requiredTasks = tasks.filter((task) => task.category === "required");
  const advancedTasks = tasks.filter((task) => task.category === "advanced");
  const completedIds = new Set(
    submissions.filter((submission) => submission.status === "submitted").map((submission) => submission.taskId),
  );
  const requiredCompleted = requiredTasks.filter((task) => completedIds.has(task.id)).length;
  const advancedCompleted = advancedTasks.filter((task) => completedIds.has(task.id)).length;
  const completedTasks = requiredCompleted + advancedCompleted;
  const totalTasks = tasks.length;

  let status: LessonStatus = "not_started";

  if (completedTasks > 0 && completedTasks < totalTasks) {
    status = "in_progress";
  } else if (totalTasks > 0 && completedTasks === totalTasks) {
    status = "completed";
  }

  return {
    courseId,
    lessonId: lesson.id,
    lessonSlug: lesson.slug,
    lessonNumber: lesson.number,
    lessonTitle: lesson.title,
    totalTasks,
    completedTasks,
    requiredTotal: requiredTasks.length,
    requiredCompleted,
    advancedTotal: advancedTasks.length,
    advancedCompleted,
    status,
  };
}

export function calculateCourseProgress(
  course: CourseDetail,
  submissions: TaskSubmission[],
): CourseProgress {
  const visibleLessons = getVisibleLessons(course);
  const lessonProgress = visibleLessons.map((lesson) =>
    calculateLessonProgress(
      course.id,
      lesson,
      submissions.filter((submission) => submission.lessonId === lesson.id),
    ),
  );

  const totalTasks = lessonProgress.reduce((sum, lesson) => sum + lesson.totalTasks, 0);
  const completedTasks = lessonProgress.reduce((sum, lesson) => sum + lesson.completedTasks, 0);
  const completedLessons = lessonProgress.filter((lesson) => lesson.status === "completed").length;

  const lastActivityAt =
    submissions.length > 0
      ? submissions.reduce(
          (latest, submission) =>
            submission.updatedAt > latest ? submission.updatedAt : latest,
          submissions[0].updatedAt,
        )
      : null;

  return {
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    totalLessons: visibleLessons.length,
    completedLessons,
    totalTasks,
    completedTasks,
    completionPercentage:
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    lessonProgress,
    lastActivityAt,
  };
}

export function calculateOverallProgress(
  courses: CourseDetail[],
  submissions: TaskSubmission[],
): OverallProgressSummary {
  const publishedCourses = courses.filter((course) => course.status === "published");
  const courseProgress = publishedCourses.map((course) =>
    calculateCourseProgress(
      course,
      submissions.filter((submission) => submission.courseId === course.id),
    ),
  );

  const totalTasks = courseProgress.reduce((sum, course) => sum + course.totalTasks, 0);
  const completedTasks = courseProgress.reduce(
    (sum, course) => sum + course.completedTasks,
    0,
  );
  const completedCourses = courseProgress.filter(
    (course) => course.totalTasks > 0 && course.completedTasks === course.totalTasks,
  ).length;

  return {
    totalCourses: courseProgress.length,
    completedCourses,
    totalTasks,
    completedTasks,
    completionPercentage:
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    courseProgress,
  };
}
