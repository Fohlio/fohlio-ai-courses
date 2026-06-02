"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

/**
 * categorize — assign many items into a few labeled buckets.
 *
 * The learner places every item into exactly one category. On check, each
 * item is marked right/wrong against its config-supplied correct category and
 * the learner can keep retrying until everything lands correctly. Distinct
 * from concept-match (1:1 pairing): here N items fan out into M buckets and
 * several items can share a bucket.
 *
 * Config shape (baked at seed time):
 *   {
 *     prompt: string;                         // task instruction
 *     categories: { id: string; label: string; hint?: string }[];  // ≥2 buckets
 *     items: {
 *       id: string;
 *       label: string;
 *       correctCategoryId: string;            // must match a category id
 *     }[];                                     // ≥2 items
 *   }
 *
 * State shape (persisted via onChange):
 *   {
 *     placements: Record<string, string>;     // itemId -> categoryId (or absent = unplaced)
 *     checked: boolean;
 *   }
 *
 * completed === true only when every item is placed in its correct category.
 */

type CategorizeCategory = { id: string; label: string; hint?: string };
type CategorizeItem = { id: string; label: string; correctCategoryId: string };

type CategorizeConfig = {
  prompt: string;
  categories: CategorizeCategory[];
  items: CategorizeItem[];
};

export type CategorizeState = {
  placements: Record<string, string>;
  checked: boolean;
};

const UNPLACED = "__unplaced__";

function normalizeConfig(raw: unknown): CategorizeConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.prompt !== "string") return null;

  if (!Array.isArray(obj.categories) || obj.categories.length < 2) return null;
  const categories: CategorizeCategory[] = [];
  const catIds = new Set<string>();
  for (const c of obj.categories) {
    if (!c || typeof c !== "object") return null;
    const cObj = c as Record<string, unknown>;
    if (typeof cObj.id !== "string" || typeof cObj.label !== "string") {
      return null;
    }
    if (cObj.id === UNPLACED || catIds.has(cObj.id)) return null;
    catIds.add(cObj.id);
    categories.push({
      id: cObj.id,
      label: cObj.label,
      hint: typeof cObj.hint === "string" ? cObj.hint : undefined,
    });
  }

  if (!Array.isArray(obj.items) || obj.items.length < 2) return null;
  const items: CategorizeItem[] = [];
  const itemIds = new Set<string>();
  for (const it of obj.items) {
    if (!it || typeof it !== "object") return null;
    const iObj = it as Record<string, unknown>;
    if (
      typeof iObj.id !== "string" ||
      typeof iObj.label !== "string" ||
      typeof iObj.correctCategoryId !== "string"
    ) {
      return null;
    }
    if (itemIds.has(iObj.id)) return null;
    if (!catIds.has(iObj.correctCategoryId)) return null;
    itemIds.add(iObj.id);
    items.push({
      id: iObj.id,
      label: iObj.label,
      correctCategoryId: iObj.correctCategoryId,
    });
  }

  return { prompt: obj.prompt, categories, items };
}

/** Deterministic shuffle keyed on a string — same task always shuffles the same. */
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

