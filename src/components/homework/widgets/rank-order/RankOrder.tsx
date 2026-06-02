"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

/**
 * rank-order — order items along a stated dimension, then commit to the
 * single most-important one with a short justification.
 *
 * Unlike flow-order / code-order (pipeline or code sequence), this widget is
 * about ranking on an explicit criterion (priority, severity, business value,
 * risk, …). After ordering, the learner must actively pick the one item they
 * consider most important and justify it in their own words — so the task is
 * never just drag-and-done.
 *
 * Config shape (baked at seed time):
 *   {
 *     prompt: string;                  // what to rank and why
 *     criterion: string;              // dimension label, e.g. "business value"
 *     topLabel?: string;              // top-of-list meaning (default "Highest")
 *     bottomLabel?: string;           // bottom-of-list meaning (default "Lowest")
 *     items: { id: string; label: string; detail?: string }[];  // ≥2
 *     correctOrder: string[];         // item ids, top → bottom (the right ranking)
 *     topPickId?: string;             // the single most-important item (defaults to correctOrder[0])
 *     minJustificationWords?: number; // default 6
 *     explanation?: string;           // shown after check — why this ranking
 *   }
 *
 * State shape (persisted via onChange):
 *   {
 *     order: string[];                // current ranking, top → bottom
 *     topPickId: string | null;       // learner's chosen most-important item
 *     justification: string;
 *     checked: boolean;
 *   }
 *
 * completed === true only when the order matches correctOrder, the learner's
 * topPick matches the expected top pick, and the justification meets the
 * minimum word count.
 */

type RankItem = { id: string; label: string; detail?: string };

type RankOrderConfig = {
  prompt: string;
  criterion: string;
  topLabel: string;
  bottomLabel: string;
  items: RankItem[];
  correctOrder: string[];
  topPickId: string;
  minJustificationWords: number;
  explanation?: string;
};

export type RankOrderState = {
  order: string[];
  topPickId: string | null;
  justification: string;
  checked: boolean;
};

function normalizeConfig(raw: unknown): RankOrderConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.prompt !== "string") return null;
  if (typeof obj.criterion !== "string") return null;

  if (!Array.isArray(obj.items) || obj.items.length < 2) return null;
  const items: RankItem[] = [];
  const ids = new Set<string>();
  for (const it of obj.items) {
    if (!it || typeof it !== "object") return null;
    const iObj = it as Record<string, unknown>;
    if (typeof iObj.id !== "string" || typeof iObj.label !== "string") {
      return null;
    }
    if (ids.has(iObj.id)) return null;
    ids.add(iObj.id);
    items.push({
      id: iObj.id,
      label: iObj.label,
      detail: typeof iObj.detail === "string" ? iObj.detail : undefined,
    });
  }

  if (
    !Array.isArray(obj.correctOrder) ||
    obj.correctOrder.length !== items.length
  ) {
    return null;
  }
  const correctOrder: string[] = [];
  const seen = new Set<string>();
  for (const id of obj.correctOrder) {
    if (typeof id !== "string" || !ids.has(id) || seen.has(id)) return null;
    seen.add(id);
    correctOrder.push(id);
  }

  const topPickId =
    typeof obj.topPickId === "string" && ids.has(obj.topPickId)
      ? obj.topPickId
      : correctOrder[0];

  const minWords =
    typeof obj.minJustificationWords === "number" &&
    obj.minJustificationWords > 0
      ? Math.floor(obj.minJustificationWords)
      : 6;

  return {
    prompt: obj.prompt,
    criterion: obj.criterion,
    topLabel: typeof obj.topLabel === "string" ? obj.topLabel : "Highest",
    bottomLabel:
      typeof obj.bottomLabel === "string" ? obj.bottomLabel : "Lowest",
    items,
    correctOrder,
    topPickId,
    minJustificationWords: minWords,
    explanation:
      typeof obj.explanation === "string" ? obj.explanation : undefined,
  };
}

/** Deterministic shuffle keyed on a string — stable across server/client. */
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

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

