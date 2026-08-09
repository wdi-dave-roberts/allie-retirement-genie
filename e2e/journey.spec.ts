import { expect, test } from "@playwright/test";

/**
 * The app's regression test: Allie's complete journey, intake through
 * celebration, with her numbers ($52K salary, $2,600/mo spend, $1,800 saved,
 * 6% match). Reveal amounts are asserted exactly — if the projection engine
 * or tax constants drift, this fails on the number that changed.
 */
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

  // Privacy promise, then the wish.
  await expect(page.getByText("your numbers stay on this phone")).toBeVisible();
  await page.getByRole("button", { name: "Show me my future" }).click();

  // — Chapter 2: The Curve —
  await expect(page.getByRole("heading", { name: "The Curve" })).toBeVisible();
  // Both 6%s are introduced before the chart uses them (WHI-89).
  await expect(page.getByText("Quick setup first")).toBeVisible();
  await expect(page.getByText("start now → $803K")).toBeVisible();
  await expect(page.getByText("$448K", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Complete chapter" }).click();

  // — Chapter 3: Free Money —
  await expect(page.getByRole("heading", { name: "Free Money" })).toBeVisible();
  await expect(page.getByText("$3,120-a-year raise")).toBeVisible();
  await expect(page.getByText("$401K", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "I'm in" }).click();
  await expect(page.getByRole("button", { name: /tap to take it back/ })).toBeVisible();
  await page.getByRole("button", { name: "Complete chapter" }).click();

  // — Chapter 4: Paycheck & the Bracket Myth —
  await expect(page.getByRole("heading", { name: "Your Paycheck & the Bracket Myth" })).toBeVisible();
  await expect(page.getByText("$43,962").first()).toBeVisible(); // take-home
  await expect(page.getByText("$229 a month")).toBeVisible(); // pre-tax trick
  await page.getByRole("button", { name: "Complete chapter" }).click();

  // — Chapter 5: Roth vs Traditional —
  await expect(page.getByRole("heading", { name: "Roth vs Traditional" })).toBeVisible();
  await page.getByRole("button", { name: /does my plan have Roth/ }).click();
  await page.getByRole("button", { name: "Complete chapter" }).click();

  // — Chapter 6: Where Money Lives —
  await expect(page.getByRole("heading", { name: "Where Money Lives" })).toBeVisible();
  await expect(page.getByText("$7,800 – $15,600")).toBeVisible(); // 3–6× monthly spend
  await page.getByRole("button", { name: "Complete chapter" }).click();

  // — Chapter 7: Lever Room & Action Checklist —
  await expect(page.getByRole("heading", { name: "Lever Room" })).toBeVisible();
  await expect(page.getByText("yours at 65, in today's dollars")).toBeVisible();
  // The story ends inside the chapter — no forward button remains.
  await expect(page.locator('[data-nav="forward"]')).toHaveCount(0);

  const boxes = page.locator('.chapter input[type="checkbox"]');
  await expect(boxes).toHaveCount(5);
  for (let i = 0; i < 5; i++) await boxes.nth(i).check();

  // Roth check from Chapter 5 carried into the checklist.
  await expect(page.getByText("you flagged this in Chapter 5")).toBeVisible();

  // Vesting is explained where it first appears — no cold jargon (WHI-86).
  await expect(page.getByText("Vesting is just how long you stay")).toBeVisible();

  // Done-by date is the finale trigger: letter from 65-year-old Allie.
  const letter = page.getByText("— Allie, 2059");
  await expect(letter).toBeHidden();
  await page.locator('.chapter input[type="date"]').fill("2026-09-01");
  await expect(letter).toBeVisible();

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
