"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

type Dialect = "sql" | "prisma" | "mongo";

type SlotOption = { value: string; label?: string };

type Slot = {
  id: string;
  label: string;
  options: SlotOption[];
  correct: string;
};

type NormalizedConfig = {
  dialect: Dialect;
  prompt: string;
  slots: Slot[];
  template: string;
};

export type QueryBuilderState = {
  choices: Record<string, string | null>;
  submitted: boolean;
};

function normalize(config: Record<string, unknown>): NormalizedConfig | null {
  try {
    const dialect = config.dialect as Dialect;
    const prompt = String(config.prompt ?? "");
    const template = String(config.template ?? "");
    const rawSlots = Array.isArray(config.slots) ? (config.slots as unknown[]) : [];

    if (!["sql", "prisma", "mongo"].includes(dialect)) return null;
    if (!prompt || !template || rawSlots.length === 0) return null;

    const slots: Slot[] = rawSlots.map((s) => {
      const slot = s as Record<string, unknown>;
      const opts = Array.isArray(slot.options) ? (slot.options as Record<string, unknown>[]) : [];
      return {
        id: String(slot.id),
        label: String(slot.label ?? slot.id),
        correct: String(slot.correct ?? ""),
        options: opts.map((o) => ({
          value: String(o.value),
          label: o.label != null ? String(o.label) : undefined,
        })),
      };
    });

    for (const s of slots) {
      if (!s.id || s.options.length === 0 || !s.correct) return null;
    }

    return { dialect, prompt, template, slots };
  } catch {
    return null;
  }
}

function defaultState(cfg: NormalizedConfig): QueryBuilderState {
  const choices: Record<string, string | null> = {};
  for (const s of cfg.slots) choices[s.id] = null;
  return { choices, submitted: false };
}

function renderPreview(template: string, choices: Record<string, string | null>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, id) => {
    const v = choices[id];
    return v ?? `…${id}…`;
  });
}

export function QueryBuilder(props: HomeworkWidgetProps<QueryBuilderState>) {
  const cfg = useMemo(() => normalize(props.config), [props.config]);

  if (!cfg) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger-light p-3 text-sm text-danger">
        Configuration error: query-builder widget is missing required fields.
      </div>
    );
  }

  return <QueryBuilderInner {...props} cfg={cfg} />;
}

function QueryBuilderInner({
  cfg,
  initialState,
  disabled,
  onChange,
}: HomeworkWidgetProps<QueryBuilderState> & { cfg: NormalizedConfig }) {
  const [state, setState] = useState<QueryBuilderState>(
    () => initialState ?? defaultState(cfg),
  );
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const allChosen = cfg.slots.every((s) => state.choices[s.id]);
  const correctCount = cfg.slots.filter(
    (s) => state.choices[s.id] === s.correct,
  ).length;
  const allCorrect = correctCount === cfg.slots.length;
  const completed = state.submitted && allCorrect;

  useEffect(() => {
    onChangeRef.current({ state, completed });
  }, [state, completed]);

  function pick(slotId: string, value: string) {
    if (disabled) return;
    setState((s) => ({
      submitted: false,
      choices: { ...s.choices, [slotId]: value },
    }));
  }

  function runCheck() {
    if (disabled || !allChosen) return;
    setState((s) => ({ ...s, submitted: true }));
  }

  // Render template with inline selects in place of {{slotId}}.
  const parts = useMemo(() => {
    const out: Array<{ kind: "text"; text: string } | { kind: "slot"; slot: Slot }> = [];
    const re = /\{\{(\w+)\}\}/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(cfg.template)) !== null) {
      if (m.index > last) out.push({ kind: "text", text: cfg.template.slice(last, m.index) });
      const slot = cfg.slots.find((s) => s.id === m![1]);
      if (slot) out.push({ kind: "slot", slot });
      else out.push({ kind: "text", text: m[0] });
      last = m.index + m[0].length;
    }
    if (last < cfg.template.length) out.push({ kind: "text", text: cfg.template.slice(last) });
    return out;
  }, [cfg.template, cfg.slots]);

  return (
    <div
      className={cn(
        "space-y-3",
        disabled && "opacity-60 pointer-events-none",
      )}
    >
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {cfg.dialect.toUpperCase()} query
      </div>
      <div className="text-sm text-gray-700">{cfg.prompt}</div>

      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm leading-7">
          {parts.map((p, i) => {
            if (p.kind === "text") {
              return (
                <span key={i} className="font-mono text-gray-700 whitespace-pre-wrap">
                  {p.text}
                </span>
              );
            }
            const slot = p.slot;
            const chosen = state.choices[slot.id];
            const wrong = state.submitted && chosen !== slot.correct;
            const right = state.submitted && chosen === slot.correct;
            return (
              <label key={slot.id} className="inline-flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-gray-400">
                  {slot.label}
                </span>
                <select
                  value={chosen ?? ""}
                  onChange={(e) => pick(slot.id, e.target.value)}
                  disabled={disabled}
                  className={cn(
                    "min-h-8 rounded-md border bg-white px-2 py-1 font-mono text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-brand/40",
                    wrong && "border-danger bg-danger-light",
                    right && "border-success bg-success-light",
                    !state.submitted && "border-gray-300",
                  )}
                >
                  <option value="" disabled>
                    pick…
                  </option>
                  {slot.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label ?? o.value}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
          Preview
        </div>
        <pre className="overflow-x-auto rounded-md bg-gray-900 p-3 font-mono text-xs text-gray-100 sm:text-sm">
          {renderPreview(cfg.template, state.choices)}
        </pre>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={runCheck}
          disabled={disabled || !allChosen}
        >
          Run check
        </Button>
        {state.submitted &&
          (allCorrect ? (
            <span className="text-sm font-medium text-success">
              ✓ All slots correct.
            </span>
          ) : (
            <span className="text-sm font-medium text-danger">
              {correctCount}/{cfg.slots.length} correct — fix the highlighted slots.
            </span>
          ))}
      </div>
    </div>
  );
}

// Type guard: ensure component matches HomeworkWidget signature.
const _typecheck: HomeworkWidget<QueryBuilderState> = QueryBuilder;
void _typecheck;
