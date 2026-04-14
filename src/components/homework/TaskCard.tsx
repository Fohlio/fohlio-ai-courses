"use client";

import { useState } from "react";
import type { HomeworkTask, SubmissionContent } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SubmissionPrLink } from "./SubmissionPrLink";
import { SubmissionScreenshot } from "./SubmissionScreenshot";
import { SubmissionText } from "./SubmissionText";
import { SubmissionQuiz } from "./SubmissionQuiz";
import { SubmissionChecklist } from "./SubmissionChecklist";

const TYPE_LABELS: Record<string, string> = {
  pr_link: "PR Link",
  screenshot: "Screenshot",
  text: "Text",
  quiz: "Quiz",
  checklist: "Checklist",
};

function isContentValid(content: SubmissionContent | null): boolean {
  if (!content) return false;
  switch (content.type) {
    case "pr_link":
      return !!content.url?.trim();
    case "screenshot":
      return !!content.fileUrl?.trim();
    case "text":
      return !!content.text?.trim();
    case "quiz":
      return content.answers?.some((a) => a.answer?.trim()) ?? false;
    case "checklist":
      return content.items?.some((i) => i.checked) ?? false;
    default:
      return false;
  }
}

interface TaskCardProps {
  task: HomeworkTask;
  lessonId: string;
  initialSubmission: {
    status: string;
    content: SubmissionContent;
  } | null;
}

export function TaskCard({ task, lessonId, initialSubmission }: TaskCardProps) {
  const [content, setContent] = useState<SubmissionContent | null>(
    (initialSubmission?.content as SubmissionContent) ?? null,
  );
  const [mode, setMode] = useState<"editing" | "submitted">(
    initialSubmission?.status === "submitted" ? "submitted" : "editing",
  );
  const [saving, setSaving] = useState(false);

  const disabled = mode === "submitted";

  async function handleSubmit() {
    if (!content || !isContentValid(content)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/submissions/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          content,
          completed: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMode("submitted");
    } catch {
      alert("Failed to save submission. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{task.title}</p>
          <p className="mt-1 text-sm text-gray-500">{task.description}</p>
        </div>
        <Badge variant="gray">{TYPE_LABELS[task.submissionType]}</Badge>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        {task.submissionType === "pr_link" && (
          <SubmissionPrLink
            value={content?.type === "pr_link" ? content : null}
            onChange={setContent}
            disabled={disabled}
          />
        )}
        {task.submissionType === "screenshot" && (
          <SubmissionScreenshot
            value={content?.type === "screenshot" ? content : null}
            onChange={setContent}
            disabled={disabled}
          />
        )}
        {task.submissionType === "text" && (
          <SubmissionText
            value={content?.type === "text" ? content : null}
            onChange={setContent}
            disabled={disabled}
          />
        )}
        {task.submissionType === "quiz" && (
          <SubmissionQuiz
            questions={task.quizQuestions ?? []}
            value={content?.type === "quiz" ? content : null}
            onChange={setContent}
            disabled={disabled}
          />
        )}
        {task.submissionType === "checklist" && (
          <SubmissionChecklist
            items={task.checklistItems ?? []}
            value={content?.type === "checklist" ? content : null}
            onChange={setContent}
            disabled={disabled}
          />
        )}
      </div>

      <div className="mt-3 flex justify-end">
        {mode === "submitted" ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMode("editing")}
          >
            Edit
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!isContentValid(content) || saving}
          >
            Submit
          </Button>
        )}
      </div>
    </Card>
  );
}
