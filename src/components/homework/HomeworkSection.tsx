"use client";

import { useEffect, useState } from "react";
import type {
  HomeworkSection as HomeworkSectionType,
  SubmissionContent,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { TaskCard } from "./TaskCard";

interface Submission {
  taskId: string;
  status: string;
  content: SubmissionContent;
}

interface HomeworkSectionProps {
  section: HomeworkSectionType;
  courseId: string;
  lessonId: string;
}

export function HomeworkSection({
  section,
  courseId,
  lessonId,
}: HomeworkSectionProps) {
  const [submissions, setSubmissions] = useState<Record<string, Submission>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/submissions?courseId=${courseId}&lessonId=${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, Submission> = {};
        for (const sub of data.submissions ?? []) {
          map[sub.taskId] = sub;
        }
        setSubmissions(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  const isRequired = section.category === "required";

  const submittedCount = section.tasks.reduce(
    (acc, task) =>
      acc + (submissions[task.id]?.status === "submitted" ? 1 : 0),
    0,
  );
  const total = section.tasks.length;
  const allDone = total > 0 && submittedCount >= total;

  return (
    <section className="space-y-4">
      {isRequired ? (
        <header className="flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-light/50 px-4 py-3">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
          >
            {allDone ? "✓" : "★"}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-brand">Required</h3>
            <p className="text-xs text-brand/70">
              Complete these to finish the lesson.
            </p>
          </div>
          {!loading && total > 0 && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                allDone
                  ? "bg-success-light text-success"
                  : "bg-white text-brand",
              )}
            >
              {submittedCount}/{total}
            </span>
          )}
        </header>
      ) : (
        <header className="flex items-center gap-2 border-l-2 border-gray-200 pl-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Advanced
          </h3>
          <span className="text-xs text-gray-400">· optional</span>
        </header>
      )}

      {loading ? (
        <p className="px-1 text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="space-y-3">
          {section.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              courseId={courseId}
              lessonId={lessonId}
              initialSubmission={submissions[task.id] ?? null}
            />
          ))}
        </div>
      )}
    </section>
  );
}
