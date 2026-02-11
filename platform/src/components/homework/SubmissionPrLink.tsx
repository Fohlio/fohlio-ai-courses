"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface SubmissionPrLinkProps {
  taskId: string;
}

function SubmissionPrLink({ taskId }: SubmissionPrLinkProps) {
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (url.trim()) {
      setSaved(true);
      // No persistence yet - local state only
    }
  }

  return (
    <div className="flex flex-col gap-3" data-testid={`submission-pr-link-${taskId}`}>
      <Input
        label="GitHub PR URL"
        placeholder="https://github.com/org/repo/pull/123"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setSaved(false);
        }}
        data-testid="pr-link-input"
      />
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!url.trim()}
          data-testid="pr-link-save"
        >
          Save
        </Button>
        {saved && (
          <span className="text-xs text-success" data-testid="pr-link-saved-indicator">
            Saved
          </span>
        )}
      </div>
    </div>
  );
}

export { SubmissionPrLink };
export type { SubmissionPrLinkProps };
