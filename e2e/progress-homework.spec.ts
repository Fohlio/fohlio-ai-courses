import { expect, test } from "@playwright/test";

test("student can open homework from progress and submit a text answer", async ({
  page,
}) => {
  await page.goto("/progress");

  await expect(
    page.getByRole("heading", { name: "Progress" }),
  ).toBeVisible();

  await page
    .getByRole("link", { name: /Lesson 4: Understanding AI: LLMs, Agents & Tools/i })
    .click();

  await expect(page).toHaveURL(
    /\/courses\/fohlio-tech-course\/lessons\/ai-fundamentals\/homework$/,
  );

  const taskCard = page.getByTestId("card").filter({
    hasText: "Explain chatbot vs agent",
  });

  const editButton = taskCard.getByRole("button", { name: "Edit" });
  if (await editButton.isVisible()) {
    await editButton.click();
  }

  await taskCard.getByTestId("submission-text-input").fill(
    `Playwright update ${Date.now()}: an agent can choose tools and act, while a chatbot mainly responds in-place.`,
  );
  await taskCard.getByRole("button", { name: "Submit" }).click();

  await expect(taskCard.getByRole("button", { name: "Edit" })).toBeVisible();
});
