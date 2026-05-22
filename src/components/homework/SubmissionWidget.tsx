"use client";

import { useCallback, useMemo } from "react";
import type { WidgetContent } from "@/lib/types";
import { homeworkWidgetRegistry } from "./widgets/registry";
import type { AnyHomeworkWidget } from "./widgets/types";

interface SubmissionWidgetProps {
  taskId: string;
  widgetId: string | null;
  widgetConfig: Record<string, unknown> | null;
  value: WidgetContent | null;
  onChange: (content: WidgetContent | null) => void;
  disabled?: boolean;
}

export function SubmissionWidget({
  taskId,
  widgetId,
  widgetConfig,
  value,
  onChange,
  disabled,
}: SubmissionWidgetProps) {
  const Widget = useMemo(() => {
    if (!widgetId) return null;
    return (homeworkWidgetRegistry as Record<string, AnyHomeworkWidget>)[
      widgetId
    ];
  }, [widgetId]);

  const handleChange = useCallback(
    ({
      state,
      completed,
    }: {
      state: Record<string, unknown>;
      completed: boolean;
    }) => {
      if (!widgetId) {
        onChange(null);
        return;
      }
      onChange({
        type: "widget",
        widgetId,
        state,
        completed,
      });
    },
    [widgetId, onChange],
  );

  if (!widgetId) {
    return (
      <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
        This widget task is missing its widget id. Ask the course owner to
        repair the task definition.
      </div>
    );
  }

  if (!Widget) {
    return (
      <div className="rounded-lg border border-dashed border-red-300 bg-red-50 p-3 text-sm text-red-700">
        Unknown widget <code className="font-mono">{widgetId}</code>. Was it
        renamed or removed from the registry?
      </div>
    );
  }

  return (
    <Widget
      taskId={taskId}
      config={widgetConfig ?? {}}
      initialState={(value?.state as Record<string, unknown> | undefined) ?? null}
      disabled={Boolean(disabled)}
      onChange={handleChange}
    />
  );
}
