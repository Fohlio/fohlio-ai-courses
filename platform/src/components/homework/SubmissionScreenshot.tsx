"use client";

import { useRef } from "react";

interface SubmissionScreenshotProps {
  taskId: string;
}

function SubmissionScreenshot({ taskId }: SubmissionScreenshotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleZoneClick() {
    fileInputRef.current?.click();
  }

  return (
    <div
      className="flex flex-col gap-3"
      data-testid={`submission-screenshot-${taskId}`}
    >
      <button
        type="button"
        onClick={handleZoneClick}
        className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-colors hover:border-brand hover:bg-brand-light/20"
        data-testid="screenshot-drop-zone"
      >
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <span className="text-sm text-gray-500">
          Drop screenshot here or click to upload
        </span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        data-testid="screenshot-file-input"
      />
    </div>
  );
}

export { SubmissionScreenshot };
export type { SubmissionScreenshotProps };