export const RankOrder: HomeworkWidget<RankOrderState> = ({
  taskId,
  config,
  initialState,
  disabled,
  onChange,
}: HomeworkWidgetProps<RankOrderState>) => {
  const cfg = useMemo(() => normalizeConfig(config), [config]);

  const defaultState: RankOrderState = useMemo(() => {
    if (!cfg) {
      return { order: [], topPickId: null, justification: "", checked: false };
    }
    const ids = cfg.items.map((i) => i.id);
    const order =
      ids.length <= 1
        ? ids
        : deterministicShuffle(ids, taskId + ":" + ids.join(","));
    return { order, topPickId: null, justification: "", checked: false };
  }, [cfg, taskId]);

  const [state, setState] = useState<RankOrderState>(
    initialState ?? defaultState,
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);

  if (!cfg) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger-light p-3 text-sm text-danger">
        Configuration error: rank-order requires <code>prompt</code>,{" "}
        <code>criterion</code>, <code>items[]</code> (≥2), and a matching{" "}
        <code>correctOrder[]</code>.
      </div>
    );
  }

  const itemById = (id: string) => cfg.items.find((i) => i.id === id);

  const orderCorrect =
    state.order.length === cfg.correctOrder.length &&
    state.order.every((id, i) => id === cfg.correctOrder[i]);
  const topPickCorrect = state.topPickId === cfg.topPickId;
  const words = countWords(state.justification);
  const enoughWords = words >= cfg.minJustificationWords;
  const hasTopPick = state.topPickId !== null;
  const canCheck = hasTopPick && enoughWords && !disabled;
  const allCorrect = orderCorrect && topPickCorrect && enoughWords;

  function emit(next: RankOrderState) {
    setState(next);
    const ok =
      next.order.every((id, i) => id === cfg!.correctOrder[i]) &&
      next.topPickId === cfg!.topPickId &&
      countWords(next.justification) >= cfg!.minJustificationWords &&
      next.checked;
    onChange({ state: next, completed: ok });
  }

  function move(from: number, to: number) {
    if (disabled || from === to) return;
    if (to < 0 || to >= state.order.length) return;
    const order = state.order.slice();
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item);
    emit({ ...state, order, checked: false });
  }

  function setTopPick(id: string) {
    if (disabled) return;
    emit({
      ...state,
      topPickId: state.topPickId === id ? null : id,
      checked: false,
    });
  }

  function updateJustification(value: string) {
    if (disabled) return;
    emit({ ...state, justification: value, checked: false });
  }

  function handleCheck() {
    if (!canCheck) return;
    emit({ ...state, checked: true });
  }

  function onDragStart(id: string) {
    return (e: React.DragEvent) => {
      if (disabled) return;
      setDraggedId(id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
    };
  }
  function onDragOver(e: React.DragEvent) {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }
  function onDrop(targetIndex: number) {
    return (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      const sourceId = draggedId || e.dataTransfer.getData("text/plain");
      setDraggedId(null);
      if (!sourceId) return;
      const sourceIndex = state.order.indexOf(sourceId);
      if (sourceIndex < 0) return;
      move(sourceIndex, targetIndex);
    };
  }

  return (
    <div
      className={cn("space-y-3", disabled && "opacity-60 pointer-events-none")}
    >
      <div className="space-y-1">
        <p className="text-sm text-gray-700">{cfg.prompt}</p>
        <p className="text-xs text-gray-500">
          Rank by <span className="font-medium text-gray-700">{cfg.criterion}</span>.
        </p>
      </div>

      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-gray-400">
        <span>↑ {cfg.topLabel}</span>
        <span>{cfg.bottomLabel} ↓</span>
      </div>

      <ol className="space-y-2">
        {state.order.map((id, index) => {
          const item = itemById(id);
          if (!item) return null;
          const correctHere = state.checked && cfg.correctOrder[index] === id;
          const wrongHere = state.checked && cfg.correctOrder[index] !== id;
          const isTopPick = state.topPickId === id;
          const isExpanded = !!expanded[id];
          return (
            <li
              key={id}
              draggable={!disabled}
              onDragStart={onDragStart(id)}
              onDragOver={onDragOver}
              onDrop={onDrop(index)}
              className={cn(
                "flex items-start gap-2 rounded-lg border p-2.5 transition-colors",
                !disabled && "cursor-grab active:cursor-grabbing",
                correctHere && "border-success bg-success-light",
                wrongHere && "border-danger bg-danger-light",
                !state.checked &&
                  (isTopPick
                    ? "border-brand bg-brand/5"
                    : "border-gray-200 bg-white"),
              )}
            >
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700"
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-words text-sm font-medium text-gray-900">
                    {item.label}
                  </span>
                  {isTopPick && (
                    <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Top pick
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <button
                    type="button"
                    onClick={() => setTopPick(id)}
                    disabled={disabled}
                    aria-pressed={isTopPick}
                    className={cn(
                      "text-xs hover:underline",
                      isTopPick ? "font-medium text-brand" : "text-gray-500",
                    )}
                  >
                    {isTopPick ? "★ Most important" : "☆ Mark most important"}
                  </button>
                  {item.detail && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((p) => ({ ...p, [id]: !p[id] }))
                      }
                      className="text-xs text-brand hover:underline"
                    >
                      {isExpanded ? "Hide detail" : "Show detail"}
                    </button>
                  )}
                </div>
                {item.detail && isExpanded && (
                  <p className="mt-1 break-words text-xs text-gray-600">
                    {item.detail}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={disabled || index === 0}
                  onClick={() => move(index, index - 1)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-200 bg-white text-xs text-gray-600 hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={disabled || index === state.order.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-200 bg-white text-xs text-gray-600 hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ↓
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Why is your top pick the most important? (at least{" "}
          {cfg.minJustificationWords} words)
        </label>
        <textarea
          rows={3}
          value={state.justification}
          onChange={(e) => updateJustification(e.target.value)}
          disabled={disabled}
          placeholder="Explain your reasoning in your own words..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-gray-50 disabled:text-gray-500"
        />
        <p
          className={cn(
            "text-xs",
            enoughWords ? "text-success" : "text-gray-500",
          )}
        >
          {words} / {cfg.minJustificationWords} words
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={handleCheck} disabled={!canCheck}>
          Check ranking
        </Button>
        {!hasTopPick && (
          <span className="text-xs text-gray-500" role="status">
            Mark your most-important item.
          </span>
        )}
        {state.checked && (
          <span
            className={cn(
              "text-sm font-medium",
              allCorrect ? "text-success" : "text-danger",
            )}
            role="status"
          >
            {allCorrect
              ? "Spot on — ranking and top pick match."
              : !orderCorrect
                ? "The ranking is off. Reorder and retry."
                : !topPickCorrect
                  ? "Ranking is right, but reconsider your top pick."
                  : "Add a bit more to your justification."}
          </span>
        )}
      </div>

      {state.checked && cfg.explanation && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <p className="mb-1 font-medium text-gray-900">Why this ranking</p>
          <p className="break-words">{cfg.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default RankOrder;
