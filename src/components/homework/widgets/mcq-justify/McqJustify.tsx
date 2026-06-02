"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

type McqJustifyOption = { id: string; label: string };

type McqJustifyConfig = {
  question: string;
  options: McqJustifyOption[];
  correctOptionId: string;
  minJustificationWords: number;
  rubric?: string;
};

export type McqJustifyState = {
  chosenOptionId: string | null;
  justification: string;
};

function normalizeConfig(raw: unknown): McqJustifyConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.question !== "string") return null;
  if (typeof obj.correctOptionId !== "string") return null;
  if (!Array.isArray(obj.options) || obj.options.length === 0) return null;
  const options: McqJustifyOption[] = [];
  for (const o of obj.options) {
    if (!o || typeof o !== "object") return null;
    const opt = o as Record<string, unknown>;
    if (typeof opt.id !== "string" || typeof opt.label !== "string") return null;
    options.push({ id: opt.id, label: opt.label });
  }
  if (!options.some((o) => o.id === obj.correctOptionId)) return null;
  const minWords =
    typeof obj.minJustificationWords === "number" &&
    obj.minJustificationWords > 0
      ? Math.floor(obj.minJustificationWords)
      : 8;
  return {
    question: obj.question,
    options,
    correctOptionId: obj.correctOptionId,
    minJustificationWords: minWords,
    rubric: typeof obj.rubric === "string" ? obj.rubric : undefined,
  };
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

export const McqJustify: HomeworkWidget<McqJustifyState> = ({
  config,
  initialState,
  disabled,
  onChange,
}: HomeworkWidgetProps<McqJustifyState>) => {
  const normalized = useMemo(() => normalizeConfig(config), [config]);

  const defaultState: McqJustifyState = useMemo(
    () => ({ chosenOptionId: null, justification: "" }),
    [],
  );

  const [state, setState] = useState<McqJustifyState>(
    initialState ?? defaultState,
  );
  const [submitted, setSubmitted] = useState(false);


  if (!normalized) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger-light p-3 text-sm text-danger">
        Configuration error: this mcq-justify task is missing{" "}
        <code>question</code>, <code>options</code>, or{" "}
        <code>correctOptionId</code>.
      </div>
    );
  }

  const words = countWords(state.justification);
  const enoughWords = words >= normalized.minJustificationWords;
  const hasChoice = state.chosenOptionId !== null;
  const isCorrectChoice = state.chosenOptionId === normalized.correctOptionId;
  const canSubmit = hasChoice && enoughWords && !disabled;

  function chooseOption(id: string) {
    if (disabled) return;
    const nextState: McqJustifyState = { ...state, chosenOptionId: id };
    setState(nextState);
    setSubmitted(false);
    onChange({ state: nextState, completed: false });
  }

  function updateJustification(value: string) {
    if (disabled) return;
    const nextState: McqJustifyState = { ...state, justification: value };
    setState(nextState);
    setSubmitted(false);
    onChange({ state: nextState, completed: false });
  }

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitted(true);
    const completed = isCorrectChoice && enoughWords;
    onChange({ state, completed });
  }

  return (
    <div
      className={cn(
        "space-y-4",
        disabled && "opacity-60 pointer-events-none",
      )}
    >
      <p className="text-sm font-medium text-gray-900 sm:text-base">
        {normalized.question}
      </p>

      <ul className="space-y-2" role="radiogroup" aria-label="Answer options">
        {normalized.options.map((opt) => {
          const chosen = state.chosenOptionId === opt.id;
          const isCorrect = opt.id === normalized.correctOptionId;
          const showRight = submitted && isCorrect;
          const showWrong = submitted && chosen && !isCorrect;
          return (
            <li key={opt.id}>
              <label
                className={cn(
                  "flex min-h-[44px] cursor-pointer items-start gap-2 rounded-lg border p-2 transition-colors",
                  chosen && !submitted && "border-brand bg-brand/5",
                  !chosen && !submitted && "border-gray-200 hover:bg-gray-50",
                  showRight && "border-success bg-success-light",
                  showWrong && "border-danger bg-danger-light",
                  submitted && !chosen && !isCorrect && "border-gray-200",
                  disabled && "cursor-not-allowed",
                )}
              >
                <input
                  type="radio"
                  name={`mcq-${normalized.question.slice(0, 8)}`}
                  className="mt-1 h-4 w-4 accent-brand"
                  checked={chosen}
                  onChange={() => chooseOption(opt.id)}
                  disabled={disabled}
                />
                <span className="flex-1 text-sm text-gray-800">{opt.label}</span>
                {showRight && (
                  <span className="text-sm font-medium text-success" aria-hidden>
                    ✓
                  </span>
                )}
                {showWrong && (
                  <span className="text-sm font-medium text-danger" aria-hidden>
                    ✗
                  </span>
                )}
              </label>
            </li>
          );
        })}
      </ul>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Why? (at least {normalized.minJustificationWords} words)
        </label>
        <textarea
          rows={3}
          value={state.justification}
          onChange={(e) => updateJustification(e.target.value)}
          disabled={disabled}
          placeholder="Explain your choice in your own words..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-gray-50 disabled:text-gray-500"
        />
        <p
          className={cn(
            "text-xs",
            enoughWords ? "text-success" : "text-gray-500",
          )}
        >
          {words} / {normalized.minJustificationWords} words
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Submit
        </Button>
        {submitted && (
          <span
            className={cn(
              "text-sm font-medium",
              isCorrectChoice ? "text-success" : "text-danger",
            )}
            role="status"
          >
            {isCorrectChoice
              ? "Correct — and your reasoning is recorded."
              : "Not the answer we were looking for. Try again."}
          </span>
        )}
      </div>

      {submitted && normalized.rubric && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <p className="mb-1 font-medium text-gray-900">Rubric</p>
          <p>{normalized.rubric}</p>
        </div>
      )}
    </div>
  );
};
