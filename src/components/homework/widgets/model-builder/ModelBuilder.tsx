"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

type TypeOption = { value: string; label: string };

type ExpectedField = {
  id: string;
  nameOptions: string[];
  correctName: string;
  typeOptions: TypeOption[];
  correctType: string;
  flagLabel?: string;
  correctFlag?: boolean;
};

type NormalizedConfig = {
  prompt: string;
  entityName: string;
  expectedFields: ExpectedField[];
};

export type ModelBuilderState = {
  rows: Record<string, { name: string; type: string; flag: boolean }>;
  submitted: boolean;
};

function normalize(config: Record<string, unknown>): NormalizedConfig | null {
  try {
    const prompt = String(config.prompt ?? "");
    const entityName = String(config.entityName ?? "");
    const raw = Array.isArray(config.expectedFields)
      ? (config.expectedFields as unknown[])
      : [];
    if (!entityName || raw.length === 0) return null;

    const expectedFields: ExpectedField[] = raw.map((f) => {
      const r = f as Record<string, unknown>;
      const nameOptions = Array.isArray(r.nameOptions)
        ? (r.nameOptions as unknown[]).map(String)
        : [];
      const typeOptionsRaw = Array.isArray(r.typeOptions)
        ? (r.typeOptions as Record<string, unknown>[])
        : [];
      const typeOptions: TypeOption[] = typeOptionsRaw.map((t) => ({
        value: String(t.value),
        label: String(t.label ?? t.value),
      }));
      return {
        id: String(r.id),
        nameOptions,
        correctName: String(r.correctName ?? ""),
        typeOptions,
        correctType: String(r.correctType ?? ""),
        flagLabel: r.flagLabel != null ? String(r.flagLabel) : undefined,
        correctFlag: typeof r.correctFlag === "boolean" ? r.correctFlag : undefined,
      };
    });

    for (const f of expectedFields) {
      if (
        !f.id ||
        f.nameOptions.length === 0 ||
        f.typeOptions.length === 0 ||
        !f.correctName ||
        !f.correctType
      )
        return null;
    }

    return { prompt, entityName, expectedFields };
  } catch {
    return null;
  }
}

function defaultState(cfg: NormalizedConfig): ModelBuilderState {
  const rows: ModelBuilderState["rows"] = {};
  for (const f of cfg.expectedFields) {
    rows[f.id] = { name: "", type: "", flag: false };
  }
  return { rows, submitted: false };
}

function isRowComplete(
  row: ModelBuilderState["rows"][string],
  f: ExpectedField,
): boolean {
  if (!row.name || !row.type) return false;
  if (f.flagLabel && f.correctFlag === undefined) return true;
  return true;
}

function isRowCorrect(
  row: ModelBuilderState["rows"][string],
  f: ExpectedField,
): boolean {
  const nameOk = row.name.toLowerCase() === f.correctName.toLowerCase();
  const typeOk = row.type === f.correctType;
  const flagOk =
    f.correctFlag === undefined ? true : row.flag === f.correctFlag;
  return nameOk && typeOk && flagOk;
}

export function ModelBuilder(props: HomeworkWidgetProps<ModelBuilderState>) {
  const cfg = useMemo(() => normalize(props.config), [props.config]);
  if (!cfg) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Configuration error: model-builder widget is missing required fields.
      </div>
    );
  }
  return <ModelBuilderInner {...props} cfg={cfg} />;
}

