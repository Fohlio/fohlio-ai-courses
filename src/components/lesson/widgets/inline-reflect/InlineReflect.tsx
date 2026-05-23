"use client";

import { useState, useMemo, useEffect } from "react";
import type { WidgetProps } from "../registry";

interface NormalizedConfig {
  storageKey: string;
  prompt: string;
  placeholder: string;
  exampleReflection: string;
  minWords: number;
}

function normalize(config: Record<string, unknown>): NormalizedConfig | null {
  const storageKey =
    typeof config.storageKey === "string" ? config.storageKey : null;
  const prompt = typeof config.prompt === "string" ? config.prompt : null;
  if (!storageKey || !prompt) return null;

  return {
    storageKey,
    prompt,
    placeholder:
      typeof config.placeholder === "string"
        ? config.placeholder
        : "Your thoughts…",
    exampleReflection:
      typeof config.exampleReflection === "string"
        ? config.exampleReflection
        : "",
    minWords:
      typeof config.minWords === "number" && config.minWords > 0
        ? Math.floor(config.minWords)
        : 12,
  };
}

function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function InlineReflect({ config }: WidgetProps) {
  const cfg = useMemo(() => normalize(config), [config]);
  const [text, setText] = useState("");
  const [exampleOpen, setExampleOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount. Guard against SSR by using effect.
  // setState-in-effect is legitimate here — we cannot read localStorage at
  // render time without SSR mismatches; the alternative would be passing
  // initial state from above, which the runtime cannot do for a portal mount.
  useEffect(() => {
    if (!cfg) return;
    try {
      const stored = window.localStorage.getItem(cfg.storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setText(stored);
    } catch {
      // localStorage unavailable (private mode, server) — silently ignore.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, [cfg]);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!cfg || !hydrated) return;
    try {
      if (text.trim()) {
        window.localStorage.setItem(cfg.storageKey, text);
      } else {
        window.localStorage.removeItem(cfg.storageKey);
      }
    } catch {
      // ignore quota / SSR
    }
  }, [text, cfg, hydrated]);

  if (!cfg) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Configuration error: <code>inline-reflect</code> needs{" "}
        <code>storageKey</code> and <code>prompt</code>.
      </div>
    );
  }

  const words = wordCount(text);
  const meetsMin = words >= cfg.minWords;

  return (
    <div className="my-6 rounded-xl border border-purple-200 bg-purple-50/40 p-4 sm:p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-purple-700">
        Reflect — for you only
      </div>
      <p className="mb-3 text-sm font-semibold text-gray-900">{cfg.prompt}</p>

      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={cfg.placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className={meetsMin ? "text-emerald-700" : "text-gray-500"}>
          {words} word{words === 1 ? "" : "s"}
          {!meetsMin && ` (target ≥ ${cfg.minWords})`}
          {meetsMin && " ✓"}
        </span>
        <span className="text-gray-400">
          Saved locally in your browser — never sent anywhere.
        </span>
      </div>

      {cfg.exampleReflection && (
        <details
          open={exampleOpen}
          onToggle={(e) => setExampleOpen((e.target as HTMLDetailsElement).open)}
          className="mt-3 rounded-lg border border-purple-200 bg-white"
        >
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-purple-700">
            Show an example reflection
          </summary>
          <div className="border-t border-purple-100 px-3 py-2 text-sm text-gray-700">
            {cfg.exampleReflection}
          </div>
        </details>
      )}
    </div>
  );
}
