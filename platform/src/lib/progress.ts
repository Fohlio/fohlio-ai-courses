import { LESSONS, getAllHomeworkTasks } from "./constants";
import type { LessonProgress, LessonStatus, StudentProgress } from "./types";

interface SubmissionRow {
  taskId: string;
  lessonId: string;
  status: string;
  updatedAt: Date;
}

export function calculateLessonProgress(
  lessonId: string,
  lessonNumber: number,
  submissions: SubmissionRow[],
): LessonProgress {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) {
    return {
      lessonId,
      lessonNumber,
      totalTasks: 0,
      completedTasks: 0,
      requiredTotal: 0,
      requiredCompleted: 0,
      advancedTotal: 0,
      advancedCompleted: 0,
      status: "not_started",
    };
  }

  const tasks = getAllHomeworkTasks(lesson);
  const requiredTasks = tasks.filter((t) => t.category === "required");
  const advancedTasks = tasks.filter((t) => t.category === "advanced");

  const completedIds = new Set(
    submissions.filter((s) => s.status === "submitted").map((s) => s.taskId),
  );

  const requiredCompleted = requiredTasks.filter((t) =>
    completedIds.has(t.id),
  ).length;
  const advancedCompleted = advancedTasks.filter((t) =>
    completedIds.has(t.id),
  ).length;

  const totalTasks = tasks.length;
  const completedTasks = requiredCompleted + advancedCompleted;

  let status: LessonStatus = "not_started";
  if (completedTasks > 0 && completedTasks < totalTasks) {
    status = "in_progress";
  } else if (totalTasks > 0 && completedTasks === totalTasks) {
    status = "completed";
  }

  return {
    lessonId,
    lessonNumber,
    totalTasks,
    completedTasks,
    requiredTotal: requiredTasks.length,
    requiredCompleted,
    advancedTotal: advancedTasks.length,
    advancedCompleted,
    status,
  };
}

export function calculateStudentProgress(
  userId: string,
  githubNickname: string,
  displayName: string | null,
  submissions: SubmissionRow[],
): StudentProgress {
  const lessonProgress = LESSONS.map((lesson) => {
    const lessonSubs = submissions.filter((s) => s.lessonId === lesson.id);
    return calculateLessonProgress(lesson.id, lesson.number, lessonSubs);
  });

  const totalTasks = lessonProgress.reduce((s, lp) => s + lp.totalTasks, 0);
  const completedTasks = lessonProgress.reduce(
    (s, lp) => s + lp.completedTasks,
    0,
  );
  const completedLessons = lessonProgress.filter(
    (lp) => lp.status === "completed",
  ).length;

  const lastActivityAt =
    submissions.length > 0
      ? submissions.reduce(
          (latest, s) => (s.updatedAt > latest ? s.updatedAt : latest),
          submissions[0].updatedAt,
        )
      : null;

  return {
    userId,
    githubNickname,
    displayName,
    totalLessons: LESSONS.length,
    completedLessons,
    totalTasks,
    completedTasks,
    completionPercentage:
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    lessonProgress,
    lastActivityAt,
  };
}
