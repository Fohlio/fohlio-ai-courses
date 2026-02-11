"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { LESSONS, getAllHomeworkTasks } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { LessonStatus, AdminStudentSummary } from "@/lib/types";

const STATUS_BADGE_MAP: Record<
  LessonStatus,
  { label: string; variant: "gray" | "warning" | "success" }
> = {
  not_started: { label: "Not Started", variant: "gray" },
  in_progress: { label: "In Progress", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
};

function getTaskStatuses(
  lessonId: string,
  requiredCompleted: number,
  advancedCompleted: number,
) {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return [];

  const tasks = getAllHomeworkTasks(lesson);
  const requiredTasks = tasks.filter((t) => t.category === "required");
  const advancedTasks = tasks.filter((t) => t.category === "advanced");

  const statuses: {
    taskId: string;
    title: string;
    category: string;
    completed: boolean;
  }[] = [];

  requiredTasks.forEach((task, index) => {
    statuses.push({
      taskId: task.id,
      title: task.title,
      category: "required",
      completed: index < requiredCompleted,
    });
  });

  advancedTasks.forEach((task, index) => {
    statuses.push({
      taskId: task.id,
      title: task.title,
      category: "advanced",
      completed: index < advancedCompleted,
    });
  });

  return statuses;
}

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ githubNickname: string }>;
}) {
  const { githubNickname } = use(params);
  const [student, setStudent] = useState<AdminStudentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress/all")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.students ?? []).find(
          (s: AdminStudentSummary) =>
            s.user.githubNickname === githubNickname,
        );
        setStudent(found ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [githubNickname]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Student not found
        </h1>
        <p className="text-gray-500">
          No student with GitHub nickname &ldquo;{githubNickname}&rdquo; was
          found.
        </p>
        <Link
          href="/admin/students"
          className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
        >
          Back to Students
        </Link>
      </div>
    );
  }

  const { progress } = student;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <Link
          href="/admin/students"
          className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Students
        </Link>
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {student.user.githubNickname}
          </h1>
          {student.user.displayName && (
            <span className="text-lg text-gray-500">
              ({student.user.displayName})
            </span>
          )}
        </div>
        <div className="mt-4 flex items-center gap-4">
          <ProgressBar
            value={progress.completionPercentage}
            size="md"
            color={
              progress.completionPercentage >= 80
                ? "success"
                : progress.completionPercentage >= 40
                  ? "brand"
                  : "warning"
            }
            className="flex-1"
          />
          <span className="text-sm font-semibold text-gray-700">
            {progress.completionPercentage}%
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {progress.completedLessons} of {progress.totalLessons} lessons
          completed &middot; {progress.completedTasks} of {progress.totalTasks}{" "}
          tasks completed
        </p>
      </div>

      <div className="space-y-4">
        {LESSONS.map((lesson) => {
          const lp = progress.lessonProgress.find(
            (p) => p.lessonId === lesson.id,
          );
          const statusInfo = lp
            ? STATUS_BADGE_MAP[lp.status]
            : STATUS_BADGE_MAP.not_started;
          const hasTasks = (lp?.totalTasks ?? 0) > 0;
          const taskStatuses = lp
            ? getTaskStatuses(
                lesson.id,
                lp.requiredCompleted,
                lp.advancedCompleted,
              )
            : [];

          return (
            <Card key={lesson.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    <span className="mr-2 text-gray-400">
                      Lesson {lesson.number}
                    </span>
                    {lesson.title}
                  </h3>
                  {hasTasks && lp && (
                    <p className="mt-1 text-sm text-gray-500">
                      {lp.completedTasks}/{lp.totalTasks} tasks completed
                    </p>
                  )}
                </div>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>

              {hasTasks && taskStatuses.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  {taskStatuses.map((task) => (
                    <li
                      key={task.taskId}
                      className="flex items-center gap-3 text-sm"
                    >
                      {task.completed ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M20 12H4"
                            />
                          </svg>
                        </span>
                      )}
                      <span
                        className={
                          task.completed ? "text-gray-900" : "text-gray-500"
                        }
                      >
                        {task.title}
                      </span>
                      <Badge
                        variant={
                          task.category === "required" ? "default" : "gray"
                        }
                        className="ml-auto"
                      >
                        {task.category}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
