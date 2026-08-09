import { expect, test } from "@playwright/test";

/**
 * Genie Note content in real chapters (WHI-100): the Ch4 FICA note opens
 * with the SS/Medicare split and a safe Deeper Dive; the Ch2 number note
 * has no dive and shows the recipe.
 */
const PROFILE = { salary: 52000, monthlySpend: 2600, currentSavings: 1800, matchPercent: 6 };

async function openChapter(page: import("@playwright/test").Page, chapter: number): Promise<void> {
  await page.goto("./");
  await page.evaluate(
    ({ profile, chapter }) => {
      localStorage.setItem("genie.profile.v1", JSON.stringify(profile));
      localStorage.setItem("genie.progress.v1", String(chapter));
    },
    { profile: PROFILE, chapter },
  );
  await page.reload();
}

test("Ch4: tapping FICA opens the SS/Medicare split with a new-tab Deeper Dive", async ({ page }) => {
  await openChapter(page, 3);
  await expect(page.getByRole("heading", { name: "Your Paycheck & the Bracket Myth" })).toBeVisible();

  await page.locator('[data-genie-note="ch4-fica"]').tap();
  const popup = page.locator(".genie-note-popup");
  await expect(popup).toBeVisible();
  await expect(popup).toContainText("6.2%");
  await expect(popup).toContainText("Medicare (1.45%)");

  const dive = popup.locator(".genie-note-popup__dive");
  await expect(dive).toHaveAttribute("target", "_blank");
  await expect(dive).toHaveAttribute("rel", /noopener/);
});

test("Ch2: the big number explains itself, no dive needed", async ({ page }) => {
  await openChapter(page, 1);
  await expect(page.getByRole("heading", { name: "The Curve" })).toBeVisible();
  await expect(page.getByText("start now → $803K")).toBeVisible(); // trigger keeps the legend text

  await page.locator('[data-genie-note="ch2-the-number"]').tap();
  const popup = page.locator(".genie-note-popup");
  await expect(popup).toContainText("Deposits and time");
  await expect(popup.locator(".genie-note-popup__dive")).toHaveCount(0);
});
