"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getLessonBySlug, getAllHomeworkTasks } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import type { HomeworkTask, AdminStudentSummary } from "@/lib/types";

function hasStudentCompletedTask(
  student: AdminStudentSummary,
  lessonId: string,
  task: HomeworkTask,
  taskIndexInCategory: number,
): boolean {
  const lp = student.progress.lessonProgress.find(
    (p) => p.lessonId === lessonId,
  );
  if (!lp) return false;

  if (task.category === "required") {
    return taskIndexInCategory < lp.requiredCompleted;
  }
  return taskIndexInCategory < lp.advancedCompleted;
}

interface LessonCompletionPageProps {
  params: Promise<{ lessonSlug: string }>;
}

export default function LessonCompletionPage({
  params,
}: LessonCompletionPageProps) {
  const { lessonSlug } = use(params);
  const [students, setStudents] = useState<AdminStudentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress/all")
      .then((res) => res.json())
      .then((data) => setStudents(data.students ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const lesson = getLessonBySlug(lessonSlug);

  if (!lesson) {
    return (
      <div
        className="mx-auto max-w-5xl px-4 py-12"
        data-testid="lesson-not-found"
      >
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Lesson not found
        </h1>
        <p className="text-gray-500">
          No lesson with slug &ldquo;{lessonSlug}&rdquo; was found.
        </p>
      </div>
    );
  }

  const allTasks = getAllHomeworkTasks(lesson);

  if (allTasks.length === 0) {
    return (
      <div
        className="mx-auto max-w-5xl px-4 py-12"
        data-testid="lesson-completion-page"
      >
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Lesson {lesson.number}: {lesson.title}
        </h1>
        <Card>
          <p
            className="text-center text-gray-500"
            data-testid="lesson-no-tasks"
          >
            No homework tasks for this lesson.
          </p>
        </Card>
      </div>
    );
  }

  const requiredTasks = allTasks.filter((t) => t.category === "required");
  const advancedTasks = allTasks.filter((t) => t.category === "advanced");

  function getIndexInCategory(task: HomeworkTask): number {
    if (task.category === "required") {
      return requiredTasks.indexOf(task);
    }
    return advancedTasks.indexOf(task);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-5xl px-4 py-12"
      data-testid="lesson-completion-page"
    >
      <Link
        href="/admin"
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
        data-testid="lesson-completion-back-link"
      >
        &larr; Back to Admin Dashboard
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Lesson {lesson.number}: {lesson.title}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        {allTasks.length} homework task{allTasks.length !== 1 ? "s" : ""}{" "}
        &middot; {students.length} student{students.length !== 1 ? "s" : ""}
      </p>

      {students.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">No students registered yet.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table
            className="w-full text-left text-sm"
            data-testid="lesson-completion-table"
          >
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-600">Student</th>
                {allTasks.map((task, index) => (
                  <th
                    key={task.id}
                    className="px-4 py-3 text-center font-medium text-gray-600"
                    title={task.title}
                  >
                    <span className="block text-xs text-gray-400">
                      {task.category === "required" ? "Req" : "Adv"}
                    </span>
                    Task {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.user.id}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  data-testid={`lesson-student-row-${student.user.githubNickname}`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/students/${student.user.githubNickname}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {student.user.githubNickname}
                    </Link>
                  </td>
                  {allTasks.map((task) => {
                    const indexInCat = getIndexInCategory(task);
                    const completed = hasStudentCompletedTask(
                      student,
                      lesson.id,
                      task,
                      indexInCat,
                    );

                    return (
                      <td
                        key={task.id}
                        className="px-4 py-3 text-center"
                        data-testid={`cell-${student.user.githubNickname}-${task.id}`}
                      >
                        {completed ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-light text-success">
                            <svg
                              className="h-4 w-4"
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
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <svg
                              className="h-4 w-4"
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
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
