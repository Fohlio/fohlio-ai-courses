"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

type CodeFillBlank = {
  id: string;
  placeholder?: string;
  answer: string;
  accept?: string[];
};

type CodeFillConfig = {
  language: "ts" | "js" | "py" | "sql" | "bash";
  code: string;
  blanks: CodeFillBlank[];
};

export type CodeFillState = {
  answers: Record<string, string>;
};

type Segment =
  | { kind: "text"; value: string }
  | { kind: "blank"; id: string };

function normalizeConfig(raw: unknown): CodeFillConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const code = typeof obj.code === "string" ? obj.code : null;
  const blanksRaw = Array.isArray(obj.blanks) ? obj.blanks : null;
  if (!code || !blanksRaw) return null;
  const blanks: CodeFillBlank[] = [];
  for (const b of blanksRaw) {
    if (!b || typeof b !== "object") return null;
    const bObj = b as Record<string, unknown>;
    if (typeof bObj.id !== "string" || typeof bObj.answer !== "string") return null;
    blanks.push({
      id: bObj.id,
      answer: bObj.answer,
      placeholder: typeof bObj.placeholder === "string" ? bObj.placeholder : undefined,
      accept: Array.isArray(bObj.accept)
        ? bObj.accept.filter((x): x is string => typeof x === "string")
        : undefined,
    });
  }
  const language =
    obj.language === "ts" ||
    obj.language === "js" ||
    obj.language === "py" ||
    obj.language === "sql" ||
    obj.language === "bash"
      ? obj.language
      : "ts";
  return { language, code, blanks };
}

function parseSegments(code: string): Segment[] {
  const out: Segment[] = [];
  const regex = /\{\{(\w+)\}\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(code)) !== null) {
    if (m.index > last) {
      out.push({ kind: "text", value: code.slice(last, m.index) });
    }
    out.push({ kind: "blank", id: m[1] });
    last = m.index + m[0].length;
  }
  if (last < code.length) {
    out.push({ kind: "text", value: code.slice(last) });
  }
  return out;
}

function isAnswerCorrect(blank: CodeFillBlank, value: string): boolean {
  const v = value.trim();
  if (v === blank.answer.trim()) return true;
  if (blank.accept) {
    for (const alt of blank.accept) {
      if (v === alt.trim()) return true;
    }
  }
  return false;
}

export const CodeFill: HomeworkWidget<CodeFillState> = ({
  config,
  initialState,
  disabled,
  onChange,
}: HomeworkWidgetProps<CodeFillState>) => {
  const normalized = useMemo(() => normalizeConfig(config), [config]);

  const defaultState: CodeFillState = useMemo(() => {
    const answers: Record<string, string> = {};
    if (normalized) {
      for (const b of normalized.blanks) answers[b.id] = "";
    }
    return { answers };
  }, [normalized]);

  const [state, setState] = useState<CodeFillState>(
    initialState ?? defaultState,
  );
  const [checked, setChecked] = useState(false);


  if (!normalized) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Configuration error: this code-fill task is missing <code>code</code> or{" "}
        <code>blanks</code>.
      </div>
    );
  }

  const segments = parseSegments(normalized.code);
  const allCorrect = normalized.blanks.every((b) =>
    isAnswerCorrect(b, state.answers[b.id] ?? ""),
  );

  function updateBlank(id: string, value: string) {
    if (disabled) return;
    const nextAnswers = { ...state.answers, [id]: value };
    const nextState: CodeFillState = { answers: nextAnswers };
    setState(nextState);
    setChecked(false);
    onChange({ state: nextState, completed: false });
  }

  function handleCheck() {
    if (disabled) return;
    setChecked(true);
    onChange({ state, completed: allCorrect });
  }

  return (
    <div
      className={cn(
        "space-y-3",
        disabled && "opacity-60 pointer-events-none",
      )}
    >
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-gray-900 p-3 font-mono text-sm text-gray-100">
        {segments.map((seg, idx) => {
          if (seg.kind === "text") {
            return <span key={idx}>{seg.value}</span>;
          }
          const blank = normalized.blanks.find((b) => b.id === seg.id);
          if (!blank) {
            return (
              <span key={idx} className="text-red-400">
                {`{{${seg.id}}}`}
              </span>
            );
          }
          const value = state.answers[blank.id] ?? "";
          const correct = isAnswerCorrect(blank, value);
          const showFeedback = checked && value.length > 0;
          return (
            <span key={idx} className="inline-flex items-center">
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                value={value}
                placeholder={blank.placeholder ?? `blank ${blank.id}`}
                onChange={(e) => updateBlank(blank.id, e.target.value)}
                disabled={disabled}
                aria-label={`Blank ${blank.id}`}
                style={{
                  width: `${Math.max(
                    8,
                    (blank.placeholder?.length ?? blank.answer.length) + 2,
                  )}ch`,
                  minWidth: "80px",
                }}
                className={cn(
                  "mx-0.5 inline-block rounded border-b-2 bg-gray-800 px-1.5 py-0.5 font-mono text-sm text-gray-100 outline-none focus:border-brand",
                  showFeedback
                    ? correct
                      ? "border-green-400"
                      : "border-red-400"
                    : "border-gray-500",
                )}
              />
              {showFeedback && (
                <span
                  className={cn(
                    "ml-1 text-xs",
                    correct ? "text-green-400" : "text-red-400",
                  )}
                  aria-hidden
                >
                  {correct ? "✓" : "✗"}
                </span>
              )}
            </span>
          );
        })}
      </pre>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCheck}
          disabled={disabled}
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check
        </button>
        {checked && (
          <span
            className={cn(
              "text-sm font-medium",
              allCorrect ? "text-green-700" : "text-red-700",
            )}
            role="status"
          >
            {allCorrect
              ? "All blanks correct — well done."
              : "Not quite — fix the marked blanks and try again."}
          </span>
        )}
      </div>
    </div>
  );
};
