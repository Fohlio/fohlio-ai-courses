"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { HomeworkWidget, HomeworkWidgetProps } from "../types";

type Outcome = {
  kind: "correct" | "wrong" | "suboptimal";
  explanation: string;
};

type NodeOption = {
  label: string;
  nextNodeId?: string;
  outcome?: Outcome;
};

type TreeNode = {
  id: string;
  question: string;
  options: NodeOption[];
};

type NormalizedConfig = {
  rootId: string;
  nodes: Record<string, TreeNode>;
};

export type DecisionTreeState = {
  path: Array<{ nodeId: string; optionIndex: number }>;
  outcome: "correct" | "wrong" | "suboptimal" | null;
};

function normalize(config: Record<string, unknown>): NormalizedConfig | null {
  try {
    const rootId = String(config.rootId ?? "");
    const rawNodes = (config.nodes ?? {}) as Record<string, unknown>;
    if (!rootId || typeof rawNodes !== "object" || rawNodes == null) return null;

    const nodes: Record<string, TreeNode> = {};
    for (const [id, raw] of Object.entries(rawNodes)) {
      const r = raw as Record<string, unknown>;
      const opts = Array.isArray(r.options) ? (r.options as Record<string, unknown>[]) : [];
      const options: NodeOption[] = opts.map((o) => {
        const out = o.outcome as Record<string, unknown> | undefined;
        return {
          label: String(o.label ?? ""),
          nextNodeId: o.nextNodeId != null ? String(o.nextNodeId) : undefined,
          outcome:
            out && (out.kind === "correct" || out.kind === "wrong" || out.kind === "suboptimal")
              ? { kind: out.kind, explanation: String(out.explanation ?? "") }
              : undefined,
        };
      });
      nodes[id] = {
        id: String(r.id ?? id),
        question: String(r.question ?? ""),
        options,
      };
    }

    if (!nodes[rootId]) return null;
    for (const n of Object.values(nodes)) {
      if (!n.question || n.options.length === 0) return null;
    }

    return { rootId, nodes };
  } catch {
    return null;
  }
}

const defaultState: DecisionTreeState = { path: [], outcome: null };

function currentNode(
  cfg: NormalizedConfig,
  state: DecisionTreeState,
): TreeNode | null {
  if (state.outcome) return null;
  if (state.path.length === 0) return cfg.nodes[cfg.rootId] ?? null;
  const last = state.path[state.path.length - 1];
  const node = cfg.nodes[last.nodeId];
  if (!node) return null;
  const chosen = node.options[last.optionIndex];
  if (!chosen?.nextNodeId) return null;
  return cfg.nodes[chosen.nextNodeId] ?? null;
}

export function DecisionTree(props: HomeworkWidgetProps<DecisionTreeState>) {
  const cfg = useMemo(() => normalize(props.config), [props.config]);
  if (!cfg) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger-light p-3 text-sm text-danger">
        Configuration error: decision-tree widget is missing required fields.
      </div>
    );
  }
  return <DecisionTreeInner {...props} cfg={cfg} />;
}

function DecisionTreeInner({
  cfg,
  initialState,
  disabled,
  onChange,
}: HomeworkWidgetProps<DecisionTreeState> & { cfg: NormalizedConfig }) {
  const [state, setState] = useState<DecisionTreeState>(
    () => initialState ?? defaultState,
  );
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const completed = state.outcome === "correct";

  useEffect(() => {
    onChangeRef.current({ state, completed });
  }, [state, completed]);

  const node = currentNode(cfg, state);

  function choose(optionIndex: number) {
    if (disabled || state.outcome) return;
    const here = node;
    if (!here) return;
    const option = here.options[optionIndex];
    if (!option) return;

    const newPath = [...state.path, { nodeId: here.id, optionIndex }];

    if (option.outcome) {
      setState({ path: newPath, outcome: option.outcome.kind });
    } else if (option.nextNodeId && cfg.nodes[option.nextNodeId]) {
      setState({ path: newPath, outcome: null });
    } else {
      // Dead branch — treat as wrong.
      setState({ path: newPath, outcome: "wrong" });
    }
  }

  function startOver() {
    if (disabled) return;
    setState(defaultState);
  }

  // Build breadcrumbs of the path so far.
  const crumbs = state.path.map((step, i) => {
    const n = cfg.nodes[step.nodeId];
    const opt = n?.options[step.optionIndex];
    return { idx: i, label: opt?.label ?? "?", nodeQ: n?.question ?? "" };
  });

  // Find the terminating outcome to show its explanation.
  const terminalOutcome = useMemo<Outcome | null>(() => {
    if (!state.outcome || state.path.length === 0) return null;
    const last = state.path[state.path.length - 1];
    const n = cfg.nodes[last.nodeId];
    const opt = n?.options[last.optionIndex];
    return opt?.outcome ?? null;
  }, [state.outcome, state.path, cfg.nodes]);

  return (
    <div
      className={cn(
        "space-y-3",
        disabled && "opacity-60 pointer-events-none",
      )}
    >
      {crumbs.length > 0 && (
        <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-600">
          {crumbs.map((c) => (
            <li key={c.idx} className="flex items-center gap-1">
              <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5">
                Q{c.idx + 1}: {c.label}
              </span>
              <span aria-hidden className="text-gray-400">
                →
              </span>
            </li>
          ))}
        </ol>
      )}

      {node && !state.outcome && (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="mb-3 text-sm font-medium text-gray-900">
            {node.question}
          </div>
          <ul className="grid gap-2">
            {node.options.map((o, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => choose(i)}
                  disabled={disabled}
                  className={cn(
                    "min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm",
                    "hover:border-brand hover:bg-brand-light/30",
                    "focus:outline-none focus:ring-2 focus:ring-brand/40",
                    "disabled:cursor-not-allowed",
                  )}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.outcome && terminalOutcome && (
        <div
          className={cn(
            "rounded-lg border p-3 text-sm",
            terminalOutcome.kind === "correct" &&
              "border-success/40 bg-success-light text-success",
            terminalOutcome.kind === "wrong" &&
              "border-danger/40 bg-danger-light text-danger",
            terminalOutcome.kind === "suboptimal" &&
              "border-warning/40 bg-warning-light text-warning",
          )}
          role="status"
        >
          <div className="mb-1 font-semibold capitalize">
            {terminalOutcome.kind === "correct"
              ? "✓ Correct"
              : terminalOutcome.kind === "wrong"
                ? "✗ Wrong path"
                : "⚠ Suboptimal"}
          </div>
          <div>{terminalOutcome.explanation}</div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={startOver}
          disabled={disabled || state.path.length === 0}
        >
          Start over
        </Button>
        {state.outcome === "correct" && (
          <span className="text-sm font-medium text-success">
            ✓ Path complete.
          </span>
        )}
      </div>
    </div>
  );
}

const _typecheck: HomeworkWidget<DecisionTreeState> = DecisionTree;
void _typecheck;
