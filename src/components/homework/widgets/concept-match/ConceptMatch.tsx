"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

type ConceptPair = {
  id: string;
  term: string;
  definition: string;
};

type ConceptMatchConfig = {
  pairs: ConceptPair[];
};

export type ConceptMatchState = {
  links: Record<string, string>;
};

function normalizeConfig(raw: unknown): ConceptMatchConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.pairs) || obj.pairs.length === 0) return null;
  const pairs: ConceptPair[] = [];
  const seen = new Set<string>();
  for (const p of obj.pairs) {
    if (!p || typeof p !== "object") return null;
    const pObj = p as Record<string, unknown>;
    if (
      typeof pObj.id !== "string" ||
      typeof pObj.term !== "string" ||
      typeof pObj.definition !== "string"
    ) {
      return null;
    }
    if (seen.has(pObj.id)) return null;
    seen.add(pObj.id);
    pairs.push({ id: pObj.id, term: pObj.term, definition: pObj.definition });
  }
  return { pairs };
}

function shufflePairs<T>(items: T[]): T[] {
  // Deterministic reversal — keeps definition column visibly out of order
  // without an RNG (so server/client render matches).
  if (items.length <= 1) return items.slice();
  const out = items.slice().reverse();
  // For length 2 the reverse is fine. For longer, rotate by floor(n/2) so
  // it's not a trivial reverse.
  const n = out.length;
  const k = Math.floor(n / 2);
  return out.slice(k).concat(out.slice(0, k));
}

