import type { AdminStudentSummary, LessonProgress, LessonStatus } from "./types";
import { LESSONS, getAllHomeworkTasks } from "./constants";

/**
 * Builds a LessonProgress entry for a given lesson.
 * `requiredDone` and `advancedDone` indicate how many tasks of each category
 * the student has completed.
 */
function buildLessonProgress(
  lessonId: string,
  lessonNumber: number,
  requiredTotal: number,
  requiredDone: number,
  advancedTotal: number,
  advancedDone: number
): LessonProgress {
  const totalTasks = requiredTotal + advancedTotal;
  const completedTasks = requiredDone + advancedDone;

  let status: LessonStatus = "not_started";
  if (completedTasks > 0 && completedTasks < totalTasks) {
    status = "in_progress";
  } else if (totalTasks > 0 && completedTasks === totalTasks) {
    status = "completed";
  } else if (totalTasks === 0) {
    status = "not_started";
  }

  return {
    lessonId,
    lessonNumber,
    totalTasks,
    completedTasks,
    requiredTotal,
    requiredCompleted: requiredDone,
    advancedTotal,
    advancedCompleted: advancedDone,
    status,
  };
}

/**
 * Builds lesson progress for all 10 lessons given completion data
 * for lesson 1 and lesson 2.
 */
function buildAllLessonProgress(
  lesson1Required: number,
  lesson2Required: number,
  lesson2Advanced: number
): LessonProgress[] {
  return LESSONS.map((lesson) => {
    const tasks = getAllHomeworkTasks(lesson);
    const requiredTasks = tasks.filter((t) => t.category === "required");
    const advancedTasks = tasks.filter((t) => t.category === "advanced");

    if (lesson.number === 1) {
      return buildLessonProgress(
        lesson.id,
        lesson.number,
        requiredTasks.length,
        lesson1Required,
        advancedTasks.length,
        0
      );
    }

    if (lesson.number === 2) {
      return buildLessonProgress(
        lesson.id,
        lesson.number,
        requiredTasks.length,
        lesson2Required,
        advancedTasks.length,
        lesson2Advanced
      );
    }

    // Lessons 3-10: no tasks
    return buildLessonProgress(
      lesson.id,
      lesson.number,
      requiredTasks.length,
      0,
      advancedTasks.length,
      0
    );
  });
}

function countCompleted(progress: LessonProgress[]): number {
  return progress.filter((lp) => lp.status === "completed").length;
}

function countTotalTasks(progress: LessonProgress[]): number {
  return progress.reduce((sum, lp) => sum + lp.totalTasks, 0);
}

function countCompletedTasks(progress: LessonProgress[]): number {
  return progress.reduce((sum, lp) => sum + lp.completedTasks, 0);
}

// ---------------------------------------------------------------
// Alice: 65% -- completed lesson 1 (2/2), lesson 2 partially (2/3 req + 1/2 adv) => 5/7 tasks => ~71%
// We'll target approximately 65% by adjusting: 2/2 req L1, 2/3 req L2, 1/2 adv L2 => 5/7 = 71%.
// Close enough -- the description says "approximately".
// ---------------------------------------------------------------
const aliceProgress = buildAllLessonProgress(2, 2, 1);
const aliceTotalTasks = countTotalTasks(aliceProgress);
const aliceCompletedTasks = countCompletedTasks(aliceProgress);

// ---------------------------------------------------------------
// Bob: 40% -- completed lesson 1 (2/2), lesson 2 (1/3 req, 0 adv) => 3/7 = 43%
// ---------------------------------------------------------------
const bobProgress = buildAllLessonProgress(2, 1, 0);
const bobTotalTasks = countTotalTasks(bobProgress);
const bobCompletedTasks = countCompletedTasks(bobProgress);

// ---------------------------------------------------------------
// Carol: 80% -- completed lesson 1 (2/2), lesson 2 (3/3 req + 2/2 adv) => 7/7 = 100%
// For ~80% overall we set lesson 2 to (3/3 req + 1/2 adv) => 6/7 = 86%
// ---------------------------------------------------------------
const carolProgress = buildAllLessonProgress(2, 3, 1);
const carolTotalTasks = countTotalTasks(carolProgress);
const carolCompletedTasks = countCompletedTasks(carolProgress);

// ---------------------------------------------------------------
// Dave: 20% -- lesson 1 (1/2), lesson 2 (0/3, 0/2) => 1/7 = 14%
// ---------------------------------------------------------------
const daveProgress = buildAllLessonProgress(1, 0, 0);
const daveTotalTasks = countTotalTasks(daveProgress);
const daveCompletedTasks = countCompletedTasks(daveProgress);

export const MOCK_STUDENTS: AdminStudentSummary[] = [
  {
    user: {
      id: "user-alice",
      githubNickname: "alice-dev",
      displayName: "Alice Johnson",
    },
    progress: {
      userId: "user-alice",
      githubNickname: "alice-dev",
      displayName: "Alice Johnson",
      totalLessons: 10,
      completedLessons: countCompleted(aliceProgress),
      totalTasks: aliceTotalTasks,
      completedTasks: aliceCompletedTasks,
      completionPercentage: Math.round(
        (aliceCompletedTasks / aliceTotalTasks) * 100
      ),
      lessonProgress: aliceProgress,
      lastActivityAt: new Date("2026-02-10T14:30:00"),
    },
  },
  {
    user: {
      id: "user-bob",
      githubNickname: "bob-coder",
      displayName: "Bob Smith",
    },
    progress: {
      userId: "user-bob",
      githubNickname: "bob-coder",
      displayName: "Bob Smith",
      totalLessons: 10,
      completedLessons: countCompleted(bobProgress),
      totalTasks: bobTotalTasks,
      completedTasks: bobCompletedTasks,
      completionPercentage: Math.round(
        (bobCompletedTasks / bobTotalTasks) * 100
      ),
      lessonProgress: bobProgress,
      lastActivityAt: new Date("2026-02-09T10:15:00"),
    },
  },
  {
    user: {
      id: "user-carol",
      githubNickname: "carol-tech",
      displayName: "Carol Martinez",
    },
    progress: {
      userId: "user-carol",
      githubNickname: "carol-tech",
      displayName: "Carol Martinez",
      totalLessons: 10,
      completedLessons: countCompleted(carolProgress),
      totalTasks: carolTotalTasks,
      completedTasks: carolCompletedTasks,
      completionPercentage: Math.round(
        (carolCompletedTasks / carolTotalTasks) * 100
      ),
      lessonProgress: carolProgress,
      lastActivityAt: new Date("2026-02-11T09:00:00"),
    },
  },
  {
    user: {
      id: "user-dave",
      githubNickname: "dave-frontend",
      displayName: "Dave Wilson",
    },
    progress: {
      userId: "user-dave",
      githubNickname: "dave-frontend",
      displayName: "Dave Wilson",
      totalLessons: 10,
      completedLessons: countCompleted(daveProgress),
      totalTasks: daveTotalTasks,
      completedTasks: daveCompletedTasks,
      completionPercentage: Math.round(
        (daveCompletedTasks / daveTotalTasks) * 100
      ),
      lessonProgress: daveProgress,
      lastActivityAt: new Date("2026-02-07T16:45:00"),
    },
  },
];
