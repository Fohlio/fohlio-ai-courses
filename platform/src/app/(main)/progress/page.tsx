"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { LESSONS } from "@/lib/constants";
import { MOCK_STUDENTS } from "@/lib/mock-data";
import { getProgressPercentage } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { LessonStatus, StudentProgress } from "@/lib/types";

const STATUS_BADGE_MAP: Record<
  LessonStatus,
  { label: string; variant: "gray" | "warning" | "success" }
> = {
  not_started: { label: "Not Started", variant: "gray" },
  in_progress: { label: "In Progress", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
};

function ProgressDashboard({ progress }: { progress: StudentProgress }) {
  const overallPercentage = getProgressPercentage(
    progress.completedTasks,
    progress.totalTasks
  );

  return (
    <div data-testid="progress-dashboard">
      {/* Top stats row */}
      <div
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        data-testid="progress-stats"
      >
        <Card>
          <p className="text-sm font-medium text-gray-500">
            Lessons Completed
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {progress.completedLessons}
            <span className="text-base font-normal text-gray-400">
              /{progress.totalLessons}
            </span>
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {progress.completedTasks}
            <span className="text-base font-normal text-gray-400">
              /{progress.totalTasks}
            </span>
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-gray-500">Overall</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {overallPercentage}%
          </p>
          <ProgressBar
            value={overallPercentage}
            size="sm"
            color="brand"
            className="mt-2"
          />
        </Card>
      </div>

      {/* Lessons table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table
          className="w-full text-left text-sm"
          data-testid="progress-lessons-table"
        >
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 font-medium text-gray-600">#</th>
              <th className="px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">
                Required
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">
                Advanced
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {LESSONS.map((lesson) => {
              const lp = progress.lessonProgress.find(
                (p) => p.lessonId === lesson.id
              );
              const statusInfo = lp
                ? STATUS_BADGE_MAP[lp.status]
                : STATUS_BADGE_MAP.not_started;

              return (
                <tr
                  key={lesson.id}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  data-testid={`progress-lesson-row-${lesson.number}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {lesson.number}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/lessons/${lesson.slug}/homework`}
                      className="text-brand hover:underline"
                      data-testid={`progress-lesson-link-${lesson.slug}`}
                    >
                      {lesson.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {lp ? `${lp.requiredCompleted}/${lp.requiredTotal}` : "0/0"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {lp ? `${lp.advancedCompleted}/${lp.advancedTotal}` : "0/0"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12" data-testid="progress-page">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">My Progress</h1>
        <Card>
          <p className="text-center text-gray-500" data-testid="progress-login-prompt">
            Login to track your progress.
          </p>
        </Card>
      </div>
    );
  }

  // Find mock student data matching the logged-in user, or use the first mock student for demo
  const studentData = MOCK_STUDENTS.find(
    (s) => s.user.githubNickname === user.githubNickname
  );

  const progress: StudentProgress = studentData?.progress ?? {
    userId: user.id,
    githubNickname: user.githubNickname,
    displayName: user.displayName,
    totalLessons: 10,
    completedLessons: 0,
    totalTasks: 7,
    completedTasks: 0,
    completionPercentage: 0,
    lessonProgress: LESSONS.map((lesson) => ({
      lessonId: lesson.id,
      lessonNumber: lesson.number,
      totalTasks: 0,
      completedTasks: 0,
      requiredTotal: 0,
      requiredCompleted: 0,
      advancedTotal: 0,
      advancedCompleted: 0,
      status: "not_started" as const,
    })),
    lastActivityAt: null,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12" data-testid="progress-page">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Progress</h1>
      <ProgressDashboard progress={progress} />
    </div>
  );
}