export const ConceptMatch: HomeworkWidget<ConceptMatchState> = ({
  config,
  initialState,
  disabled,
  onChange,
}: HomeworkWidgetProps<ConceptMatchState>) => {
  const normalized = useMemo(() => normalizeConfig(config), [config]);

  const defaultState: ConceptMatchState = useMemo(
    () => ({ links: {} }),
    [],
  );

  const [state, setState] = useState<ConceptMatchState>(
    initialState ?? defaultState,
  );
  const [activeTermId, setActiveTermId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const shuffledDefinitions = useMemo(() => {
    if (!normalized) return [];
    return shufflePairs(normalized.pairs);
  }, [normalized]);

  if (!normalized) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger-light p-3 text-sm text-danger">
        Configuration error: this concept-match task is missing valid{" "}
        <code>pairs</code>.
      </div>
    );
  }

  function findTermForDefinition(defId: string): string | undefined {
    for (const [termId, dId] of Object.entries(state.links)) {
      if (dId === defId) return termId;
    }
    return undefined;
  }

  function commit(nextLinks: Record<string, string>) {
    const nextState: ConceptMatchState = { links: nextLinks };
    setState(nextState);
    setChecked(false);
    onChange({ state: nextState, completed: false });
  }

  function selectTerm(termId: string) {
    if (disabled) return;
    if (state.links[termId]) {
      // Clear existing pairing for this term.
      const next = { ...state.links };
      delete next[termId];
      commit(next);
      setActiveTermId(termId);
      return;
    }
    setActiveTermId((prev) => (prev === termId ? null : termId));
  }

  function selectDefinition(defId: string) {
    if (disabled) return;
    if (!activeTermId) return;
    // Remove any other term currently linked to this definition.
    const next: Record<string, string> = {};
    for (const [t, d] of Object.entries(state.links)) {
      if (d !== defId) next[t] = d;
    }
    next[activeTermId] = defId;
    commit(next);
    setActiveTermId(null);
  }

  function setMobileSelect(termId: string, defIdOrEmpty: string) {
    if (disabled) return;
    if (!defIdOrEmpty) {
      const next = { ...state.links };
      delete next[termId];
      commit(next);
      return;
    }
    const next: Record<string, string> = {};
    for (const [t, d] of Object.entries(state.links)) {
      if (d !== defIdOrEmpty) next[t] = d;
    }
    next[termId] = defIdOrEmpty;
    commit(next);
  }

  const totalPairs = normalized.pairs.length;
  const correctCount = normalized.pairs.reduce(
    (acc, p) => acc + (state.links[p.id] === p.id ? 1 : 0),
    0,
  );
  const allCorrect = correctCount === totalPairs;

  function handleCheck() {
    if (disabled) return;
    setChecked(true);
    onChange({ state, completed: allCorrect });
  }

  return (
    <div
      className={cn(
        "space-y-3",
        disabled && "opacity-60 pointer-events-none",
      )}
    >
      {/* Desktop / tablet — two-column tap-to-pair */}
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-3">
        <ul className="space-y-2" aria-label="Terms">
          {normalized.pairs.map((pair) => {
            const linkedDefId = state.links[pair.id];
            const isActive = activeTermId === pair.id;
            const linked = Boolean(linkedDefId);
            const correct = checked && linkedDefId === pair.id;
            const wrong = checked && linked && linkedDefId !== pair.id;
            return (
              <li key={pair.id}>
                <button
                  type="button"
                  onClick={() => selectTerm(pair.id)}
                  disabled={disabled}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg border p-2 text-left text-sm",
                    "min-h-[44px]",
                    isActive && "border-brand bg-brand/10",
                    !isActive && !checked && linked && "border-gray-300 bg-gray-50",
                    !isActive && !checked && !linked && "border-gray-200 hover:bg-gray-50",
                    correct && "border-success bg-success-light",
                    wrong && "border-danger bg-danger-light",
                  )}
                  aria-pressed={isActive}
                >
                  <span className="font-medium text-gray-900">{pair.term}</span>
                  {linked && (
                    <span className="text-xs text-gray-500" aria-hidden>
                      ↔
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <ul className="space-y-2" aria-label="Definitions">
          {shuffledDefinitions.map((def) => {
            const matchedTermId = findTermForDefinition(def.id);
            const linked = Boolean(matchedTermId);
            const correct = checked && matchedTermId === def.id;
            const wrong = checked && linked && matchedTermId !== def.id;
            const selectable = activeTermId !== null && !disabled;
            return (
              <li key={def.id}>
                <button
                  type="button"
                  onClick={() => selectDefinition(def.id)}
                  disabled={disabled || !selectable}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg border p-2 text-left text-sm",
                    "min-h-[44px]",
                    !checked && linked && "border-gray-300 bg-gray-50",
                    !checked && !linked && selectable && "border-brand/40 hover:bg-brand/5",
                    !checked && !linked && !selectable && "border-gray-200",
                    correct && "border-success bg-success-light",
                    wrong && "border-danger bg-danger-light",
                  )}
                >
                  <span className="flex-1 text-gray-800">{def.definition}</span>
                  {linked && (
                    <span className="shrink-0 text-xs text-gray-500" aria-hidden>
                      {normalized.pairs.find((p) => p.id === matchedTermId)?.term}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mobile — explicit select per term */}
      <ul className="space-y-2 sm:hidden" aria-label="Terms">
        {normalized.pairs.map((pair) => {
          const linkedDefId = state.links[pair.id] ?? "";
          const correct = checked && linkedDefId === pair.id;
          const wrong = checked && linkedDefId && linkedDefId !== pair.id;
          return (
            <li
              key={pair.id}
              className={cn(
                "rounded-lg border p-2",
                correct && "border-success bg-success-light",
                wrong && "border-danger bg-danger-light",
                !checked && "border-gray-200",
              )}
            >
              <p className="mb-1 text-sm font-medium text-gray-900">{pair.term}</p>
              <select
                aria-label={`Definition for ${pair.term}`}
                value={linkedDefId}
                onChange={(e) => setMobileSelect(pair.id, e.target.value)}
                disabled={disabled}
                className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="">— choose definition —</option>
                {shuffledDefinitions.map((def) => (
                  <option key={def.id} value={def.id}>
                    {def.definition}
                  </option>
                ))}
              </select>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" onClick={handleCheck} disabled={disabled}>
          Check matches
        </Button>
        {checked && (
          <span
            className={cn(
              "text-sm font-medium",
              allCorrect ? "text-success" : "text-danger",
            )}
            role="status"
          >
            {correctCount} of {totalPairs} matched correctly
            {allCorrect ? " — all done." : "."}
          </span>
        )}
        {!checked && activeTermId && (
          <span className="text-xs text-gray-500" role="status">
            Pick the matching definition on the right.
          </span>
        )}
      </div>
    </div>
  );
};
