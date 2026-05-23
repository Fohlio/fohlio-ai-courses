"use client";

import { useState, type ComponentType } from "react";
import type {
  AnyHomeworkWidget,
  HomeworkWidgetProps,
} from "@/components/homework/widgets/types";
import type { WidgetProps } from "./registry";

/**
 * Bridge a graded-homework widget into the lesson-body widget contract.
 *
 * Homework widgets expect a submission lifecycle (taskId, initialState from
 * the server, onChange forwarded into the TaskCard submission flow). In a
 * lesson body there is no submission — the widget is for in-flow practice
 * only. The adapter keeps state in memory, supplies a synthetic taskId, and
 * drops the completion callback (the widget still surfaces its own check /
 * feedback UI inline).
 */
export function adaptHomeworkWidget(
  id: string,
  Widget: AnyHomeworkWidget,
): ComponentType<WidgetProps> {
  function HomeworkAdapter({ config }: WidgetProps) {
    const [state, setState] = useState<Record<string, unknown> | null>(null);

    const props: HomeworkWidgetProps<Record<string, unknown>> = {
      taskId: `lesson:${id}`,
      config,
      initialState: state,
      disabled: false,
      onChange: ({ state: next }) => setState(next),
    };

    return <Widget {...props} />;
  }

  HomeworkAdapter.displayName = `HomeworkAdapter(${id})`;
  return HomeworkAdapter;
}
