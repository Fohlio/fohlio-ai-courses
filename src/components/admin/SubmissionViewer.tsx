import type { SubmissionContent } from "@/lib/types";

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
        <div className="flex flex-col gap-2">
          <a
            href={content.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.fileUrl}
              alt={content.fileName || "screenshot"}
              className="max-h-96 w-full object-contain"
            />
          </a>
          <a
            href={content.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="break-all text-xs text-gray-500 hover:underline"
          >
            {content.fileName || content.fileUrl}
          </a>
        </div>
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

    default:
      return null;
  }
}
