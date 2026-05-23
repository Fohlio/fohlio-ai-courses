"use client";

import { useState, useMemo } from "react";
import type { WidgetProps } from "../registry";

interface NormalizedConfig {
  question: string;
  options: Array<{ id: string; label: string }>;
  correctOptionId: string;
  explanation: string;
}

function normalize(config: Record<string, unknown>): NormalizedConfig | null {
  const question = typeof config.question === "string" ? config.question : null;
  const rawOptions = Array.isArray(config.options) ? config.options : [];
  const options = rawOptions
    .map((opt) => {
      if (!opt || typeof opt !== "object") return null;
      const o = opt as Record<string, unknown>;
      if (typeof o.id !== "string" || typeof o.label !== "string") return null;
      return { id: o.id, label: o.label };
    })
    .filter((opt): opt is { id: string; label: string } => Boolean(opt));
  const correctOptionId =
    typeof config.correctOptionId === "string" ? config.correctOptionId : null;
  const explanation =
    typeof config.explanation === "string" ? config.explanation : "";

  if (!question || options.length < 2 || !correctOptionId) return null;
  if (!options.some((opt) => opt.id === correctOptionId)) return null;
  return { question, options, correctOptionId, explanation };
}

export function LiveQuiz({ config }: WidgetProps) {
  const cfg = useMemo(() => normalize(config), [config]);
  const [chosen, setChosen] = useState<string | null>(null);

  if (!cfg) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Configuration error: <code>live-quiz</code> needs <code>question</code>,
        ≥ 2 <code>options</code>, and a valid <code>correctOptionId</code>.
      </div>
    );
  }

  function pick(id: string) {
    if (chosen) return;
    setChosen(id);
  }

  return (
    <div className="my-6 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 sm:p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
        Quick check
      </div>
      <p className="mb-4 text-base font-semibold text-gray-900">{cfg.question}</p>
      <div className="space-y-2">
        {cfg.options.map((opt) => {
          const isChosen = chosen === opt.id;
          const isCorrect = opt.id === cfg.correctOptionId;
          const showState = chosen !== null;
          let cls =
            "w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors";
          if (!showState) {
            cls += " border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer";
          } else if (isCorrect) {
            cls += " border-emerald-400 bg-emerald-50 text-emerald-900";
          } else if (isChosen) {
            cls += " border-red-400 bg-red-50 text-red-900";
          } else {
            cls += " border-gray-200 bg-white opacity-60";
          }
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => pick(opt.id)}
              disabled={showState}
              className={cls}
            >
              <span className="mr-2 font-semibold">
                {showState && isCorrect ? "✓" : showState && isChosen ? "✗" : "○"}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {chosen !== null && cfg.explanation && (
        <div className="mt-4 rounded-lg border border-indigo-200 bg-white p-3 text-sm text-gray-700">
          <span className="font-semibold text-indigo-700">Why:</span>{" "}
          {cfg.explanation}
        </div>
      )}

      {chosen !== null && (
        <button
          type="button"
          onClick={() => setChosen(null)}
          className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
