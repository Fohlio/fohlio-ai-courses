"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

type FlowStep = { id: string; label: string; detail?: string };

type FlowOrderConfig = {
  prompt: string;
  steps: FlowStep[];
  lockFirst?: boolean;
  lockLast?: boolean;
};

type FlowOrderState = {
  order: string[];
  checked: boolean;
};

function normalizeConfig(raw: Record<string, unknown>): FlowOrderConfig | null {
  const prompt = typeof raw.prompt === "string" ? raw.prompt : null;
  const stepsRaw = Array.isArray(raw.steps) ? raw.steps : null;
  if (!prompt || !stepsRaw || stepsRaw.length === 0) return null;
  const steps: FlowStep[] = [];
  for (const s of stepsRaw) {
    if (!s || typeof s !== "object") return null;
    const obj = s as Record<string, unknown>;
    if (typeof obj.id !== "string" || typeof obj.label !== "string") {
      return null;
    }
    steps.push({
      id: obj.id,
      label: obj.label,
      detail: typeof obj.detail === "string" ? obj.detail : undefined,
    });
  }
  return {
    prompt,
    steps,
    lockFirst: typeof raw.lockFirst === "boolean" ? raw.lockFirst : false,
    lockLast: typeof raw.lockLast === "boolean" ? raw.lockLast : false,
  };
}

/** Deterministic shuffle keyed on step ids — so the same task always shuffles the same way. */
function deterministicShuffle<T>(items: T[], seedKey: string): T[] {
  let seed = 0;
  for (let i = 0; i < seedKey.length; i++) {
    seed = (seed * 31 + seedKey.charCodeAt(i)) >>> 0;
  }
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const FlowOrder: HomeworkWidget<FlowOrderState> = (
  props: HomeworkWidgetProps<FlowOrderState>,
) => {
  const { taskId, config, initialState, disabled, onChange } = props;
  const cfg = useMemo(() => normalizeConfig(config), [config]);

  const defaultState: FlowOrderState = useMemo(() => {
    if (!cfg) return { order: [], checked: false };
    const ids = cfg.steps.map((s) => s.id);
    if (ids.length <= 1) return { order: ids, checked: false };
    const firstId = cfg.lockFirst ? ids[0] : null;
    const lastId = cfg.lockLast ? ids[ids.length - 1] : null;
    const middle = ids.filter((id) => id !== firstId && id !== lastId);
    const shuffled = deterministicShuffle(
      middle,
      taskId + ":" + ids.join(","),
    );
    const order: string[] = [];
    if (firstId) order.push(firstId);
    order.push(...shuffled);
    if (lastId) order.push(lastId);
    return { order, checked: false };
  }, [cfg, taskId]);

  const [state, setState] = useState<FlowOrderState>(
    initialState ?? defaultState,
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const isOrderCorrect = useMemo(() => {
    if (!cfg) return false;
    const correct = cfg.steps.map((s) => s.id);
    if (state.order.length !== correct.length) return false;
    return state.order.every((id, i) => id === correct[i]);
  }, [cfg, state.order]);

  const completed = state.checked && isOrderCorrect;
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
        Configuration error: flow-order requires <code>prompt</code> and{" "}
        <code>steps[]</code>.
      </div>
    );
  }

  const stepById = (id: string) => cfg.steps.find((s) => s.id === id);
  const isLockedIndex = (i: number) => {
    if (cfg.lockFirst && i === 0) return true;
    if (cfg.lockLast && i === state.order.length - 1) return true;
    return false;
  };

  const move = (from: number, to: number) => {
    if (disabled) return;
    if (from === to) return;
    if (isLockedIndex(from)) return;
    if (isLockedIndex(to)) return;
    setState((prev) => {
      const next = prev.order.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { order: next, checked: false };
    });
  };

  const onDragStart = (id: string, index: number) => (e: React.DragEvent) => {
    if (disabled || isLockedIndex(index)) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const onDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (targetIndex: number) => (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    const sourceId = draggedId || e.dataTransfer.getData("text/plain");
    if (!sourceId) return;
    const sourceIndex = state.order.indexOf(sourceId);
    if (sourceIndex < 0) return;
    move(sourceIndex, targetIndex);
    setDraggedId(null);
  };

  const correctOrder = cfg.steps.map((s) => s.id);
  const misplacedCount = state.order.reduce(
    (acc, id, i) => acc + (id === correctOrder[i] ? 0 : 1),
    0,
  );

  return (
    <div
      className={
        "space-y-3" + (disabled ? " opacity-60 pointer-events-none" : "")
      }
    >
      <p className="text-sm text-gray-700">{cfg.prompt}</p>

      <ol className="space-y-2">
        {state.order.map((id, index) => {
          const step = stepById(id);
          if (!step) return null;
          const locked = isLockedIndex(index);
          const showResult = state.checked;
          const correctHere = correctOrder[index] === id;
          const cardBorder = showResult
            ? correctHere
              ? "border-success bg-success-light"
              : "border-danger bg-danger-light"
            : "border-gray-200 bg-white";
          const isExpanded = !!expanded[id];
          return (
            <li
              key={id}
              draggable={!disabled && !locked}
              onDragStart={onDragStart(id, index)}
              onDragOver={onDragOver}
              onDrop={onDrop(index)}
              className={
                "flex items-start gap-2 rounded-lg border p-2.5 transition-colors " +
                cardBorder +
                (locked ? "" : " cursor-grab active:cursor-grabbing")
              }
            >
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700"
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {locked && (
                    <span aria-label="locked" title="locked" className="text-xs">
                      🔒
                    </span>
                  )}
                  <span className="break-words text-sm font-medium text-gray-900">
                    {step.label}
                  </span>
                </div>
                {step.detail && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
                    }
                    className="mt-1 text-xs text-brand hover:underline"
                  >
                    {isExpanded ? "Hide detail" : "Show detail"}
                  </button>
                )}
                {step.detail && isExpanded && (
                  <p className="mt-1 break-words text-xs text-gray-600">
                    {step.detail}
                  </p>
                )}
              </div>
              {!locked && (
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={
                      disabled ||
                      index === 0 ||
                      isLockedIndex(index - 1)
                    }
                    onClick={() => move(index, index - 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-200 bg-white text-xs text-gray-600 hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={
                      disabled ||
                      index === state.order.length - 1 ||
                      isLockedIndex(index + 1)
                    }
                    onClick={() => move(index, index + 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-200 bg-white text-xs text-gray-600 hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↓
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => setState((prev) => ({ ...prev, checked: true }))}
          disabled={disabled}
        >
          Check order
        </Button>
        {state.checked && (
          <span
            className={
              "text-sm " +
              (isOrderCorrect ? "text-success" : "text-danger")
            }
          >
            {isOrderCorrect
              ? "Perfect — all steps in the right order."
              : `${misplacedCount} step${
                  misplacedCount === 1 ? "" : "s"
                } out of place.`}
          </span>
        )}
      </div>
    </div>
  );
};
