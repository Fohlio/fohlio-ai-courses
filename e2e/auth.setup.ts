import { expect, test as setup } from "@playwright/test";

const authFile = "e2e/.auth/student.json";
const nickname = process.env.E2E_GITHUB_NICKNAME ?? "e2e-student";
const password = process.env.E2E_PASSWORD ?? "e2e-student-123";
const displayName = "E2E Student";
const courseSlug = "e2e-course";

setup("authenticate seeded e2e student", async ({ request }) => {
  const registerResponse = await request.post("/api/auth/register", {
    data: {
      githubNickname: nickname,
      password,
      displayName,
    },
  });

  expect(
    registerResponse.ok() || registerResponse.status() === 409,
    `Unexpected register status: ${registerResponse.status()}`,
  ).toBeTruthy();

  const loginResponse = await request.post("/api/auth/login", {
    data: {
      githubNickname: nickname,
      password,
    },
  });

  expect(loginResponse.ok(), "E2E login failed").toBeTruthy();

  const mineResponse = await request.get("/api/courses?scope=mine");
  expect(mineResponse.ok(), "Could not load e2e user courses").toBeTruthy();

  const minePayload = (await mineResponse.json()) as {
    data: Array<{ id: string; slug: string }>;
  };
  const existingCourse = minePayload.data.find((course) => course.slug === courseSlug);

  if (!existingCourse) {
    const createCourseResponse = await request.post("/api/courses", {
      data: {
        title: "E2E Course",
        subtitle: "Playwright draft",
        description:
          "Stable draft course used for Playwright end-to-end tests.",
      },
    });

    expect(createCourseResponse.ok(), "Could not create stable e2e course").toBeTruthy();
  }

  await request.storageState({ path: authFile });
});
