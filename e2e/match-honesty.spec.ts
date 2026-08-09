import { expect, test } from "@playwright/test";

/** Chapter 3 honesty branches (WHI-91): hedge with a match, pivot without one. */

async function openChapter3(page: import("@playwright/test").Page, matchPercent: number): Promise<void> {
  await page.goto("./");
  await page.evaluate((mp) => {
    localStorage.setItem(
      "genie.profile.v1",
      JSON.stringify({ salary: 52000, monthlySpend: 2600, currentSavings: 1800, matchPercent: mp }),
    );
    localStorage.setItem("genie.progress.v1", "2");
  }, matchPercent);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Free Money" })).toBeVisible();
}

test("match > 0: hedge clause present, numbers unchanged", async ({ page }) => {
  await openChapter3(page, 6);
  await expect(page.getByText("If your plan matches dollar-for-dollar — most do")).toBeVisible();
  await expect(page.getByText("$3,120-a-year raise")).toBeVisible();
  await expect(page.getByText("$401K", { exact: true })).toBeVisible();
  await expect(page.getByText("doubles the moment it arrives")).toBeVisible();
});

test("match = 0: no fake raise, honest pivot, chapter still completes", async ({ page }) => {
  await openChapter3(page, 0);
  await expect(page.getByText("no employer match")).toBeVisible();
  await expect(page.getByText("no match required")).toBeVisible();
  await expect(page.getByText("-a-year raise")).toHaveCount(0);
  await expect(page.getByText("doubles the moment it arrives")).toHaveCount(0);

  // "I'm in" still available and sticky.
  await page.getByRole("button", { name: "I'm in" }).click();
  await expect(page.getByRole("button", { name: /tap to take it back/ })).toBeVisible();

  // No-match plans get concept questions — no invented dollar figures (WHI-96).
  for (const answer of [
    "Money goes in before federal tax and compounds untouched for decades",
    "Free money added when you contribute",
    "Zero — unenrolled means unmatched",
  ]) {
    await page.getByRole("radio", { name: answer }).check();
  }
  await page.locator("[data-quiz-submit]").click();
  await expect(page.getByText("Nailed it")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Your Paycheck & the Bracket Myth" })).toBeVisible();
});
