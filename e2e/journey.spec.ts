import { expect, test, type Page } from "@playwright/test";

/**
 * The app's regression test: Allie's complete journey, intake through
 * celebration, with her numbers ($52K salary, $2,600/mo spend, $1,800 saved,
 * 6% match). Reveal amounts are asserted exactly — if the projection engine
 * or tax constants drift, this fails on the number that changed.
 */

/** Answer a chapter Quiz with the right answers and pass on the first Try (WHI-96). */
async function passQuiz(page: Page, answers: string[]): Promise<void> {
  for (const answer of answers) {
    await page.getByRole("radio", { name: answer, exact: true }).check();
  }
  // .first(): Chapter 7 also holds the (hidden) Final Exam's submit button.
  await page.locator("[data-quiz-submit]").first().click();
  await expect(page.getByText("Nailed it")).toBeVisible();
}

/** The Final Exam's 10 right answers for the journey profile (WHI-98). */
const EXAM_ANSWERS = [
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
];
test("full journey: intake → seven chapters → celebration → resume", async ({ page }) => {
  await page.goto("./");

  // — Chapter 1: intro + intake —
  await expect(page.getByRole("heading", { name: "Meet the Genie" })).toBeVisible();
  // First screen has nowhere to go back to, so no Back button (WHI-88).
  await expect(page.getByRole("button", { name: "Back", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Let's do it" }).click();

  for (const answer of ["52000", "2600", "1800", "6"]) {
    await page.locator(".chapter input").fill(answer);
    await page.getByRole("button", { name: "That's my number" }).click();
  }

  // Privacy promise, then the Chapter 1 quiz gates the wish (WHI-96).
  await expect(page.getByText("your numbers stay on this phone")).toBeVisible();
  await expect(page.getByRole("button", { name: "Show me my future" })).toBeHidden();
  await passQuiz(page, [
    "On this phone — and nowhere else",
    "Drive every projection in the chapters ahead",
    "Your monthly spending",
  ]);
  await page.getByRole("button", { name: "Show me my future" }).click();

  // — Chapter 2: The Curve —
  await expect(page.getByRole("heading", { name: "The Curve" })).toBeVisible();
  // Both 6%s are introduced before the chart uses them (WHI-89).
  await expect(page.getByText("Quick setup first")).toBeVisible();
  await expect(page.getByText("start now → $803K")).toBeVisible();
  await expect(page.getByText("$448K", { exact: true }).first()).toBeVisible();
  // The quiz completes the chapter: forward stays off until it's done.
  await expect(page.getByRole("button", { name: "Complete chapter" })).toBeDisabled();
  await passQuiz(page, [
    "Growth earning growth on top of itself",
    "$448K",
    "What the money buys in today's (2026) terms — inflation already handled",
  ]);
  await page.getByRole("button", { name: "Continue" }).click();

  // — Chapter 3: Free Money —
  await expect(page.getByRole("heading", { name: "Free Money" })).toBeVisible();
  await expect(page.getByText("$3,120-a-year raise")).toBeVisible();
  await expect(page.getByText("$401K", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "I'm in" }).click();
  await expect(page.getByRole("button", { name: /tap to take it back/ })).toBeVisible();
  await passQuiz(page, [
    "$3,120",
    "Declining a raise on purpose",
    "Doubles instantly — 100% return before any growth",
  ]);
  await page.getByRole("button", { name: "Continue" }).click();

  // — Chapter 4: Paycheck & the Bracket Myth —
  await expect(page.getByRole("heading", { name: "Your Paycheck & the Bracket Myth" })).toBeVisible();
  await expect(page.getByText("$43,962").first()).toBeVisible(); // take-home
  await expect(page.getByText("$229 a month")).toBeVisible(); // pre-tax trick
  // "Effective" is defined right at the readout (WHI-92).
  await expect(page.getByText("averaged across all your buckets")).toBeVisible();
  await passQuiz(page, [
    "Rises — only dollars inside the top bucket pay the higher rate",
    "Lower — it's the average across all your buckets",
    "$229",
  ]);
  await page.getByRole("button", { name: "Continue" }).click();

  // — Chapter 5: Roth vs Traditional —
  await expect(page.getByRole("heading", { name: "Roth vs Traditional" })).toBeVisible();
  await page.getByRole("button", { name: /does my plan have Roth/ }).click();
  await passQuiz(page, [
    "When the tax collector says hello",
    "Roth — today's tax rate is likely the lowest you'll ever pay",
    "Pre-tax either way — this choice should never delay enrolling",
  ]);
  await page.getByRole("button", { name: "Continue" }).click();

  // — Chapter 6: Where Money Lives —
  await expect(page.getByRole("heading", { name: "Where Money Lives" })).toBeVisible();
  await expect(page.getByText("$7,800 – $15,600").first()).toBeVisible(); // 3–6× monthly spend
  // The 401k menu spectrum and the volatility expectation (WHI-90).
  await expect(page.locator("[data-spectrum] .spectrum__item")).toHaveCount(3);
  await expect(page.getByText("grows the most, swings the most")).toBeVisible();
  await expect(page.getByText("it's the price of the magic")).toBeVisible();
  await passQuiz(page, [
    "$7,800 – $15,600",
    "Inflation eats it — it melts in real purchasing power",
    "Nothing — the drop is expected, and selling on the way down is the only losing move",
  ]);
  await page.getByRole("button", { name: "Continue" }).click();

  // — Chapter 7: Lever Room & Action Checklist —
  await expect(page.getByRole("heading", { name: "Lever Room" })).toBeVisible();
  await expect(page.getByText("yours at 65, in today's dollars")).toBeVisible();
  // Why this number beats Chapter 2's — head start + raises (WHI-93).
  await expect(page.getByText("Bigger than Chapter 2's curve?")).toBeVisible();
  await expect(page.getByText("$2K head start")).toBeVisible(); // formatMoney(1800)
  // The story ends inside the chapter — no forward button remains.
  await expect(page.locator('[data-nav="forward"]')).toHaveCount(0);

  const boxes = page.locator('.chapter input[type="checkbox"]');
  await expect(boxes).toHaveCount(5);
  for (let i = 0; i < 5; i++) await boxes.nth(i).check();

  // Roth check from Chapter 5 carried into the checklist.
  await expect(page.getByText("you flagged this in Chapter 5")).toBeVisible();

  // Vesting is explained where it first appears — no cold jargon (WHI-86).
  await expect(page.getByText("Vesting is just how long you stay")).toBeVisible();

  // The Chapter 7 quiz unlocks the Final Exam (WHI-97, WHI-98).
  const exam = page.locator("[data-exam]");
  await expect(exam).toBeHidden();
  await passQuiz(page, [
    "Your contribution percent",
    "$520",
    "Log in to your 401k provider",
  ]);
  await expect(exam).toBeVisible();

  // The exam sits after the Lever Room and before the Action Checklist.
  expect(
    await page.evaluate(() => {
      const examEl = document.querySelector("[data-exam]")!;
      const checklist = document.getElementById("sec-checklist")!;
      return Boolean(examEl.compareDocumentPosition(checklist) & Node.DOCUMENT_POSITION_FOLLOWING);
    }),
  ).toBe(true);

  // — Final Exam: 10 questions spanning the whole journey (WHI-98) —
  await expect(exam.getByRole("heading", { name: "The Final Exam" })).toBeVisible();
  for (const answer of EXAM_ANSWERS) {
    await exam.getByRole("radio", { name: answer, exact: true }).check();
  }
  await exam.locator("[data-quiz-submit]").click();
  await expect(exam.locator("[data-exam-score]")).toContainText("10 out of 10");

  // Done-by date is the finale trigger: letter from 65-year-old Allie.
  const letter = page.getByText("— Allie, 2059");
  await expect(letter).toBeHidden();
  await page.locator('.chapter input[type="date"]').fill("2026-09-01");
  await expect(letter).toBeVisible();

  // The letter carries the exam score (WHI-98).
  await expect(page.getByText(/10 out of 10 on the exam/)).toBeVisible();

  // — Resume: reopening the app lands on Chapter 7 with everything kept —
  await page.reload();
  await expect(page.getByRole("heading", { name: "Lever Room" })).toBeVisible();
  await expect(page.locator('.chapter input[type="checkbox"]:checked')).toHaveCount(5);
  await expect(page.getByText("— Allie, 2059")).toBeVisible();

  // Back-navigation shows Chapter 1 as an editable profile, not re-intake.
  for (let i = 0; i < 6; i++) await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your numbers" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Update my future" })).toBeVisible();
});
