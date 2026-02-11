"use client";

import { useState } from "react";
import type { HomeworkTask } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
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

interface TaskCardProps {
  task: HomeworkTask;
}

export function TaskCard({ task }: TaskCardProps) {
  const [completed, setCompleted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{task.title}</p>
            <p className="mt-1 text-sm text-gray-500">{task.description}</p>
          </div>
        </div>
        <Badge variant="gray">{TYPE_LABELS[task.submissionType]}</Badge>
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Close" : "Submit"}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {task.submissionType === "pr_link" && (
            <SubmissionPrLink taskId={task.id} />
          )}
          {task.submissionType === "screenshot" && (
            <SubmissionScreenshot taskId={task.id} />
          )}
          {task.submissionType === "text" && (
            <SubmissionText taskId={task.id} />
          )}
          {task.submissionType === "quiz" && (
            <SubmissionQuiz
              taskId={task.id}
              questions={task.quizQuestions ?? []}
            />
          )}
          {task.submissionType === "checklist" && (
            <SubmissionChecklist
              taskId={task.id}
              items={task.checklistItems ?? []}
            />
          )}
        </div>
      )}
    </Card>
  );
}
