import type { ComponentType } from "react";

export type WidgetProps = { config: Record<string, unknown> };

// Course widgets are appended here in alphabetical order by the
// course-widget-builder agent. Keep imports + entries sorted.
export const widgetRegistry = {} satisfies Record<string, ComponentType<WidgetProps>>;

export type WidgetId = keyof typeof widgetRegistry;
