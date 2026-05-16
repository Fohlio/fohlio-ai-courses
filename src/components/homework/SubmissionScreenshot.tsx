"use client";

import { upload } from "@vercel/blob/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ScreenshotContent } from "@/lib/types";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
// Strict pathname charset — letters/digits/dot/dash/underscore only.
// Spaces and query-unsafe chars ([](),+ …) break the client-upload PUT:
// the pathname is signed into the token but URL-encoded in ?pathname=,
// and the two representations must round-trip identically.
const FILE_NAME_RE = /^[\p{L}\p{N}._-]+$/u;

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
  // Strip path-traversal segments, then slugify into a blob-safe pathname:
  // no spaces, no query-unsafe chars — those make the PUT to blob storage 400.
  const base = (name.split(/[\\/]/).pop() ?? name).slice(0, 200);
  const dot = base.lastIndexOf(".");
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const ext = dot > 0 ? base.slice(dot + 1) : "";
  const safeStem =
    stem
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "screenshot";
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  return safeExt ? `${safeStem}.${safeExt}` : safeStem;
}

function extForMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/gif") return "gif";
  if (mime === "image/webp") return "webp";
  return "png";
}

export function SubmissionScreenshot({
  taskId,
  value,
  onChange,
  onUploadingChange,
  disabled,
}: SubmissionScreenshotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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

  const uploadFile = useCallback(
    async (file: File) => {
      setUploadError(null);

      if (!file.type.startsWith("image/")) {
        setUploadError("Please choose an image file (PNG, JPG, GIF, WEBP).");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setUploadError("File is over 10 MB. Please use a smaller screenshot.");
        return;
      }

      const rawName =
        file.name && file.name !== "image.png"
          ? file.name
          : `screenshot-${Date.now()}.${extForMime(file.type)}`;
      const fileName = sanitizeFileName(rawName);

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
      }
    },
    [taskId, onChange, pickedMode],
  );

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDragEnter(event: React.DragEvent<HTMLDivElement>) {
    if (disabled || uploading) return;
    if (!event.dataTransfer?.types.includes("Files")) return;
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (disabled || uploading) return;
    if (!event.dataTransfer?.types.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    // Only clear when the cursor actually leaves the dropzone, not when it hovers a child.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setIsDragging(false);
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    if (disabled || uploading) return;
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  }

  // Paste support — drop zone listens for clipboard images while focused or hovered.
  useEffect(() => {
    if (mode !== "upload" || disabled) return;
    const node = dropZoneRef.current;
    if (!node) return;

    async function onPaste(event: ClipboardEvent) {
      if (uploading) return;
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            await uploadFile(file);
            return;
          }
        }
      }
    }

    node.addEventListener("paste", onPaste);
    return () => node.removeEventListener("paste", onPaste);
  }, [mode, disabled, uploading, uploadFile]);

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
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2">
              {/* biome-ignore lint/performance/noImgElement: external blob URL preview */}
              <img
                src={value?.fileUrl}
                alt={value?.fileName ?? "Screenshot preview"}
                className="h-16 w-16 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-800">
                  {value?.fileName}
                </p>
                <div className="mt-2 flex gap-2">
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
            </div>
          ) : (
            <div
              ref={dropZoneRef}
              tabIndex={disabled ? -1 : 0}
              role="button"
              aria-label="Drop a screenshot, paste from clipboard, or click to choose a file"
              onClick={() => {
                if (disabled || uploading) return;
                fileInputRef.current?.click();
              }}
              onKeyDown={(e) => {
                if (disabled || uploading) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                disabled || uploading
                  ? "cursor-not-allowed border-gray-200 bg-gray-50"
                  : isDragging
                    ? "cursor-copy border-blue-500 bg-blue-50"
                    : "cursor-pointer border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-7 w-7 ${isDragging ? "text-blue-500" : "text-gray-400"}`}
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-sm font-medium text-gray-700">
                {uploading
                  ? "Uploading…"
                  : isDragging
                    ? "Drop the image to upload"
                    : "Drag & drop a screenshot here"}
              </p>
              {!uploading && !isDragging && (
                <p className="text-xs text-gray-500">
                  or click to choose a file · paste with{" "}
                  <kbd className="rounded border border-gray-200 bg-gray-50 px-1 font-mono text-[10px] text-gray-600">
                    ⌘V
                  </kbd>
                </p>
              )}
            </div>
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
