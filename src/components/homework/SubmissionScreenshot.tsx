"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ScreenshotContent } from "@/lib/types";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const FILE_NAME_RE = /^[\p{L}\p{N} ._\-()[\]+,]+$/u;

interface SubmissionScreenshotProps {
  taskId: string;
  value: ScreenshotContent | null;
  onChange: (content: ScreenshotContent | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
}

type Mode = "upload" | "url";

function isHttpUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

function sanitizeFileName(name: string): string {
  // Strip path traversal segments and trim to 255 chars; replace disallowed chars with "_".
  const base = name.split(/[\\/]/).pop() ?? name;
  return Array.from(base.slice(0, 255))
    .map((ch) => (FILE_NAME_RE.test(ch) ? ch : "_"))
    .join("");
}

export function SubmissionScreenshot({
  taskId,
  value,
  onChange,
  onUploadingChange,
  disabled,
}: SubmissionScreenshotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Mode reflects how the current value was provided. Starts in "upload" if there is
  // no value, otherwise infers from value shape — but once the user picks a tab, we keep it.
  const [mode, setMode] = useState<Mode>("upload");
  const [pickedMode, setPickedMode] = useState(false);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  useEffect(() => {
    return () => {
      onUploadingChange?.(false);
    };
  }, [onUploadingChange]);

  function switchMode(next: Mode) {
    if (uploading || disabled) return;
    if (next === mode) return;
    setPickedMode(true);
    setMode(next);
    setUploadError(null);
    // Clear the value on mode switch — keeps "current tab = current value source" invariant.
    if (value) onChange(null);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file (PNG, JPG, GIF, WEBP).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setUploadError("File is over 10 MB. Please use a smaller screenshot.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const fileName = sanitizeFileName(file.name);

    setUploading(true);
    try {
      const blob = await upload(fileName, file, {
        access: "public",
        handleUploadUrl: "/api/homework/uploads",
        clientPayload: JSON.stringify({ taskId, fileName }),
      });

      onChange({
        type: "screenshot",
        fileUrl: blob.url,
        fileName,
      });
      if (!pickedMode) setMode("upload");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Upload failed. Try again.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleRemove() {
    onChange(null);
    setUploadError(null);
  }

  const hasUploadedFile = mode === "upload" && !!value?.fileUrl;
  const hasUrlValue = mode === "url" && !!value?.fileUrl;
  const urlIsValid = !value?.fileUrl || isHttpUrl(value.fileUrl);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => switchMode("upload")}
          disabled={disabled || uploading}
          className={`flex-1 rounded-md px-3 py-1.5 transition-colors ${
            mode === "upload"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Upload file
        </button>
        <button
          type="button"
          onClick={() => switchMode("url")}
          disabled={disabled || uploading}
          className={`flex-1 rounded-md px-3 py-1.5 transition-colors ${
            mode === "url"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Paste URL
        </button>
      </div>

      {mode === "upload" ? (
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || uploading}
            className="hidden"
          />
          {hasUploadedFile ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm text-gray-800">
                  {value?.fileName}
                </span>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || uploading}
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || uploading}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
            >
              {uploading ? "Uploading…" : "Choose file"}
            </Button>
          )}
          <p className="text-xs text-gray-400">PNG, JPG, GIF, WEBP — up to 10 MB.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <Input
            label="Image URL"
            placeholder="https://imgur.com/... or any image URL"
            value={hasUrlValue ? (value?.fileUrl ?? "") : ""}
            onChange={(e) => {
              const url = e.target.value;
              if (uploadError) setUploadError(null);
              if (!url) {
                onChange(null);
                return;
              }
              onChange({
                type: "screenshot",
                fileUrl: url,
                fileName: sanitizeFileName(url.split("/").pop() || "screenshot"),
              });
            }}
            disabled={disabled || uploading}
            error={
              hasUrlValue && !urlIsValid
                ? "Must be a public http(s) link."
                : undefined
            }
          />
          <p className="text-xs text-gray-400">
            Paste a public link to an image (Imgur, Google Drive, Dropbox…).
          </p>
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-600">{uploadError}</p>
      )}
    </div>
  );
}
