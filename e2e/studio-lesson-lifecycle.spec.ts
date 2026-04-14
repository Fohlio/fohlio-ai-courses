import { expect, test } from "@playwright/test";

test("author can add and delete a lesson inside the course constructor", async ({
  page,
}) => {
  await page.goto("/studio");

  await expect(page.getByRole("heading", { name: "Studio" })).toBeVisible();

  await page.getByRole("link", { name: /E2E Course/i }).click();
  await expect(
    page.getByRole("heading", { name: "Course constructor" }),
  ).toBeVisible();

  const lessonLinks = page.locator('[data-testid^="course-lesson-link-"]');
  const initialCount = await lessonLinks.count();

  await page.getByRole("button", { name: "Add Lesson" }).click();
  await expect(lessonLinks).toHaveCount(initialCount + 1);

  const newLessonLink = lessonLinks.nth(initialCount);
  const newLessonTitle = (await newLessonLink.locator("h3").textContent()) ?? "Lesson";
  await newLessonLink.click();

  await expect(page.getByTestId("lesson-editor-mode-visual")).toBeVisible();
  await expect(page.getByTestId("lesson-editor-mode-code")).toBeVisible();
  await expect(page.getByTestId("lesson-editor-mode-preview")).toBeVisible();

  await page.getByLabel("Lesson title").fill(`${newLessonTitle} Updated`);
  await page.getByRole("button", { name: "Save Lesson" }).click();
  await expect(
    page.getByRole("heading", { name: `${newLessonTitle} Updated` }),
  ).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete Lesson" }).click();

  await expect(page).toHaveURL(/\/studio\/courses\//);
  await expect(lessonLinks).toHaveCount(initialCount);
});
