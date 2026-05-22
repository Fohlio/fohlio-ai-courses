import { expect, test } from "@playwright/test";

test("student can open homework from progress page", async ({ page }) => {
  await page.goto("/progress");

  await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();

  // Open the first lesson of the AI/GTM track (the legacy course Lesson 1).
  await page
    .getByRole("link", { name: /Lesson 1: Introduction to Collaborative Development/i })
    .click();

  await expect(page).toHaveURL(
    /\/courses\/fohlio-tech-course\/lessons\/git-intro\/homework$/,
  );

  // Lesson 1 was rebuilt onto widget homework: 2 required widget tasks + 1
  // advanced screenshot. We don't lock to a specific widget id here — we just
  // assert the page renders with both Required and Advanced sections present.
  await expect(
    page.getByRole("heading", { name: /Required \(for everyone\)/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Advanced \(optional\)/i }),
  ).toBeVisible();
});

test("widget homework task renders and exposes a Submit button", async ({
  page,
}) => {
  await page.goto("/courses/fohlio-tech-course/lessons/git-intro/homework");

  // Find the first card that is a widget task — it shows the "Interactive"
  // badge in the corner. Generic selector so this test stays content-agnostic.
  const widgetCard = page
    .getByTestId("card")
    .filter({ hasText: /Interactive/i })
    .first();
  await expect(widgetCard).toBeVisible();

  // Either an editable Submit button (first time) or an Edit toggle
  // (already submitted in a previous run). Both are valid end states.
  const submit = widgetCard.getByRole("button", { name: /Submit/i });
  const edit = widgetCard.getByRole("button", { name: /^Edit$/ });
  const hasSubmit = (await submit.count()) > 0;
  const hasEdit = (await edit.count()) > 0;
  expect(hasSubmit || hasEdit).toBeTruthy();
});
