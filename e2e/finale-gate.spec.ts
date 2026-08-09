import { expect, test } from "@playwright/test";

/**
 * The finale is earned: done-by date AND the enroll box (WHI-87).
 * Either order works; neither alone does.
 */
const PROFILE = { salary: 52000, monthlySpend: 2600, currentSavings: 1800, matchPercent: 6 };

async function openChapter7(
  page: import("@playwright/test").Page,
  opts: { quizDone?: boolean } = { quizDone: true },
): Promise<void> {
  await page.goto("./");
  await page.evaluate(
    ({ profile, quizDone }) => {
      localStorage.setItem("genie.profile.v1", JSON.stringify(profile));
      localStorage.setItem("genie.progress.v1", "6");
      if (quizDone) {
        // Chapter 7 quiz passed (WHI-97) — these tests are about date + box.
        localStorage.setItem(
          "genie.quiz.ch7.v1",
          JSON.stringify({ answers: [0, 1, 1], submitted: [0, 1, 1], tries: 1 }),
        );
      }
    },
    { profile: PROFILE, quizDone: opts.quizDone ?? true },
  );
  await page.reload();
  await expect(page.getByRole("heading", { name: "Lever Room" })).toBeVisible();
}

test("date then box: finale waits for the enroll commitment", async ({ page }) => {
  await openChapter7(page);
  const letter = page.getByText("— Allie, 2059");
  const nudge = page.locator("[data-nudge]");

  await expect(nudge).toBeVisible();
  await page.locator('input[type="date"]').fill("2026-09-01");
  await expect(letter).toBeHidden(); // date alone is not enough
  await expect(nudge).toBeVisible();

  await page.locator('[data-check="enroll"]').check();
  await expect(letter).toBeVisible();
  await expect(nudge).toBeHidden();

  // Persists on reload; unchecking takes it back.
  await page.reload();
  await expect(page.getByText("— Allie, 2059")).toBeVisible();
  await page.locator('[data-check="enroll"]').uncheck();
  await expect(page.getByText("— Allie, 2059")).toBeHidden();
});

test("box then date: same finale, opposite order", async ({ page }) => {
  await openChapter7(page);
  const letter = page.getByText("— Allie, 2059");

  await page.locator('[data-check="enroll"]').check();
  await expect(letter).toBeHidden(); // box alone is not enough

  await page.locator('input[type="date"]').fill("2026-09-01");
  await expect(letter).toBeVisible();
});

test("quiz is the third condition: date + box wait for it (WHI-97)", async ({ page }) => {
  await openChapter7(page, { quizDone: false });
  const letter = page.getByText("— Allie, 2059");

  await page.locator('input[type="date"]').fill("2026-09-01");
  await page.locator('[data-check="enroll"]').check();
  await expect(letter).toBeHidden(); // date + box alone no longer cast the spell
  await expect(page.locator("[data-nudge]")).toBeVisible();

  for (const answer of [
    "Your contribution percent",
    "$520",
    "Log in to your 401k provider",
  ]) {
    await page.getByRole("radio", { name: answer, exact: true }).check();
  }
  await page.locator("[data-quiz-submit]").click();
  await expect(page.getByText("Nailed it")).toBeVisible();
  await expect(letter).toBeVisible();
});
