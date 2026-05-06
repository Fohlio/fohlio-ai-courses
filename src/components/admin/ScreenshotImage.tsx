"use client";

import { useState } from "react";

interface ScreenshotImageProps {
  fileUrl: string;
  fileName: string;
}

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?.*)?$/i;

function transformUrl(url: string): { src: string; canEmbed: boolean } {
  try {
    const u = new URL(url);

    // Only allow http(s) — blocks javascript:, data:, file:, etc.
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { src: url, canEmbed: false };
    }

    // Google Drive — convert share link to thumbnail
    if (u.hostname.endsWith("drive.google.com")) {
      const match = u.pathname.match(/\/file\/d\/([^/]+)/);
      const id = match?.[1] ?? u.searchParams.get("id");
      if (id) {
        return {
          src: `https://drive.google.com/thumbnail?id=${id}&sz=w1600`,
          canEmbed: true,
        };
      }
      return { src: url, canEmbed: false };
    }

    // Dropbox — replace dl=0 with raw=1
    if (u.hostname.endsWith("dropbox.com")) {
      u.searchParams.set("raw", "1");
      u.searchParams.delete("dl");
      return { src: u.toString(), canEmbed: true };
    }

    // Direct image URL by extension
    if (IMAGE_EXTENSIONS.test(u.pathname)) {
      return { src: url, canEmbed: true };
    }

    // Imgur, raw image hosts — assume embeddable
    if (
      u.hostname.endsWith("imgur.com") ||
      u.hostname.endsWith("i.imgur.com") ||
      u.hostname.endsWith("postimg.cc") ||
      u.hostname.endsWith("ibb.co")
    ) {
      return { src: url, canEmbed: true };
    }

    return { src: url, canEmbed: false };
  } catch {
    return { src: url, canEmbed: false };
  }
}

function prettyFileName(fileUrl: string, fallback: string): string {
  if (fallback && !fallback.includes("?") && fallback !== "view") {
    return fallback;
  }
  try {
    const u = new URL(fileUrl);
    return u.hostname.replace(/^www\./, "") + u.pathname;
  } catch {
    return fileUrl;
  }
}

export function ScreenshotImage({ fileUrl, fileName }: ScreenshotImageProps) {
  const [errored, setErrored] = useState(false);
  const { src, canEmbed } = transformUrl(fileUrl);
  const label = prettyFileName(fileUrl, fileName);

  if (!canEmbed || errored) {
    const isUrl = /^https?:\/\//i.test(fileUrl);
    if (isUrl) {
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="break-all text-sm font-medium text-brand hover:underline"
        >
          {fileUrl}
        </a>
      );
    }
    return (
      <div className="whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
        {fileUrl}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
          className="max-h-96 w-full object-contain"
        />
      </a>
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="break-all text-xs text-gray-500 hover:underline"
      >
        {label}
      </a>
    </div>
  );
}
