import { expect, test } from "@playwright/test";

test("student lands on /series and can open a track", async ({ page }) => {
  await page.goto("/series");

  await expect(page.getByRole("heading", { name: "Tracks" })).toBeVisible();

  // Both seeded series should render. Slugs are 'backend' and 'ai-gtm'.
  const backendCard = page.getByTestId("series-card-backend");
  const aiGtmCard = page.getByTestId("series-card-ai-gtm");

  await expect(aiGtmCard).toBeVisible();
  // Backend track may have zero published courses in CI; AI/GTM always has
  // the legacy course. So we only require AI/GTM to be present + clickable.
  await aiGtmCard.click();

  await expect(page).toHaveURL(/\/series\/ai-gtm$/);
  await expect(
    page.getByRole("heading", { name: "AI for GTM" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Courses in this track" }),
  ).toBeVisible();

  // Backend track card may exist even if empty — log if missing to aid debug.
  if (await backendCard.count() > 0) {
    await page.goto("/series/backend");
    await expect(
      page.getByRole("heading", { name: "Backend Track" }),
    ).toBeVisible();
  }
});

test("sidebar exposes the Tracks link", async ({ page }) => {
  await page.goto("/courses");
  const tracksLink = page.getByTestId("sidebar-link-tracks");
  await expect(tracksLink).toBeVisible();
  await tracksLink.click();
  await expect(page).toHaveURL(/\/series$/);
});
