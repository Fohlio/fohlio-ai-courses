import { expect, test } from "@playwright/test";

const NICKNAME = process.env.E2E_GITHUB_NICKNAME ?? "e2e-student";
const PASSWORD = process.env.E2E_PASSWORD ?? "e2e-student-123";

// These tests need a logged-OUT browser to verify the unauth → login flow.
// They override the storageState from playwright.config to a fresh, empty
// state so the auth setup doesn't leak in.
test.use({ storageState: { cookies: [], origins: [] } });

test("unauth user is redirected from /series to /login with redirect param", async ({
  page,
}) => {
  await page.goto("/series");

  // Middleware should have bounced us to /login?redirect=/series instead of
  // letting the page render a blank.
  await expect(page).toHaveURL(/\/login\?redirect=%2Fseries/);
  await expect(page.getByTestId("login-heading")).toBeVisible();
});

test("unauth user is redirected from / (root) to login", async ({ page }) => {
  await page.goto("/");

  // / does a server-side redirect to /series, which is now protected, so the
  // final URL is /login with /series as the preserved redirect target.
  await expect(page).toHaveURL(/\/login\?redirect=/);
  await expect(page.getByTestId("login-heading")).toBeVisible();
});

test("login from /login?redirect=/series lands on /series", async ({
  page,
}) => {
  await page.goto("/login?redirect=%2Fseries");
  await expect(page.getByTestId("login-heading")).toBeVisible();

  await page.getByTestId("login-nickname-input").fill(NICKNAME);
  await page.getByTestId("login-password-input").fill(PASSWORD);
  await page.getByTestId("login-submit-button").click();

  // Hard navigation after login — wait for /series to render.
  await page.waitForURL(/\/series$/);
  await expect(page.getByRole("heading", { name: "Tracks" })).toBeVisible();
});

test("login without redirect param defaults to /courses", async ({ page }) => {
  await page.goto("/login");
  await page.getByTestId("login-nickname-input").fill(NICKNAME);
  await page.getByTestId("login-password-input").fill(PASSWORD);
  await page.getByTestId("login-submit-button").click();

  await page.waitForURL(/\/courses$/);
});

test("safe-redirect rejects external URLs in ?redirect=", async ({ page }) => {
  await page.goto("/login?redirect=https%3A%2F%2Fevil.example.com");
  await page.getByTestId("login-nickname-input").fill(NICKNAME);
  await page.getByTestId("login-password-input").fill(PASSWORD);
  await page.getByTestId("login-submit-button").click();

  // Should fall back to /courses, not navigate off-site.
  await page.waitForURL(/\/courses$/);
});

test("safe-redirect rejects /login loop", async ({ page }) => {
  await page.goto("/login?redirect=%2Flogin");
  await page.getByTestId("login-nickname-input").fill(NICKNAME);
  await page.getByTestId("login-password-input").fill(PASSWORD);
  await page.getByTestId("login-submit-button").click();

  await page.waitForURL(/\/courses$/);
});
