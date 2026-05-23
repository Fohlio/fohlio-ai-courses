"use client";

import { useState, useMemo } from "react";
import type { WidgetProps } from "../registry";

interface View {
  id: string;
  label: string;
  body: string;
  tone: "good" | "bad" | "neutral";
}

interface NormalizedConfig {
  title: string;
  views: View[];
}

function normalize(config: Record<string, unknown>): NormalizedConfig | null {
  const title = typeof config.title === "string" ? config.title : "";
  const rawViews = Array.isArray(config.views) ? config.views : [];
  const views = rawViews
    .map((v) => {
      if (!v || typeof v !== "object") return null;
      const r = v as Record<string, unknown>;
      if (typeof r.id !== "string" || typeof r.label !== "string") return null;
      if (typeof r.body !== "string") return null;
      const tone: View["tone"] =
        r.tone === "good" || r.tone === "bad" || r.tone === "neutral"
          ? r.tone
          : "neutral";
      return { id: r.id, label: r.label, body: r.body, tone } satisfies View;
    })
    .filter((v): v is View => Boolean(v));

  if (views.length < 2) return null;
  return { title, views };
}

const toneStyles: Record<View["tone"], string> = {
  good: "border-emerald-300 bg-emerald-50 text-emerald-900",
  bad: "border-red-300 bg-red-50 text-red-900",
  neutral: "border-gray-200 bg-gray-50 text-gray-800",
};

export function ConceptToggle({ config }: WidgetProps) {
  const cfg = useMemo(() => normalize(config), [config]);
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!cfg) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Configuration error: <code>concept-toggle</code> needs ≥ 2{" "}
        <code>views</code> with <code>id</code>, <code>label</code>, and{" "}
        <code>body</code>.
      </div>
    );
  }

  const current = activeId
    ? cfg.views.find((v) => v.id === activeId) ?? cfg.views[0]
    : cfg.views[0];

  return (
    <div className="my-6 rounded-xl border border-amber-200 bg-amber-50/30 p-4 sm:p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700">
        Compare
      </div>
      {cfg.title && (
        <p className="mb-4 text-sm font-semibold text-gray-900">{cfg.title}</p>
      )}
      <div role="tablist" className="mb-3 flex flex-wrap gap-2">
        {cfg.views.map((v) => {
          const isActive = current.id === v.id;
          return (
            <button
              key={v.id}
              role="tab"
              type="button"
              onClick={() => setActiveId(v.id)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                isActive
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-amber-300 bg-white text-amber-700 hover:bg-amber-100"
              }`}
              aria-selected={isActive}
            >
              {v.label}
            </button>
          );
        })}
      </div>
      <div
        className={`whitespace-pre-wrap rounded-lg border p-3 text-sm leading-relaxed ${toneStyles[current.tone]}`}
      >
        {current.body}
      </div>
    </div>
  );
}
