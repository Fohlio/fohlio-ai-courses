"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

type CodeOrderConfig = {
  language?: "ts" | "js" | "py" | "sql" | "bash";
  prompt: string;
  lines: string[];
};

export type CodeOrderState = {
  order: number[];
};

function normalizeConfig(raw: unknown): CodeOrderConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.prompt !== "string") return null;
  if (!Array.isArray(obj.lines) || obj.lines.length === 0) return null;
  const lines: string[] = [];
  for (const l of obj.lines) {
    if (typeof l !== "string") return null;
    lines.push(l);
  }
  const language =
    obj.language === "ts" ||
    obj.language === "js" ||
    obj.language === "py" ||
    obj.language === "sql" ||
    obj.language === "bash"
      ? obj.language
      : undefined;
  return { language, prompt: obj.prompt, lines };
}

function shuffleStable(n: number): number[] {
  // Deterministic-ish shuffle: rotate halves, then odd/even interleave.
  // Goal — produce a non-identity permutation without RNG churn between renders.
  if (n <= 1) return Array.from({ length: n }, (_, i) => i);
  const arr = Array.from({ length: n }, (_, i) => i);
  // Pairwise swap odd indices with the next even neighbour.
  for (let i = 1; i < n - 1; i += 2) {
    const t = arr[i];
    arr[i] = arr[i + 1];
    arr[i + 1] = t;
  }
  // If still identity (n === 2), swap first two.
  if (arr.every((v, i) => v === i)) {
    if (n >= 2) {
      const t = arr[0];
      arr[0] = arr[1];
      arr[1] = t;
    }
  }
  return arr;
}

export const CodeOrder: HomeworkWidget<CodeOrderState> = ({
  config,
  initialState,
  disabled,
  onChange,
}: HomeworkWidgetProps<CodeOrderState>) => {
  const normalized = useMemo(() => normalizeConfig(config), [config]);

  const defaultState: CodeOrderState = useMemo(() => {
    if (!normalized) return { order: [] };
    return { order: shuffleStable(normalized.lines.length) };
  }, [normalized]);

  const [state, setState] = useState<CodeOrderState>(
    initialState ?? defaultState,
  );
  const [checked, setChecked] = useState(false);
  const dragIndexRef = useRef<number | null>(null);


  if (!normalized) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger-light p-3 text-sm text-danger">
        Configuration error: this code-order task is missing <code>prompt</code>{" "}
        or <code>lines</code>.
      </div>
    );
  }

  const order = state.order.length === normalized.lines.length
    ? state.order
    : Array.from({ length: normalized.lines.length }, (_, i) => i);

  const isCorrect = order.every((v, i) => v === i);
  const inPlaceCount = order.reduce(
    (acc, v, i) => acc + (v === i ? 1 : 0),
    0,
  );

  function commit(nextOrder: number[]) {
    const nextState: CodeOrderState = { order: nextOrder };
    setState(nextState);
    setChecked(false);
    onChange({ state: nextState, completed: false });
  }

  function move(from: number, to: number) {
    if (disabled) return;
    if (to < 0 || to >= order.length || to === from) return;
    const next = order.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commit(next);
  }

  function handleDragStart(idx: number) {
    if (disabled) return;
    dragIndexRef.current = idx;
  }

  function handleDragOver(e: React.DragEvent<HTMLLIElement>) {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(idx: number) {
    if (disabled) return;
    const from = dragIndexRef.current;
    dragIndexRef.current = null;
    if (from === null) return;
    move(from, idx);
  }

  function handleCheck() {
    if (disabled) return;
    setChecked(true);
    onChange({ state: { order }, completed: isCorrect });
  }

  return (
    <div
      className={cn(
        "space-y-3",
        disabled && "opacity-60 pointer-events-none",
      )}
    >
      <p className="text-sm text-gray-700">{normalized.prompt}</p>

      <ol className="space-y-2" role="list">
        {order.map((lineIdx, position) => {
          const line = normalized.lines[lineIdx] ?? "";
          const wrong = checked && lineIdx !== position;
          const right = checked && lineIdx === position;
          return (
            <li
              key={`${lineIdx}-${position}`}
              draggable={!disabled}
              onDragStart={() => handleDragStart(position)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(position)}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-white p-2",
                "cursor-grab active:cursor-grabbing",
                wrong && "border-danger bg-danger-light",
                right && "border-success bg-success-light",
                !checked && "border-gray-200",
              )}
            >
              <span
                className="select-none text-gray-400"
                aria-hidden
                title="Drag to reorder"
              >
                ⋮⋮
              </span>
              <code className="flex-1 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs sm:text-sm">
                {line}
              </code>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  aria-label={`Move line up (position ${position + 1})`}
                  onClick={() => move(position, position - 1)}
                  disabled={disabled || position === 0}
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Move line down (position ${position + 1})`}
                  onClick={() => move(position, position + 1)}
                  disabled={disabled || position === order.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ↓
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" onClick={handleCheck} disabled={disabled}>
          Check order
        </Button>
        {checked && (
          <span
            className={cn(
              "text-sm font-medium",
              isCorrect ? "text-success" : "text-danger",
            )}
            role="status"
          >
            {isCorrect
              ? "Order is correct."
              : `${inPlaceCount} of ${order.length} in place.`}
          </span>
        )}
      </div>
    </div>
  );
};
