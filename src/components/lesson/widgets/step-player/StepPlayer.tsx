"use client";

import { useState, useMemo } from "react";
import type { WidgetProps } from "../registry";

interface Step {
  title: string;
  body: string;
}

interface NormalizedConfig {
  prompt: string;
  steps: Step[];
}

function normalize(config: Record<string, unknown>): NormalizedConfig | null {
  const prompt = typeof config.prompt === "string" ? config.prompt : "";
  const rawSteps = Array.isArray(config.steps) ? config.steps : [];
  const steps = rawSteps
    .map((s) => {
      if (!s || typeof s !== "object") return null;
      const r = s as Record<string, unknown>;
      if (typeof r.title !== "string" || typeof r.body !== "string") return null;
      return { title: r.title, body: r.body };
    })
    .filter((s): s is Step => Boolean(s));

  if (steps.length === 0) return null;
  return { prompt, steps };
}

export function StepPlayer({ config }: WidgetProps) {
  const cfg = useMemo(() => normalize(config), [config]);
  const [index, setIndex] = useState(0);

  if (!cfg) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Configuration error: <code>step-player</code> needs <code>steps</code>{" "}
        (an array of <code>{`{ title, body }`}</code>).
      </div>
    );
  }

  const total = cfg.steps.length;
  const safeIndex = Math.min(Math.max(index, 0), total - 1);
  const step = cfg.steps[safeIndex];

  return (
    <div className="my-6 rounded-xl border border-sky-200 bg-sky-50/30 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">
          Walk through
        </div>
        <div className="text-xs text-gray-500">
          Step {safeIndex + 1} of {total}
        </div>
      </div>
      {cfg.prompt && (
        <p className="mb-4 text-sm font-semibold text-gray-900">{cfg.prompt}</p>
      )}

      <div className="mb-4 rounded-lg border border-sky-200 bg-white p-3">
        <p className="mb-1 text-sm font-semibold text-sky-800">{step.title}</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {step.body}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={safeIndex === 0}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Prev
        </button>

        <div className="flex gap-1">
          {cfg.steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to step ${i + 1}`}
              className={`h-2 w-6 rounded-full transition-colors ${
                i === safeIndex ? "bg-sky-500" : "bg-sky-200 hover:bg-sky-300"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={safeIndex === total - 1}
          className="rounded-lg border border-sky-500 bg-sky-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
