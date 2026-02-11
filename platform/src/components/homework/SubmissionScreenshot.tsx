"use client";

import { Input } from "@/components/ui/Input";
import type { ScreenshotContent } from "@/lib/types";

interface SubmissionScreenshotProps {
  value: ScreenshotContent | null;
  onChange: (content: ScreenshotContent) => void;
  disabled?: boolean;
}

export function SubmissionScreenshot({
  value,
  onChange,
  disabled,
}: SubmissionScreenshotProps) {
  return (
    <div className="flex flex-col gap-3">
      <Input
        label="Screenshot URL"
        placeholder="https://imgur.com/... or any image URL"
        value={value?.fileUrl ?? ""}
        onChange={(e) => {
          const url = e.target.value;
          onChange({
            type: "screenshot",
            fileUrl: url,
            fileName: url.split("/").pop() || "screenshot",
          });
        }}
        disabled={disabled}
      />
      <p className="text-xs text-gray-400">
        Paste a link to your screenshot (e.g. upload to Imgur, Google Drive, or
        any image host)
      </p>
    </div>
  );
}
