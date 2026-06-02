"use client";

import { useState } from "react";
import type { HomeworkTask, SubmissionContent, SubmissionType } from "@/lib/types";
import { Badge, type BadgeColor } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SubmissionPrLink } from "./SubmissionPrLink";
import { SubmissionScreenshot } from "./SubmissionScreenshot";
import { SubmissionText } from "./SubmissionText";
import { SubmissionQuiz } from "./SubmissionQuiz";
import { SubmissionChecklist } from "./SubmissionChecklist";
import { SubmissionWidget } from "./SubmissionWidget";

const TYPE_LABELS: Record<SubmissionType, string> = {
  pr_link: "Link",
  screenshot: "Screenshot",
  text: "Text",
  quiz: "Quiz",
  checklist: "Checklist",
  widget: "Interactive",
};

/** Color-code the type badge per submission type so kinds are scannable. */
const TYPE_BADGE_COLOR: Record<SubmissionType, BadgeColor> = {
  widget: "brand",
  pr_link: "accent",
  quiz: "warning",
  screenshot: "neutral",
  text: "neutral",
  checklist: "success",
};

const HTTP_URL_RE = /^https?:\/\/\S+$/i;

function isContentValid(content: SubmissionContent | null): boolean {
  if (!content) return false;
  switch (content.type) {
    case "pr_link":
      return !!content.url?.trim() && HTTP_URL_RE.test(content.url.trim());
    case "screenshot":
      return !!content.fileUrl?.trim() && HTTP_URL_RE.test(content.fileUrl.trim());
    case "text":
      return !!content.text?.trim();
    case "quiz":
      return content.answers?.some((a) => a.answer?.trim()) ?? false;
    case "checklist":
      return content.items?.some((i) => i.checked) ?? false;
    case "widget":
      return Boolean(content.completed);
    default:
      return false;
  }
}

interface TaskCardProps {
  task: HomeworkTask;
  courseId: string;
  lessonId: string;
  initialSubmission: {
    status: string;
    content: SubmissionContent;
  } | null;
}

export function TaskCard({
  task,
  courseId,
  lessonId,
  initialSubmission,
}: TaskCardProps) {
  const [content, setContent] = useState<SubmissionContent | null>(
    (initialSubmission?.content as SubmissionContent) ?? null,
  );
  const [mode, setMode] = useState<"editing" | "submitted">(
    initialSubmission?.status === "submitted" ? "submitted" : "editing",
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const disabled = mode === "submitted";

  async function handleSubmit() {
    if (!content || !isContentValid(content)) return;
    if (uploading) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/submissions/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
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

  const submitted = mode === "submitted";

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-0 transition-colors",
        submitted && "border-success/40",
      )}
    >
      {/* Left status rail: green when submitted, neutral otherwise. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          submitted ? "bg-success" : "bg-gray-200",
        )}
      />

      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {submitted && (
                <span
                  aria-hidden
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-light text-xs font-bold text-success"
                >
                  ✓
                </span>
              )}
              <p className="font-semibold text-gray-900">{task.title}</p>
            </div>
            <p className="mt-1 text-sm text-gray-500">{task.description}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge color={TYPE_BADGE_COLOR[task.submissionType]}>
              {TYPE_LABELS[task.submissionType]}
            </Badge>
            {typeof task.estimatedMinutes === "number" && (
              <span className="text-xs text-gray-400">
                ≈ {task.estimatedMinutes} min
              </span>
            )}
          </div>
        </div>

        {task.modelAnswer?.trim() && (
          <details className="group mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors open:border-brand/30 open:bg-brand-light/40">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-gray-700 group-open:text-brand">
              <span
                aria-hidden
                className="text-gray-400 transition-transform group-open:rotate-90 group-open:text-brand"
              >
                ▸
              </span>
              Model answer / self-check
            </summary>
            <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
              {task.modelAnswer}
            </p>
          </details>
        )}

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
            taskId={task.id}
            value={content?.type === "screenshot" ? content : null}
            onChange={setContent}
            onUploadingChange={setUploading}
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
        {task.submissionType === "widget" && (
          <SubmissionWidget
            taskId={task.id}
            widgetId={task.widgetId ?? null}
            widgetConfig={task.widgetConfig ?? null}
            value={content?.type === "widget" ? content : null}
            onChange={setContent}
            disabled={disabled}
          />
        )}
      </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          {submitted ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
              <span aria-hidden>✓</span> Submitted
            </span>
          ) : (
            <span />
          )}
          {submitted ? (
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
              disabled={!isContentValid(content) || saving || uploading}
            >
              {uploading ? "Uploading…" : saving ? "Submitting…" : "Submit"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
