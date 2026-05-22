"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

type QuestionOption = { id: string; label: string };

type Question = {
  id: string;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: string;
  rubric?: string;
};

type NormalizedConfig = {
  questions: Question[];
  minExplanationWords: number;
};

export type QuizExplainState = {
  answers: Record<string, { optionId: string | null; explanation: string }>;
  submitted: boolean;
};

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function normalize(config: Record<string, unknown>): NormalizedConfig | null {
  try {
    const raw = Array.isArray(config.questions) ? (config.questions as unknown[]) : [];
    if (raw.length === 0) return null;
    const minRaw = config.minExplanationWords;
    const minExplanationWords =
      typeof minRaw === "number" && minRaw > 0 ? Math.floor(minRaw) : 5;

    const questions: Question[] = raw.map((q) => {
      const r = q as Record<string, unknown>;
      const opts = Array.isArray(r.options) ? (r.options as Record<string, unknown>[]) : [];
      return {
        id: String(r.id),
        prompt: String(r.prompt ?? ""),
        correctOptionId: String(r.correctOptionId ?? ""),
        rubric: r.rubric != null ? String(r.rubric) : undefined,
        options: opts.map((o) => ({
          id: String(o.id),
          label: String(o.label ?? o.id),
        })),
      };
    });

    for (const q of questions) {
      if (!q.id || !q.prompt || q.options.length === 0 || !q.correctOptionId) return null;
      if (!q.options.some((o) => o.id === q.correctOptionId)) return null;
    }

    return { questions, minExplanationWords };
  } catch {
    return null;
  }
}

function defaultState(cfg: NormalizedConfig): QuizExplainState {
  const answers: QuizExplainState["answers"] = {};
  for (const q of cfg.questions) answers[q.id] = { optionId: null, explanation: "" };
  return { answers, submitted: false };
}

export function QuizExplain(props: HomeworkWidgetProps<QuizExplainState>) {
  const cfg = useMemo(() => normalize(props.config), [props.config]);
  if (!cfg) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Configuration error: quiz-explain widget is missing required fields.
      </div>
    );
  }
  return <QuizExplainInner {...props} cfg={cfg} />;
}

