"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LESSONS, getAllHomeworkTasks } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { AdminStudentSummary } from "@/lib/types";

export default function AdminLessonsPage() {
  const [students, setStudents] = useState<AdminStudentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress/all")
      .then((res) => res.json())
      .then((data) => setStudents(data.students ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Lessons</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Lessons</h1>

      <div className="space-y-4">
        {LESSONS.map((lesson) => {
          const tasks = getAllHomeworkTasks(lesson);
          const totalStudents = students.length;

          const completedCount = students.filter((s) => {
            const lp = s.progress.lessonProgress.find(
              (p) => p.lessonId === lesson.id,
            );
            return lp?.status === "completed";
          }).length;

          const completionPct =
            totalStudents > 0
              ? Math.round((completedCount / totalStudents) * 100)
              : 0;

          return (
            <Link key={lesson.id} href={`/admin/lessons/${lesson.slug}`}>
              <Card className="transition-colors hover:border-brand/30">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-400">
                        {lesson.number}.
                      </span>
                      <h3 className="font-semibold text-gray-900">
                        {lesson.title}
                      </h3>
                      {!lesson.isPublished && (
                        <Badge variant="gray">Draft</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                      {totalStudents > 0 && (
                        <> &middot; {completedCount}/{totalStudents} students completed</>
                      )}
                    </p>
                  </div>
                  <div className="ml-4 flex w-32 items-center gap-2">
                    <ProgressBar
                      value={completionPct}
                      size="sm"
                      color={
                        completionPct >= 80
                          ? "success"
                          : completionPct >= 40
                            ? "brand"
                            : "warning"
                      }
                      className="flex-1"
                    />
                    <span className="w-10 text-right text-xs font-medium text-gray-600">
                      {completionPct}%
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
