"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

type ErrorTraceConfig = {
  code: string[];
  errorMessage: string;
  rootCauseLine: number;
  acceptKeywords?: string[];
};

type ErrorTraceState = {
  selectedLine: number | null;
  explanation: string;
  submitted: boolean;
  lastResult: "ok" | "wrong" | null;
};

function normalizeConfig(raw: Record<string, unknown>): ErrorTraceConfig | null {
  const code = Array.isArray(raw.code)
    ? (raw.code.filter((l) => typeof l === "string") as string[])
    : null;
  const errorMessage =
    typeof raw.errorMessage === "string" ? raw.errorMessage : null;
  const rootCauseLine =
    typeof raw.rootCauseLine === "number" ? raw.rootCauseLine : null;
  if (!code || code.length === 0 || !errorMessage || !rootCauseLine) {
    return null;
  }
  const acceptKeywords = Array.isArray(raw.acceptKeywords)
    ? (raw.acceptKeywords.filter((k) => typeof k === "string") as string[])
    : undefined;
  return { code, errorMessage, rootCauseLine, acceptKeywords };
}

export const ErrorTrace: HomeworkWidget<ErrorTraceState> = (
  props: HomeworkWidgetProps<ErrorTraceState>,
) => {
  const { config, initialState, disabled, onChange } = props;
  const cfg = useMemo(() => normalizeConfig(config), [config]);

  const defaultState: ErrorTraceState = {
    selectedLine: null,
    explanation: "",
    submitted: false,
    lastResult: null,
  };
  const [state, setState] = useState<ErrorTraceState>(
    initialState ?? defaultState,
  );

  const isCorrect = useMemo(() => {
    if (!cfg) return false;
    if (state.selectedLine !== cfg.rootCauseLine) return false;
    if (!cfg.acceptKeywords || cfg.acceptKeywords.length === 0) return true;
    const lower = state.explanation.toLowerCase();
    return cfg.acceptKeywords.some((kw) => lower.includes(kw.toLowerCase()));
  }, [cfg, state.selectedLine, state.explanation]);

  const completed = state.submitted && state.lastResult === "ok";
  const lastEmitRef = useRef<string>("");

  useEffect(() => {
    const key = JSON.stringify({ s: state, c: completed });
    if (key === lastEmitRef.current) return;
    lastEmitRef.current = key;
    onChange({ state, completed });
  }, [state, completed, onChange]);

  if (!cfg) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
        Configuration error: error-trace requires <code>code[]</code>,{" "}
        <code>errorMessage</code>, and <code>rootCauseLine</code>.
      </div>
    );
  }

  const update = (partial: Partial<ErrorTraceState>) => {
    if (disabled) return;
    setState((prev) => ({ ...prev, ...partial }));
  };

  const handleSubmit = () => {
    if (disabled) return;
    if (state.selectedLine === null) return;
    if (state.explanation.trim().length === 0) return;
    setState((prev) => ({
      ...prev,
      submitted: true,
      lastResult: isCorrect ? "ok" : "wrong",
    }));
  };

  const handleRetry = () => {
    if (disabled) return;
    setState((prev) => ({ ...prev, submitted: false, lastResult: null }));
  };

  const canSubmit =
    state.selectedLine !== null && state.explanation.trim().length > 0;

  return (
    <div
      className={
        "space-y-3" + (disabled ? " opacity-60 pointer-events-none" : "")
      }
    >
      <div className="overflow-x-auto rounded-md bg-gray-900 p-3 font-mono text-sm">
        {cfg.code.map((line, idx) => {
          const lineNumber = idx + 1;
          const selected = state.selectedLine === lineNumber;
          const showResult = state.submitted;
          const isRootCause = lineNumber === cfg.rootCauseLine;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => update({ selectedLine: lineNumber })}
              disabled={disabled || state.submitted}
              className={
                "flex w-full items-start gap-3 rounded px-1 py-0.5 text-left transition-colors " +
                (selected
                  ? showResult
                    ? isRootCause
                      ? "bg-green-900/40"
                      : "bg-red-900/40"
                    : "bg-yellow-500/10"
                  : "hover:bg-gray-800/60") +
                (selected
                  ? showResult
                    ? isRootCause
                      ? " underline decoration-green-400 decoration-2 underline-offset-4"
                      : " underline decoration-red-400 decoration-2 underline-offset-4"
                    : " underline decoration-yellow-400 decoration-2 underline-offset-4"
                  : "")
              }
            >
              <span className="w-6 shrink-0 select-none text-right text-gray-500">
                {lineNumber}
              </span>
              <span className="whitespace-pre-wrap break-all text-gray-100">
                {line || " "}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-md border border-red-300 bg-red-50 p-3">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-700">
          stderr
        </div>
        <pre className="whitespace-pre-wrap break-words font-mono text-xs text-red-900">
          {cfg.errorMessage}
        </pre>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
          One-line root cause
        </span>
        <input
          type="text"
          value={state.explanation}
          onChange={(e) => update({ explanation: e.target.value })}
          disabled={disabled || state.submitted}
          placeholder="What is the underlying bug?"
          className="block w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </label>

      {!state.submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !canSubmit}
          className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit
        </button>
      )}

      {state.submitted && state.lastResult === "ok" && (
        <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          <span className="font-semibold">✓ Correct.</span> You pinpointed the
          right line and named the root cause.
        </div>
      )}

      {state.submitted && state.lastResult === "wrong" && (
        <div className="space-y-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          <div>
            <span className="font-semibold">✗ Not quite.</span>{" "}
            {state.selectedLine !== cfg.rootCauseLine ? (
              <>
                Selected line was {state.selectedLine}, root cause was line{" "}
                {cfg.rootCauseLine}.
              </>
            ) : (
              <>
                Line is right, but your explanation didn&apos;t mention the
                expected keywords.
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleRetry}
            disabled={disabled}
            className="rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
};
