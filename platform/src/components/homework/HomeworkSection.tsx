"use client";

import { useEffect, useState } from "react";
import type {
  HomeworkSection as HomeworkSectionType,
  SubmissionContent,
} from "@/lib/types";
import { TaskCard } from "./TaskCard";

interface Submission {
  taskId: string;
  status: string;
  content: SubmissionContent;
}

interface HomeworkSectionProps {
  section: HomeworkSectionType;
  lessonId: string;
}

export function HomeworkSection({ section, lessonId }: HomeworkSectionProps) {
  const [submissions, setSubmissions] = useState<Record<string, Submission>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/submissions?lessonId=${lessonId}`)
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
  }, [lessonId]);

  const title =
    section.category === "required"
      ? "Required (for everyone)"
      : "Advanced (optional)";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="space-y-3">
          {section.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              lessonId={lessonId}
              initialSubmission={submissions[task.id] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