function QuizExplainInner({
  cfg,
  initialState,
  disabled,
  onChange,
}: HomeworkWidgetProps<QuizExplainState> & { cfg: NormalizedConfig }) {
  const [state, setState] = useState<QuizExplainState>(
    () => initialState ?? defaultState(cfg),
  );
  const [openId, setOpenId] = useState<string | null>(cfg.questions[0]?.id ?? null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  function answerOf(qid: string) {
    return state.answers[qid] ?? { optionId: null, explanation: "" };
  }

  const allFilled = cfg.questions.every((q) => {
    const a = answerOf(q.id);
    return (
      a.optionId !== null && countWords(a.explanation) >= cfg.minExplanationWords
    );
  });

  const correctCount = cfg.questions.filter((q) => {
    const a = answerOf(q.id);
    return (
      a.optionId === q.correctOptionId &&
      countWords(a.explanation) >= cfg.minExplanationWords
    );
  }).length;
  const allCorrect = correctCount === cfg.questions.length;
  const completed = state.submitted && allCorrect;

  useEffect(() => {
    onChangeRef.current({ state, completed });
  }, [state, completed]);

  function updateAnswer(
    qid: string,
    patch: Partial<{ optionId: string | null; explanation: string }>,
  ) {
    if (disabled) return;
    setState((s) => ({
      submitted: false,
      answers: {
        ...s.answers,
        [qid]: { ...answerOf(qid), ...patch },
      },
    }));
  }

  function submit() {
    if (disabled || !allFilled) return;
    setState((s) => ({ ...s, submitted: true }));
  }

  return (
    <div
      className={cn(
        "space-y-3",
        disabled && "opacity-60 pointer-events-none",
      )}
    >
      <ul className="space-y-2">
        {cfg.questions.map((q, idx) => {
          const a = answerOf(q.id);
          const open = openId === q.id;
          const words = countWords(a.explanation);
          const wordsOk = words >= cfg.minExplanationWords;
          const optionOk = a.optionId === q.correctOptionId;
          const rowCorrect = state.submitted && optionOk && wordsOk;
          const rowWrong = state.submitted && !(optionOk && wordsOk);

          return (
            <li
              key={q.id}
              className={cn(
                "overflow-hidden rounded-lg border bg-white",
                rowCorrect && "border-green-300",
                rowWrong && "border-red-300",
                !state.submitted && "border-gray-200",
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : q.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-gray-50"
                aria-expanded={open}
              >
                <span className="text-gray-400">Q{idx + 1}.</span>
                <span className="flex-1 text-gray-900">{q.prompt}</span>
                {state.submitted && (
                  <span
                    className={cn(
                      "font-mono",
                      rowCorrect ? "text-green-700" : "text-red-700",
                    )}
                    aria-label={rowCorrect ? "correct" : "wrong"}
                  >
                    {rowCorrect ? "✓" : "✗"}
                  </span>
                )}
                <span className="text-gray-400" aria-hidden>
                  {open ? "▾" : "▸"}
                </span>
              </button>

              {open && (
                <div className="border-t border-gray-100 px-3 py-3">
                  <fieldset className="space-y-1.5">
                    <legend className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                      Choose one
                    </legend>
                    {q.options.map((o) => {
                      const checked = a.optionId === o.id;
                      const isCorrectOpt = o.id === q.correctOptionId;
                      const highlight =
                        state.submitted &&
                        (isCorrectOpt
                          ? "border-green-400 bg-green-50"
                          : checked && !isCorrectOpt
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200");
                      return (
                        <label
                          key={o.id}
                          className={cn(
                            "flex min-h-8 cursor-pointer items-start gap-2 rounded-md border px-2 py-1.5 text-sm",
                            !state.submitted && "border-gray-200 hover:border-brand",
                            highlight,
                          )}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={o.id}
                            checked={checked}
                            onChange={() => updateAnswer(q.id, { optionId: o.id })}
                            disabled={disabled}
                            className="mt-0.5 h-4 w-4 text-brand focus:ring-brand/40"
                          />
                          <span className="flex-1 text-gray-800">{o.label}</span>
                        </label>
                      );
                    })}
                  </fieldset>

                  <div className="mt-3">
                    <label className="mb-1 block text-xs uppercase tracking-wide text-gray-500">
                      Explain your choice
                    </label>
                    <textarea
                      value={a.explanation}
                      onChange={(e) =>
                        updateAnswer(q.id, { explanation: e.target.value })
                      }
                      disabled={disabled}
                      rows={2}
                      placeholder={`At least ${cfg.minExplanationWords} words.`}
                      className={cn(
                        "block w-full rounded-md border bg-white px-2 py-1.5 text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-brand/40",
                        wordsOk ? "border-gray-300" : "border-gray-300",
                      )}
                    />
                    <div
                      className={cn(
                        "mt-1 text-xs",
                        wordsOk ? "text-green-700" : "text-gray-500",
                      )}
                    >
                      {words}/{cfg.minExplanationWords} words
                    </div>
                  </div>

                  {state.submitted && !rowCorrect && q.rubric && (
                    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                      <span className="font-semibold">Rubric:</span> {q.rubric}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !allFilled}
          className={cn(
            "min-h-8 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white",
            "hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          Submit quiz
        </button>
        {state.submitted &&
          (allCorrect ? (
            <span className="text-sm font-medium text-green-700">
              ✓ {correctCount}/{cfg.questions.length} — all correct.
            </span>
          ) : (
            <span className="text-sm font-medium text-red-700">
              {correctCount}/{cfg.questions.length} correct — review rubrics and resubmit.
            </span>
          ))}
      </div>
    </div>
  );
}

const _typecheck: HomeworkWidget<QuizExplainState> = QuizExplain;
void _typecheck;
