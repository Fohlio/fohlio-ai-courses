"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";

interface RichHtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function splitHtmlDocument(source: string) {
  const match = source.match(/([\s\S]*?<body[^>]*>)([\s\S]*?)(<\/body>[\s\S]*)/i);

  if (!match) {
    return {
      prefix: "",
      body: source,
      suffix: "",
    };
  }

  return {
    prefix: match[1],
    body: match[2],
    suffix: match[3],
  };
}

function replaceBodyHtml(source: string, nextBody: string): string {
  const { prefix, suffix } = splitHtmlDocument(source);

  if (!prefix && !suffix) {
    return nextBody;
  }

  return `${prefix}${nextBody}${suffix}`;
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function RichHtmlEditor({ value, onChange }: RichHtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const { body } = splitHtmlDocument(value);

    if (editor.innerHTML !== body) {
      editor.innerHTML = body;
    }
  }, [value]);

  function syncEditor() {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    onChange(replaceBodyHtml(value, editor.innerHTML));
  }

  function runCommand(command: string, commandValue?: string) {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();
    document.execCommand(command, false, commandValue);
    syncEditor();
  }

  function insertLink() {
    const url = window.prompt("Enter a full URL");

    if (url?.trim()) {
      runCommand("createLink", url.trim());
    }
  }

  function insertImage() {
    const src = window.prompt("Enter an image filename or URL");

    if (src?.trim()) {
      runCommand(
        "insertHTML",
        `<img src="${escapeAttribute(src.trim())}" alt="" />`,
      );
    }
  }

  function insertVideo() {
    const src = window.prompt("Enter a video filename or URL");

    if (src?.trim()) {
      runCommand(
        "insertHTML",
        `<video controls preload="metadata"><source src="${escapeAttribute(src.trim())}" /></video>`,
      );
    }
  }

  function insertCodeBlock() {
    runCommand("insertHTML", "<pre><code>Code snippet</code></pre>");
  }

  return (
    <div className="rounded-xl border border-gray-200">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 bg-gray-50 px-3 py-3">
        <Button variant="ghost" size="sm" type="button" onClick={() => runCommand("formatBlock", "p")}>
          Paragraph
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={() => runCommand("formatBlock", "h2")}>
          H2
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={() => runCommand("formatBlock", "h3")}>
          H3
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={() => runCommand("bold")}>
          Bold
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={() => runCommand("italic")}>
          Italic
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={() => runCommand("insertUnorderedList")}>
          Bullet List
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={() => runCommand("insertOrderedList")}>
          Numbered List
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={() => runCommand("formatBlock", "blockquote")}>
          Quote
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={insertLink}>
          Link
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={insertImage}>
          Image
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={insertVideo}>
          Video
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={insertCodeBlock}>
          Code
        </Button>
      </div>

      <div className="border-b border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
        Visual mode edits the lesson body content. Head styles and document shell are preserved.
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncEditor}
        className="min-h-[620px] w-full rounded-b-xl px-5 py-4 text-sm text-gray-900 focus:outline-none [&_blockquote]:border-l-4 [&_blockquote]:border-brand/30 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-gray-950 [&_pre]:p-4 [&_pre]:text-gray-100 [&_ul]:list-disc [&_ul]:pl-6 [&_video]:max-w-full"
      />
    </div>
  );
}
