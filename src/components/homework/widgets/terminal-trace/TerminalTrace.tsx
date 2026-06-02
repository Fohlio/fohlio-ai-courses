"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

type TerminalTraceConfig = {
  prompt: string;
  command: string;
  expectedOutput: string[];
  fuzzy?: boolean;
};

type SelfRating = "exact" | "close" | "off" | null;

type TerminalTraceState = {
  prediction: string;
  revealed: boolean;
  selfRating: SelfRating;
};

function normalizeConfig(raw: Record<string, unknown>): TerminalTraceConfig | null {
  const prompt = typeof raw.prompt === "string" ? raw.prompt : null;
  const command = typeof raw.command === "string" ? raw.command : null;
  const expectedOutput = Array.isArray(raw.expectedOutput)
    ? (raw.expectedOutput.filter((l) => typeof l === "string") as string[])
    : null;
  if (!prompt || !command || !expectedOutput) return null;
  return {
    prompt,
    command,
    expectedOutput,
    fuzzy: typeof raw.fuzzy === "boolean" ? raw.fuzzy : false,
  };
}

function normalizeLine(s: string, fuzzy: boolean): string {
  return fuzzy ? s.trim().toLowerCase().replace(/\s+/g, " ") : s;
}

export const TerminalTrace: HomeworkWidget<TerminalTraceState> = (
  props: HomeworkWidgetProps<TerminalTraceState>,
) => {
  const { config, initialState, disabled, onChange } = props;
  const cfg = useMemo(() => normalizeConfig(config), [config]);

  const defaultState: TerminalTraceState = {
    prediction: "",
    revealed: false,
    selfRating: null,
  };
  const [state, setState] = useState<TerminalTraceState>(
    initialState ?? defaultState,
  );

  const completed = state.revealed && state.selfRating !== null;
  const lastEmitRef = useRef<string>("");

  useEffect(() => {
    const key = JSON.stringify({ s: state, c: completed });
    if (key === lastEmitRef.current) return;
    lastEmitRef.current = key;
    onChange({ state, completed });
  }, [state, completed, onChange]);

  if (!cfg) {
    return (
      <div className="rounded-md border border-danger/30 bg-danger-light p-3 text-sm text-danger">
        Configuration error: terminal-trace requires <code>prompt</code>,{" "}
        <code>command</code>, and <code>expectedOutput[]</code>.
      </div>
    );
  }

  const update = (partial: Partial<TerminalTraceState>) => {
    if (disabled) return;
    setState((prev) => ({ ...prev, ...partial }));
  };

  const predictionLines = state.prediction.split("\n");
  const maxLines = Math.max(predictionLines.length, cfg.expectedOutput.length);
  const fuzzy = cfg.fuzzy ?? false;

  return (
    <div
      className={
        "space-y-3" + (disabled ? " opacity-60 pointer-events-none" : "")
      }
    >
      <p className="text-sm text-gray-700">{cfg.prompt}</p>

      <div className="rounded-md bg-gray-900 p-3 font-mono text-sm text-gray-100">
        <div className="flex gap-2 break-all">
          <span className="select-none text-success">$</span>
          <span className="whitespace-pre-wrap">{cfg.command}</span>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
          Your prediction of the output
        </span>
        <textarea
          className="block w-full resize-y rounded-md border border-gray-200 bg-white p-2 font-mono text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          rows={Math.min(8, Math.max(3, cfg.expectedOutput.length))}
          value={state.prediction}
          placeholder="line 1&#10;line 2&#10;..."
          disabled={disabled || state.revealed}
          onChange={(e) => update({ prediction: e.target.value })}
        />
      </label>

      {!state.revealed && (
        <Button
          type="button"
          disabled={disabled || state.prediction.trim().length === 0}
          onClick={() => update({ revealed: true })}
        >
          Reveal &amp; compare
        </Button>
      )}

      {state.revealed && (
        <div className="space-y-3">
          <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Line-by-line comparison{fuzzy ? " (fuzzy)" : ""}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="w-8 pr-2">#</th>
                    <th className="pr-2">Your line</th>
                    <th className="pr-2">Expected</th>
                    <th>Match</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: maxLines }).map((_, i) => {
                    const got = predictionLines[i] ?? "";
                    const exp = cfg.expectedOutput[i] ?? "";
                    const ok =
                      normalizeLine(got, fuzzy) === normalizeLine(exp, fuzzy);
                    return (
                      <tr
                        key={i}
                        className={
                          ok
                            ? "bg-success-light text-success"
                            : "bg-danger-light text-danger"
                        }
                      >
                        <td className="pr-2 align-top text-gray-500">
                          {i + 1}
                        </td>
                        <td className="pr-2 align-top whitespace-pre-wrap break-all">
                          {got || <span className="text-gray-400">∅</span>}
                        </td>
                        <td className="pr-2 align-top whitespace-pre-wrap break-all">
                          {exp || <span className="text-gray-400">∅</span>}
                        </td>
                        <td className="align-top">{ok ? "✓" : "✗"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
              How close were you?
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "exact", label: "Exact" },
                  { id: "close", label: "Close" },
                  { id: "off", label: "Way off" },
                ] as const
              ).map((opt) => {
                const active = state.selfRating === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update({ selfRating: opt.id })}
                    disabled={disabled}
                    className={
                      "min-h-8 rounded-md border px-3 py-1.5 text-sm transition-colors " +
                      (active
                        ? "border-brand bg-brand text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-brand hover:text-brand")
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
