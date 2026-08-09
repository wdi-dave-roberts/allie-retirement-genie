import { expect, test } from "@playwright/test";

/**
 * Chapter quiz content (WHI-96): personalized figures come from the
 * projection/tax libs, the quiz gates the chapter, and Section Links land
 * on the teaching beat and return without losing quiz state.
 */

const PROFILE = { salary: 52000, monthlySpend: 2600, currentSavings: 1800, matchPercent: 6 };

test("ch2 quiz: her cost-of-waiting figure is a choice, passing unlocks the chapter", async ({ page }) => {
  await page.goto("./");
  await page.evaluate((profile) => {
    localStorage.setItem("genie.profile.v1", JSON.stringify(profile));
    localStorage.setItem("genie.progress.v1", "1");
  }, PROFILE);
  await page.reload();
  await expect(page.getByRole("heading", { name: "The Curve" })).toBeVisible();

  // Personalized from her Profile: $803K − $355K, straight from the projection lib.
  await expect(page.getByRole("radio", { name: "$448K", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Complete chapter" })).toBeDisabled();

  // Wrong answer on the money question first: red mark, still editable.
  await page.getByRole("radio", { name: "Growth earning growth on top of itself" }).check();
  await page.getByRole("radio", { name: "$803K", exact: true }).check();
  await page
    .getByRole("radio", { name: "What the money buys in today's (2026) terms — inflation already handled" })
    .check();
  await page.locator("[data-quiz-submit]").click();
  await expect(page.getByText("✕ not yet")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Complete chapter" })).toBeDisabled();

  // Fix it, pass, and the chapter opens.
  await page.getByRole("radio", { name: "$448K", exact: true }).check();
  await page.locator("[data-quiz-submit]").click();
  await expect(page.getByText("Nailed it")).toBeVisible();
  await expect(page.getByRole("button", { name: "Complete chapter" })).toBeEnabled();
  await page.getByRole("button", { name: "Complete chapter" }).click();
  await expect(page.getByRole("heading", { name: "Free Money" })).toBeVisible();
});

test("ch6 quiz: her emergency-fund range appears as a choice", async ({ page }) => {
  await page.goto("./");
  await page.evaluate((profile) => {
    localStorage.setItem("genie.profile.v1", JSON.stringify(profile));
    localStorage.setItem("genie.progress.v1", "5");
  }, PROFILE);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Where Money Lives" })).toBeVisible();

  // 3-6× her $2,600 monthly spend, exactly as the chapter prints it.
  await expect(page.getByRole("radio", { name: "$7,800 – $15,600", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Complete chapter" })).toBeDisabled();
});

test("section link: jumps to the teaching beat and returns with quiz state intact", async ({ page }) => {
  await page.goto("./");
  await page.evaluate((profile) => {
    localStorage.setItem("genie.profile.v1", JSON.stringify(profile));
    localStorage.setItem("genie.progress.v1", "1");
    // Quiz already done (3 tries, all wrong) so the Answer Key and its links show.
    localStorage.setItem(
      "genie.quiz.ch2.v1",
      JSON.stringify({ answers: [0, 0, 1], submitted: [0, 0, 1], tries: 3 }),
    );
  }, PROFILE);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Answer Key" })).toBeVisible();

  // Section Link for the compounding question → the "growth earns growth" beat.
  await page.locator('[data-section-link="0"]').click();
  await expect(page.locator("#sec-growth")).toBeInViewport();

  // The floating return lands back at the quiz, Answer Key still open.
  await page.getByRole("button", { name: "Back to the quiz" }).click();
  await expect(page.getByRole("heading", { name: "Answer Key" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Curve" })).toBeVisible();
});
