import type { SubmissionContent } from "@/lib/types";
import { ScreenshotImage } from "./ScreenshotImage";

interface SubmissionViewerProps {
  content: SubmissionContent;
}

export function SubmissionViewer({ content }: SubmissionViewerProps) {
  switch (content.type) {
    case "pr_link":
      return (
        <a
          href={content.url}
          target="_blank"
          rel="noreferrer"
          className="break-all text-sm font-medium text-brand hover:underline"
        >
          {content.url}
        </a>
      );

    case "screenshot":
      return (
        <ScreenshotImage
          fileUrl={content.fileUrl}
          fileName={content.fileName || ""}
        />
      );

    case "text":
      return (
        <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
          {content.text}
        </div>
      );

    case "quiz":
      return (
        <ol className="space-y-3">
          {content.answers.map((answer) => (
            <li
              key={answer.questionIndex}
              className="rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <p className="text-sm font-medium text-gray-900">
                Q{answer.questionIndex + 1}. {answer.question}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {answer.answer || (
                  <span className="italic text-gray-400">No answer</span>
                )}
              </p>
            </li>
          ))}
        </ol>
      );

    case "checklist":
      return (
        <ul className="space-y-1">
          {content.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5">{item.checked ? "✅" : "⬜"}</span>
              <span className={item.checked ? "text-gray-800" : "text-gray-500"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      );

    case "widget":
      return (
        <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
            <span>Widget</span>
            <code className="font-mono text-gray-700">{content.widgetId}</code>
            <span
              className={
                content.completed
                  ? "rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700"
                  : "rounded-full bg-amber-100 px-2 py-0.5 text-amber-700"
              }
            >
              {content.completed ? "completed" : "in progress"}
            </span>
          </div>
          {content.reflection?.trim() && (
            <p className="whitespace-pre-wrap text-gray-700">
              {content.reflection}
            </p>
          )}
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer">Raw state</summary>
            <pre className="mt-2 overflow-x-auto rounded bg-white p-2 font-mono text-[11px] leading-snug text-gray-700">
              {JSON.stringify(content.state, null, 2)}
            </pre>
          </details>
        </div>
      );

    default:
      return null;
  }
}
