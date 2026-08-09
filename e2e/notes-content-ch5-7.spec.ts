import { expect, test } from "@playwright/test";

/**
 * Genie Note content in Chapters 5-7 (WHI-101): the Ch6 target-date note
 * opens with a safe Deeper Dive; Ch7's contribution-limit note carries the
 * IRS figure. (Separate file from the Ch1-4 spec to keep waves independent.)
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

test("Ch6: tapping target-date fund opens the note with a new-tab Deeper Dive", async ({ page }) => {
  await openChapter(page, 5);
  await expect(page.getByRole("heading", { name: "Where Money Lives" })).toBeVisible();

  await page.locator('[data-genie-note="ch6-target-date-fund"]').tap();
  const popup = page.locator(".genie-note-popup");
  await expect(popup).toBeVisible();
  await expect(popup).toContainText("2059");
  await expect(popup).toContainText("rebalances on its own");

  const dive = popup.locator(".genie-note-popup__dive");
  await expect(dive).toHaveAttribute("target", "_blank");
  await expect(dive).toHaveAttribute("rel", /noopener/);
});

test("Ch7: the contribution-limit note carries the 2026 IRS cap", async ({ page }) => {
  await openChapter(page, 6);
  await expect(page.getByRole("heading", { name: "Lever Room" })).toBeVisible();

  await page.locator('[data-genie-note="ch7-contribution-limit"]').tap();
  const popup = page.locator(".genie-note-popup");
  await expect(popup).toContainText("$24,500");
  await expect(popup.locator(".genie-note-popup__dive")).toHaveAttribute("href", /irs\.gov/);
});
