"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { widgetRegistry, type WidgetId, type WidgetProps } from "./widgets/registry";

interface MountedWidget {
  id: string;
  widgetId: WidgetId;
  host: HTMLElement;
  Component: ComponentType<WidgetProps>;
  config: Record<string, unknown>;
}

function decodeConfig(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function LessonWidgets() {
  const [mounts, setMounts] = useState<MountedWidget[]>([]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".lesson-content");
    if (!root) return;

    const next: MountedWidget[] = [];
    const hosts = root.querySelectorAll<HTMLElement>("[data-widget]");

    hosts.forEach((host, index) => {
      const widgetId = host.dataset.widget as WidgetId | undefined;
      if (!widgetId) return;

      const Component = (widgetRegistry as Record<string, ComponentType<WidgetProps>>)[widgetId];
      if (!Component) {
        host.innerHTML = `<div style="padding:16px;border:1px dashed #DC2626;color:#DC2626;font-family:monospace;font-size:13px;border-radius:8px;background:#FEE2E2;">Unknown widget: <strong>${widgetId}</strong></div>`;
        return;
      }

      while (host.firstChild) host.removeChild(host.firstChild);

      next.push({
        id: `${widgetId}-${index}`,
        widgetId,
        host,
        Component,
        config: decodeConfig(host.getAttribute("data-config")),
      });
    });

    // The portal host pattern legitimately needs to setState after a DOM scan
    // — there is no equivalent "external system" abstraction we can subscribe
    // to. See React docs on rendering into portals discovered in the DOM.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounts(next);
  }, []);

  const portals = useMemo(
    () =>
      mounts.map((m) => createPortal(<m.Component config={m.config} />, m.host, m.id)),
    [mounts],
  );

  return <>{portals}</>;
}
