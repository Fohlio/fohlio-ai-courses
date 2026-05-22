"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

type ArchSlot = { id: string; label: string; correctNodeId: string };
type ArchNode = { id: string; label: string; hint?: string };

type ArchDiagramConfig = {
  prompt: string;
  slots: ArchSlot[];
  nodes: ArchNode[];
};

type ArchDiagramState = {
  placements: Record<string, string | null>;
  checked: boolean;
};

function normalizeConfig(raw: Record<string, unknown>): ArchDiagramConfig | null {
  const prompt = typeof raw.prompt === "string" ? raw.prompt : null;
  const slotsRaw = Array.isArray(raw.slots) ? raw.slots : null;
  const nodesRaw = Array.isArray(raw.nodes) ? raw.nodes : null;
  if (!prompt || !slotsRaw || !nodesRaw) return null;

  const slots: ArchSlot[] = [];
  for (const s of slotsRaw) {
    if (!s || typeof s !== "object") return null;
    const obj = s as Record<string, unknown>;
    if (
      typeof obj.id !== "string" ||
      typeof obj.label !== "string" ||
      typeof obj.correctNodeId !== "string"
    ) {
      return null;
    }
    slots.push({
      id: obj.id,
      label: obj.label,
      correctNodeId: obj.correctNodeId,
    });
  }
  const nodes: ArchNode[] = [];
  for (const n of nodesRaw) {
    if (!n || typeof n !== "object") return null;
    const obj = n as Record<string, unknown>;
    if (typeof obj.id !== "string" || typeof obj.label !== "string") {
      return null;
    }
    nodes.push({
      id: obj.id,
      label: obj.label,
      hint: typeof obj.hint === "string" ? obj.hint : undefined,
    });
  }
  return { prompt, slots, nodes };
}