export const Categorize: HomeworkWidget<CategorizeState> = ({
  taskId,
  config,
  initialState,
  disabled,
  onChange,
}: HomeworkWidgetProps<CategorizeState>) => {
  const cfg = useMemo(() => normalizeConfig(config), [config]);

  const defaultState: CategorizeState = useMemo(
    () => ({ placements: {}, checked: false }),
    [],
  );

  const [state, setState] = useState<CategorizeState>(
    initialState ?? defaultState,
  );
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const shuffledItems = useMemo(() => {
    if (!cfg) return [];
    return deterministicShuffle(
      cfg.items,
      taskId + ":" + cfg.items.map((i) => i.id).join(","),
    );
  }, [cfg, taskId]);

  if (!cfg) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger-light p-3 text-sm text-danger">
        Configuration error: categorize requires <code>prompt</code>,{" "}
        <code>categories[]</code> (≥2), and <code>items[]</code> (≥2) with valid{" "}
        <code>correctCategoryId</code>.
      </div>
    );
  }

  const allPlaced = cfg.items.every((it) => state.placements[it.id]);
  const correctCount = cfg.items.reduce(
    (acc, it) =>
      acc + (state.placements[it.id] === it.correctCategoryId ? 1 : 0),
    0,
  );
  const allCorrect = correctCount === cfg.items.length;

  function commit(next: CategorizeState) {
    setState(next);
    onChange({ state: next, completed: next.checked && allCorrectFor(next) });
  }

  function allCorrectFor(s: CategorizeState): boolean {
    return cfg!.items.every(
      (it) => s.placements[it.id] === it.correctCategoryId,
    );
  }

  function place(itemId: string, categoryId: string) {
    if (disabled) return;
    const placements = { ...state.placements, [itemId]: categoryId };
    commit({ placements, checked: false });
    setActiveItemId(null);
  }

  function unplace(itemId: string) {
    if (disabled) return;
    const placements = { ...state.placements };
    delete placements[itemId];
    commit({ placements, checked: false });
  }

  function handleCheck() {
    if (disabled || !allPlaced) return;
    const next: CategorizeState = { ...state, checked: true };
    setState(next);
    onChange({ state: next, completed: allCorrectFor(next) });
  }

  function onDragStart(itemId: string) {
    return (e: React.DragEvent) => {
      if (disabled) return;
      setDraggedId(itemId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", itemId);
    };
  }

  function onDragOver(e: React.DragEvent) {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function onDropCategory(categoryId: string) {
    return (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      const itemId = draggedId || e.dataTransfer.getData("text/plain");
      setDraggedId(null);
      if (!itemId) return;
      place(itemId, categoryId);
    };
  }

  const unplacedItems = shuffledItems.filter((it) => !state.placements[it.id]);

  return (
    <div
      className={cn("space-y-3", disabled && "opacity-60 pointer-events-none")}
    >
      <p className="text-sm text-gray-700">{cfg.prompt}</p>

      {/* Item tray */}
      <div
        className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-2"
        aria-label="Unsorted items"
      >
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          Items to sort
          {activeItemId && (
            <span className="ml-2 font-normal normal-case text-brand">
              — now pick a category below
            </span>
          )}
        </p>
        {unplacedItems.length === 0 ? (
          <p className="px-1 py-2 text-sm text-gray-400">
            All items placed. Check your work, or tap a placed item to move it.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {unplacedItems.map((it) => {
              const active = activeItemId === it.id;
              return (
                <li key={it.id}>
                  <button
                    type="button"
                    draggable={!disabled}
                    onDragStart={onDragStart(it.id)}
                    onClick={() =>
                      setActiveItemId((prev) => (prev === it.id ? null : it.id))
                    }
                    disabled={disabled}
                    aria-pressed={active}
                    className={cn(
                      "min-h-[44px] cursor-grab rounded-lg border px-3 py-2 text-left text-sm active:cursor-grabbing",
                      active
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-gray-300 bg-white text-gray-800 hover:border-brand/50",
                    )}
                  >
                    {it.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cfg.categories.map((cat) => {
          const placed = cfg.items.filter(
            (it) => state.placements[it.id] === cat.id,
          );
          const droppable = activeItemId !== null && !disabled;
          return (
            <div
              key={cat.id}
              onDragOver={onDragOver}
              onDrop={onDropCategory(cat.id)}
              onClick={() => {
                if (activeItemId) place(activeItemId, cat.id);
              }}
              className={cn(
                "rounded-lg border p-2 transition-colors",
                droppable
                  ? "cursor-pointer border-brand/50 bg-brand/5"
                  : "border-gray-200 bg-white",
              )}
            >
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {cat.label}
                </p>
                <span className="text-xs text-gray-400">{placed.length}</span>
              </div>
              {cat.hint && (
                <p className="mb-2 text-xs text-gray-500">{cat.hint}</p>
              )}
              {droppable && (
                <p className="mb-1 text-xs font-medium text-brand">
                  Drop or tap to place here
                </p>
              )}
              <ul className="space-y-1.5">
                {placed.length === 0 && (
                  <li className="rounded border border-dashed border-gray-200 px-2 py-2 text-xs text-gray-400">
                    Empty
                  </li>
                )}
                {placed.map((it) => {
                  const correct =
                    state.checked && it.correctCategoryId === cat.id;
                  const wrong =
                    state.checked && it.correctCategoryId !== cat.id;
                  return (
                    <li key={it.id}>
                      <div
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-sm",
                          correct && "border-success bg-success-light",
                          wrong && "border-danger bg-danger-light",
                          !state.checked && "border-gray-200 bg-gray-50",
                        )}
                      >
                        <span className="flex-1 break-words text-gray-800">
                          {it.label}
                        </span>
                        {correct && (
                          <span
                            className="text-xs font-medium text-success"
                            aria-hidden
                          >
                            ✓
                          </span>
                        )}
                        {wrong && (
                          <span
                            className="text-xs font-medium text-danger"
                            aria-hidden
                          >
                            ✗
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            unplace(it.id);
                          }}
                          disabled={disabled}
                          aria-label={`Remove ${it.label} from ${cat.label}`}
                          className="shrink-0 rounded px-1 text-xs text-gray-400 hover:text-danger"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={handleCheck}
          disabled={disabled || !allPlaced}
        >
          Check categories
        </Button>
        {!allPlaced && (
          <span className="text-xs text-gray-500" role="status">
            Place every item to check.
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
            {correctCount} of {cfg.items.length} in the right category
            {allCorrect ? " — all sorted." : ". Move the marked ones and retry."}
          </span>
        )}
      </div>
    </div>
  );
};

export default Categorize;
