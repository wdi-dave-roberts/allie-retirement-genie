import { expect, test } from "@playwright/test";

/**
 * The finale is earned: done-by date AND the enroll box (WHI-87).
 * Either order works; neither alone does.
 */
const PROFILE = { salary: 52000, monthlySpend: 2600, currentSavings: 1800, matchPercent: 6 };

/** The exam's right answers by index, matching src/quiz/exam.ts (WHI-98). */
const EXAM_CORRECT = [0, 0, 1, 2, 0, 2, 0, 1, 2, 1];

async function openChapter7(
  page: import("@playwright/test").Page,
  opts: { quizDone?: boolean; examDone?: boolean } = {},
): Promise<void> {
  await page.goto("./");
  await page.evaluate(
    ({ profile, quizDone, examDone, examCorrect }) => {
      localStorage.setItem("genie.profile.v1", JSON.stringify(profile));
      localStorage.setItem("genie.progress.v1", "6");
      if (quizDone) {
        // Chapter 7 quiz passed (WHI-97) — these tests are about date + box.
        localStorage.setItem(
          "genie.quiz.ch7.v1",
          JSON.stringify({ answers: [0, 1, 1], submitted: [0, 1, 1], tries: 1 }),
        );
      }
      if (examDone) {
        // Final Exam passed (WHI-98) — same reason.
        localStorage.setItem(
          "genie.quiz.final.v1",
          JSON.stringify({ answers: examCorrect, submitted: examCorrect, tries: 1 }),
        );
      }
    },
    {
      profile: PROFILE,
      quizDone: opts.quizDone ?? true,
      examDone: opts.examDone ?? true,
      examCorrect: EXAM_CORRECT,
    },
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

test("quiz then exam: date + box wait for both (WHI-97, WHI-98)", async ({ page }) => {
  await openChapter7(page, { quizDone: false, examDone: false });
  const letter = page.getByText("— Allie, 2059");
  const exam = page.locator("[data-exam]");

  await page.locator('input[type="date"]').fill("2026-09-01");
  await page.locator('[data-check="enroll"]').check();
  await expect(letter).toBeHidden(); // date + box alone no longer cast the spell
  await expect(page.locator("[data-nudge]")).toBeVisible();
  await expect(exam).toBeHidden(); // the exam waits for the Chapter 7 quiz

  for (const answer of [
    "Your contribution percent",
    "$520",
    "Log in to your 401k provider",
  ]) {
    await page.getByRole("radio", { name: answer, exact: true }).check();
  }
  await page.locator("[data-quiz-submit]").first().click();
  await expect(page.getByText("Nailed it")).toBeVisible();

  // Quiz done, exam not: still no finale.
  await expect(exam).toBeVisible();
  await expect(letter).toBeHidden();

  for (const answer of [
    "On this phone — and nowhere else",
    "Growth earning growth on top of itself",
    "A raise you're declining on purpose",
    "Never true — only the top-bucket dollars pay the new rate",
    "When the tax collector says hello",
    "Nothing — it's expected, and selling on the way down is the only losing move",
    "You fully control: your contribution percent",
    "$3,120",
    "$448K",
    "$229",
  ]) {
    await exam.getByRole("radio", { name: answer, exact: true }).check();
  }
  await exam.locator("[data-quiz-submit]").click();
  await expect(exam.locator("[data-exam-score]")).toContainText("10 out of 10");
  await expect(letter).toBeVisible();
});