export const ArchDiagram: HomeworkWidget<ArchDiagramState> = (
  props: HomeworkWidgetProps<ArchDiagramState>,
) => {
  const { config, initialState, disabled, onChange } = props;
  const cfg = useMemo(() => normalizeConfig(config), [config]);

  const defaultState: ArchDiagramState = useMemo(() => {
    const placements: Record<string, string | null> = {};
    if (cfg) for (const s of cfg.slots) placements[s.id] = null;
    return { placements, checked: false };
  }, [cfg]);

  const [state, setState] = useState<ArchDiagramState>(
    initialState ?? defaultState,
  );
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  const allCorrect = useMemo(() => {
    if (!cfg) return false;
    return cfg.slots.every(
      (s) => state.placements[s.id] === s.correctNodeId,
    );
  }, [cfg, state.placements]);

  const completed = state.checked && allCorrect;
  const lastEmitRef = useRef<string>("");

  useEffect(() => {
    const key = JSON.stringify({ s: state, c: completed });
    if (key === lastEmitRef.current) return;
    lastEmitRef.current = key;
    onChange({ state, completed });
  }, [state, completed, onChange]);

  if (!cfg) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
        Configuration error: arch-diagram requires <code>prompt</code>,{" "}
        <code>slots[]</code>, and <code>nodes[]</code>.
      </div>
    );
  }

  const placedNodeIds = new Set(
    Object.values(state.placements).filter((v): v is string => v !== null),
  );
  const poolNodes = cfg.nodes.filter((n) => !placedNodeIds.has(n.id));

  const placeNode = (slotId: string, nodeId: string | null) => {
    if (disabled) return;
    setState((prev) => {
      const next: Record<string, string | null> = { ...prev.placements };
      // if this node is already placed elsewhere, clear that slot
      if (nodeId) {
        for (const sid of Object.keys(next)) {
          if (next[sid] === nodeId) next[sid] = null;
        }
      }
      next[slotId] = nodeId;
      return { placements: next, checked: false };
    });
  };

  const clearSlot = (slotId: string) => {
    if (disabled) return;
    setState((prev) => ({
      placements: { ...prev.placements, [slotId]: null },
      checked: false,
    }));
  };

  const onDragStartNode = (nodeId: string) => (e: React.DragEvent) => {
    if (disabled) return;
    setDraggedNode(nodeId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", nodeId);
  };

  const onDragOverSlot = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDropSlot = (slotId: string) => (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    const nodeId =
      draggedNode || e.dataTransfer.getData("text/plain") || null;
    if (nodeId) placeNode(slotId, nodeId);
    setDraggedNode(null);
  };

  const onDropPool = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    // remove dragged node from any slot it's in
    const nodeId =
      draggedNode || e.dataTransfer.getData("text/plain") || null;
    if (!nodeId) return;
    setState((prev) => {
      const next = { ...prev.placements };
      for (const sid of Object.keys(next)) {
        if (next[sid] === nodeId) next[sid] = null;
      }
      return { placements: next, checked: false };
    });
    setDraggedNode(null);
  };

  const nodeById = (id: string | null) =>
    id ? cfg.nodes.find((n) => n.id === id) ?? null : null;

  const correctCount = cfg.slots.filter(
    (s) => state.placements[s.id] === s.correctNodeId,
  ).length;

  return (
    <div
      className={
        "space-y-4" + (disabled ? " opacity-60 pointer-events-none" : "")
      }
    >
      <p className="text-sm text-gray-700">{cfg.prompt}</p>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Diagram slots
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cfg.slots.map((slot) => {
            const placed = nodeById(state.placements[slot.id] ?? null);
            const isCorrect = state.placements[slot.id] === slot.correctNodeId;
            const showResult = state.checked;
            const borderClass = showResult
              ? isCorrect
                ? "border-green-400 bg-green-50"
                : "border-red-400 bg-red-50"
              : "border-dashed border-gray-300 bg-gray-50";
            return (
              <div
                key={slot.id}
                onDragOver={onDragOverSlot}
                onDrop={onDropSlot(slot.id)}
                className={
                  "rounded-lg border-2 p-3 transition-colors " + borderClass
                }
              >
                <div className="mb-2 text-xs font-medium text-gray-600">
                  {slot.label}
                </div>
                {placed ? (
                  <div
                    draggable={!disabled}
                    onDragStart={onDragStartNode(placed.id)}
                    className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm"
                  >
                    <span className="break-words font-medium">
                      {placed.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => clearSlot(slot.id)}
                      disabled={disabled}
                      aria-label={`Remove ${placed.label}`}
                      className="ml-auto inline-flex h-7 min-w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="text-xs italic text-gray-400">
                    Drop a node here
                  </div>
                )}
                <label className="mt-2 block text-xs text-gray-500">
                  <span className="sr-only">Keyboard placement</span>
                  <select
                    value={state.placements[slot.id] ?? ""}
                    onChange={(e) =>
                      placeNode(slot.id, e.target.value || null)
                    }
                    disabled={disabled}
                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
                  >
                    <option value="">(empty)</option>
                    {cfg.nodes
                      .filter(
                        (n) =>
                          !placedNodeIds.has(n.id) ||
                          state.placements[slot.id] === n.id,
                      )
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.label}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div
        onDragOver={onDragOverSlot}
        onDrop={onDropPool}
        className="rounded-lg border border-gray-200 bg-white p-3"
      >
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Node pool (drag into slots)
        </div>
        {poolNodes.length === 0 ? (
          <div className="text-xs italic text-gray-400">
            All nodes placed.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {poolNodes.map((n) => (
              <div
                key={n.id}
                draggable={!disabled}
                onDragStart={onDragStartNode(n.id)}
                className="cursor-grab rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm hover:border-brand active:cursor-grabbing"
                title={n.hint}
              >
                {n.label}
                {n.hint && (
                  <span className="ml-1 text-xs text-gray-400">
                    ({n.hint})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setState((prev) => ({ ...prev, checked: true }))}
          disabled={disabled}
          className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check diagram
        </button>
        {state.checked && (
          <span
            className={
              "text-sm " +
              (allCorrect ? "text-green-700" : "text-red-700")
            }
          >
            {correctCount} / {cfg.slots.length} correct
            {allCorrect ? " — perfect!" : ""}
          </span>
        )}
      </div>
    </div>
  );
};
