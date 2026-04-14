import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("user can sign in from the login page", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: "Sign In" }),
  ).toBeVisible();

  await page.getByLabel("GitHub Nickname").fill(
    process.env.E2E_GITHUB_NICKNAME ?? "e2e-student",
  );
  await page.getByLabel("Password").fill(
    process.env.E2E_PASSWORD ?? "e2e-student-123",
  );
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/courses$/);
  await expect(
    page.getByRole("heading", { name: "Course Catalog" }),
  ).toBeVisible();
});
