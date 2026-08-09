import { expect, test } from "@playwright/test";

/**
 * Genie Note engine (WHI-99), driven through ?note-demo at 390px: tap to
 * open, one at a time, tap-outside to close, safe Deeper Dive link, and no
 * horizontal scroll with the sheet open.
 */

test("notes: tap opens, second note replaces first, tap-outside closes", async ({ page }) => {
  await page.goto("./?note-demo");
  const popup = page.locator(".genie-note-popup");
  const prose = page.locator('[data-genie-note="demo-compounding"]');
  const caption = page.locator('[data-genie-note="demo-real-dollars"]');

  // Works in chapter prose…
  await prose.tap();
  await expect(popup).toBeVisible();
  await expect(popup).toContainText("compound growth");
  await expect(prose).toHaveAttribute("aria-expanded", "true");

  // …and in a chart caption; opening it closes the first (one at a time).
  await caption.tap();
  await expect(popup).toContainText("Real Dollars");
  await expect(prose).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".genie-note-popup")).toHaveCount(1);

  // The sheet never widens the page.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);

  // Tap-outside dismisses.
  await page.getByRole("heading", { name: "Genie Notes" }).tap();
  await expect(popup).toBeHidden();
});

test("deeper dive: new tab, noopener; notes without one show no footer", async ({ page }) => {
  await page.goto("./?note-demo");

  await page.locator('[data-genie-note="demo-compounding"]').tap();
  const dive = page.locator(".genie-note-popup__dive");
  await expect(dive).toHaveAttribute("target", "_blank");
  await expect(dive).toHaveAttribute("rel", /noopener/);

  await page.locator('[data-genie-note="demo-real-dollars"]').tap();
  await expect(page.locator(".genie-note-popup__dive")).toHaveCount(0);

  // Close control works too.
  await page.locator("[data-note-close]").tap();
  await expect(page.locator(".genie-note-popup")).toBeHidden();
});

test("triggers carry the accent affordance color, not the prose color (WHI-105)", async ({ page }) => {
  await page.goto("./?note-demo");
  const trigger = page.locator('[data-genie-note="demo-compounding"]');
  // --note-accent → --lamp-gold-soft (#f8d189)
  await expect(trigger).toHaveCSS("color", "rgb(248, 209, 137)");
  const proseColor = await page
    .locator(".speech p")
    .evaluate((el) => getComputedStyle(el).color);
  expect(proseColor).not.toBe("rgb(248, 209, 137)");
});
