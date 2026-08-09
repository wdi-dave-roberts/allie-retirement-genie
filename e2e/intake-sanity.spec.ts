import { expect, test } from "@playwright/test";

/** Gentle spend-vs-income nudge (WHI-94): informative, never blocking. */

const NUDGE = "More goes out than comes in";

test("intake: spend above income shows the nudge but never blocks", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Let's do it" }).click();

  // Salary $40,000
  await page.locator(".chapter input").fill("40000");
  await page.getByRole("button", { name: "That's my number" }).click();

  // Spend $9,000/mo → $108K/yr > $40K salary
  await page.locator(".chapter input").fill("9000");
  await expect(page.getByText(NUDGE)).toBeVisible();

  // Non-blocking: she can keep the values and move on.
  await page.getByRole("button", { name: "That's my number" }).click();
  await expect(page.getByText("What have you saved so far, across everything?")).toBeVisible();
});

test("intake: sane numbers never see the nudge", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Let's do it" }).click();
  await page.locator(".chapter input").fill("85000");
  await page.getByRole("button", { name: "That's my number" }).click();
  await page.locator(".chapter input").fill("3800");
  await expect(page.getByText(NUDGE)).toBeHidden();
});

test("profile editor: nudge tracks the fields live", async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => {
    localStorage.setItem(
      "genie.profile.v1",
      JSON.stringify({ salary: 40000, monthlySpend: 9000, currentSavings: 0, matchPercent: 6 }),
    );
    localStorage.setItem("genie.progress.v1", "1");
  });
  await page.reload();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your numbers" })).toBeVisible();

  // Stored profile already trips it on load.
  await expect(page.getByText(NUDGE)).toBeVisible();

  // Correcting the spend hides it live; saving still works.
  await page.locator(".chapter input").nth(1).fill("2000");
  await expect(page.getByText(NUDGE)).toBeHidden();
  await page.getByRole("button", { name: "Update my future" }).click();
  await expect(page.getByText("Done. The future noticed.")).toBeVisible();
});
