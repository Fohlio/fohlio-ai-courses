import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getOverallStudentProgress } from "@/lib/courseQueries";
import { getUserXpSummary } from "@/lib/gamification";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [progress, xp, streak, badges] = await Promise.all([
    getOverallStudentProgress({ id: user.id, role: user.role }),
    getUserXpSummary(user.id),
    prisma.userStreak.findUnique({ where: { userId: user.id } }),
    prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
      orderBy: { awardedAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
        <p className="mt-1 text-gray-500">
          Track progress across every published course you are taking.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">Courses started</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {progress.courseProgress.filter((course) => course.completedTasks > 0).length}
            <span className="text-base font-normal text-gray-400">
              /{progress.totalCourses}
            </span>
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Tasks completed</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {progress.completedTasks}
            <span className="text-base font-normal text-gray-400">
              /{progress.totalTasks}
            </span>
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Overall completion</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {progress.completionPercentage}%
          </p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-gray-500">XP earned</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{xp.totalXp}</p>
          <p className="mt-1 text-xs text-gray-400">{xp.thisWeekXp} this week</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">
            Streak {streak?.optedIn ? "" : "(opt-in)"}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {streak?.optedIn ? `${streak.currentDays} days` : "off"}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {streak?.optedIn
              ? `longest ${streak.longestDays}`
              : "enable in settings"}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Badges</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{badges.length}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {badges.slice(0, 6).map((entry) => (
              <span
                key={entry.badgeId}
                title={entry.badge.description}
                className="inline-flex items-center rounded-full bg-brand-light/40 px-2 py-0.5 text-xs font-medium text-brand"
              >
                {entry.badge.title}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {progress.courseProgress.map((course) => (
          <Card key={course.courseId}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link
                  href={`/courses/${course.courseSlug}`}
                  className="text-lg font-semibold text-gray-900 hover:text-brand"
                >
                  {course.courseTitle}
                </Link>
                <p className="mt-1 text-sm text-gray-500">
                  {course.completedLessons}/{course.totalLessons} lessons complete
                </p>
              </div>
              <div className="min-w-40">
                <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{course.completedTasks}/{course.totalTasks} tasks</span>
                  <span>{course.completionPercentage}%</span>
                </div>
                <ProgressBar
                  value={course.completionPercentage}
                  size="sm"
                  color={
                    course.completionPercentage >= 80
                      ? "success"
                      : course.completionPercentage > 0
                        ? "brand"
                        : "warning"
                  }
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {course.lessonProgress.map((lesson) => (
                <Link
                  key={lesson.lessonId}
                  href={`/courses/${course.courseSlug}/lessons/${lesson.lessonSlug}/homework`}
                  className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 transition-colors hover:border-brand/30 hover:bg-brand-light/40"
                >
                  <p className="font-medium text-gray-900">
                    Lesson {lesson.lessonNumber}: {lesson.lessonTitle}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {lesson.completedTasks}/{lesson.totalTasks} tasks
                  </p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-brand">
                    Open Homework
                  </p>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
