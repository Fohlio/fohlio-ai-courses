import { expect, test } from "@playwright/test";

/**
 * Lesson-body widgets are mounted into `.lesson-content` by
 * `LessonWidgets.tsx` via React portals over `<div data-widget="...">`
 * placeholders that live in the lesson HTML. We check that at least one
 * such widget renders and is interactive on a representative lesson.
 */
test("lesson body renders an interactive widget", async ({ page }) => {
  // Pick a NestJS lesson — it has 12 lessons of dense content with at least
  // 2 widget insertions each per the rebuild.
  await page.goto(
    "/courses/nestjs/lessons/intro",
  );

  // Wait for the lesson body to be present.
  await expect(page.locator(".lesson-content")).toBeVisible();

  // The widget host has data-widget; once the runtime mounts the portal it
  // replaces inner content. Either way the placeholder exists.
  const widgetHost = page.locator(".lesson-content [data-widget]").first();
  await expect(widgetHost).toBeAttached();

  // After portal mount, the host has at least one child element (the widget
  // UI). It should NOT show the "Unknown widget" error.
  await expect(widgetHost).not.toContainText(/Unknown widget/i);

  // For at least one widget, a button or input should be present —
  // proves it's actually interactive (ICAP) rather than passive markup.
  const interactive = page.locator(
    ".lesson-content [data-widget] button, .lesson-content [data-widget] textarea, .lesson-content [data-widget] input",
  );
  await expect(interactive.first()).toBeVisible({ timeout: 5000 });
});
