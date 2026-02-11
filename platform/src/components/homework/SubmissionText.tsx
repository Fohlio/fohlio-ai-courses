"use client";

import type { TextContent } from "@/lib/types";

interface SubmissionTextProps {
  value: TextContent | null;
  onChange: (content: TextContent) => void;
  disabled?: boolean;
}

export function SubmissionText({
  value,
  onChange,
  disabled,
}: SubmissionTextProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">Your answer</label>
      <textarea
        value={value?.text ?? ""}
        onChange={(e) => onChange({ type: "text", text: e.target.value })}
        placeholder="Type your answer here..."
        rows={4}
        disabled={disabled}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  );
}
