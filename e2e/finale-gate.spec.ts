import { expect, test } from "@playwright/test";

/**
 * The finale is earned: done-by date AND the enroll box (WHI-87).
 * Either order works; neither alone does.
 */
const PROFILE = { salary: 52000, monthlySpend: 2600, currentSavings: 1800, matchPercent: 6 };

async function openChapter7(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("./");
  await page.evaluate((profile) => {
    localStorage.setItem("genie.profile.v1", JSON.stringify(profile));
    localStorage.setItem("genie.progress.v1", "6");
  }, PROFILE);
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