function ModelBuilderInner({
  cfg,
  initialState,
  disabled,
  onChange,
}: HomeworkWidgetProps<ModelBuilderState> & { cfg: NormalizedConfig }) {
  const [state, setState] = useState<ModelBuilderState>(
    () => initialState ?? defaultState(cfg),
  );
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const allRowsFilled = cfg.expectedFields.every((f) =>
    isRowComplete(state.rows[f.id] ?? { name: "", type: "", flag: false }, f),
  );
  const correctRows = cfg.expectedFields.filter((f) =>
    isRowCorrect(state.rows[f.id] ?? { name: "", type: "", flag: false }, f),
  );
  const allCorrect = correctRows.length === cfg.expectedFields.length;
  const completed = state.submitted && allCorrect;

  useEffect(() => {
    onChangeRef.current({ state, completed });
  }, [state, completed]);

  function updateRow(
    id: string,
    patch: Partial<ModelBuilderState["rows"][string]>,
  ) {
    if (disabled) return;
    setState((s) => ({
      submitted: false,
      rows: {
        ...s.rows,
        [id]: { ...(s.rows[id] ?? { name: "", type: "", flag: false }), ...patch },
      },
    }));
  }

  function build() {
    if (disabled || !allRowsFilled) return;
    setState((s) => ({ ...s, submitted: true }));
  }

  return (
    <div
      className={cn(
        "space-y-3",
        disabled && "opacity-60 pointer-events-none",
      )}
    >
      <div className="text-sm text-gray-700">{cfg.prompt}</div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700">
          entity <span className="font-semibold">{cfg.entityName}</span> {"{"}
        </div>
        <ul className="divide-y divide-gray-100">
          {cfg.expectedFields.map((f) => {
            const row =
              state.rows[f.id] ?? { name: "", type: "", flag: false };
            const submitted = state.submitted;
            const nameOk = row.name.toLowerCase() === f.correctName.toLowerCase();
            const typeOk = row.type === f.correctType;
            const flagOk =
              f.correctFlag === undefined ? true : row.flag === f.correctFlag;

            return (
              <li
                key={f.id}
                className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">
                    name
                  </span>
                  <select
                    value={row.name}
                    onChange={(e) => updateRow(f.id, { name: e.target.value })}
                    disabled={disabled}
                    className={cn(
                      "min-h-8 rounded-md border bg-white px-2 py-1 font-mono text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-brand/40",
                      submitted && nameOk && "border-green-500 bg-green-50",
                      submitted && !nameOk && "border-red-400 bg-red-50",
                      !submitted && "border-gray-300",
                    )}
                  >
                    <option value="" disabled>
                      …
                    </option>
                    {f.nameOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="font-mono text-gray-400">:</span>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">
                    type
                  </span>
                  <select
                    value={row.type}
                    onChange={(e) => updateRow(f.id, { type: e.target.value })}
                    disabled={disabled}
                    className={cn(
                      "min-h-8 rounded-md border bg-white px-2 py-1 font-mono text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-brand/40",
                      submitted && typeOk && "border-green-500 bg-green-50",
                      submitted && !typeOk && "border-red-400 bg-red-50",
                      !submitted && "border-gray-300",
                    )}
                  >
                    <option value="" disabled>
                      …
                    </option>
                    {f.typeOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {f.flagLabel && (
                  <label className="inline-flex items-center gap-1.5 self-end">
                    <input
                      type="checkbox"
                      checked={row.flag}
                      onChange={(e) =>
                        updateRow(f.id, { flag: e.target.checked })
                      }
                      disabled={disabled}
                      className={cn(
                        "h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand/40",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs text-gray-600",
                        submitted && flagOk && "text-green-700",
                        submitted && !flagOk && "text-red-700",
                      )}
                    >
                      {f.flagLabel}
                    </span>
                  </label>
                )}

                {submitted && (
                  <span
                    className={cn(
                      "ml-auto font-mono text-sm",
                      isRowCorrect(row, f) ? "text-green-700" : "text-red-700",
                    )}
                    aria-label={isRowCorrect(row, f) ? "correct" : "wrong"}
                  >
                    {isRowCorrect(row, f) ? "✓" : "✗"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700">
          {"}"}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={build}
          disabled={disabled || !allRowsFilled}
          className={cn(
            "min-h-8 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white",
            "hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          Build entity
        </button>
        {state.submitted &&
          (allCorrect ? (
            <span className="text-sm font-medium text-green-700">
              ✓ Entity matches the requirement.
            </span>
          ) : (
            <span className="text-sm font-medium text-red-700">
              {correctRows.length}/{cfg.expectedFields.length} fields correct.
            </span>
          ))}
      </div>
    </div>
  );
}

const _typecheck: HomeworkWidget<ModelBuilderState> = ModelBuilder;
void _typecheck;
