"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface SubmissionTextProps {
  taskId: string;
}

function SubmissionText({ taskId }: SubmissionTextProps) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (text.trim()) {
      setSaved(true);
      // No persistence yet - local state only
    }
  }

  return (
    <div className="flex flex-col gap-3" data-testid={`submission-text-${taskId}`}>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`text-submission-${taskId}`}
          className="text-sm font-medium text-gray-700"
        >
          Your answer
        </label>
        <textarea
          id={`text-submission-${taskId}`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSaved(false);
          }}
          placeholder="Type your answer here..."
          rows={4}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          data-testid="text-textarea"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!text.trim()}
          data-testid="text-save"
        >
          Save
        </Button>
        {saved && (
          <span className="text-xs text-success" data-testid="text-saved-indicator">
            Saved
          </span>
        )}
      </div>
    </div>
  );
}

export { SubmissionText };
export type { SubmissionTextProps };
