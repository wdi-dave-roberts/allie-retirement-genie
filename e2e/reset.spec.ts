import { expect, test } from "@playwright/test";

/** Reset: the quiet Start-over link wipes everything back to first open. */
test("reset: cancel keeps state, confirm returns to first open", async ({ page }) => {
  await page.goto("./");

  // Quick intake so there is state worth losing.
  await page.getByRole("button", { name: "Let's do it" }).click();
  for (const answer of ["52000", "2600", "1800", "6"]) {
    await page.locator(".chapter input").fill(answer);
    await page.getByRole("button", { name: "That's my number" }).click();
  }
  // The Chapter 1 quiz gates the wish (WHI-96).
  for (const answer of [
    "On this phone — and nowhere else",
    "Drive every projection in the chapters ahead",
    "Your monthly spending",
  ]) {
    await page.getByRole("radio", { name: answer }).check();
  }
  await page.locator("[data-quiz-submit]").click();
  await page.getByRole("button", { name: "Show me my future" }).click();
  await expect(page.getByRole("heading", { name: "The Curve" })).toBeVisible();

  // The link is on every chapter, quiet but findable.
  const startOver = page.getByRole("button", { name: "Start over" });
  await expect(startOver).toBeVisible();

  // Cancel: nothing changes.
  await startOver.click();
  const dialog = page.locator("dialog[data-reset-dialog]");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Rub the lamp again?")).toBeVisible();
  await dialog.getByRole("button", { name: "Keep my future" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: "The Curve" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.length)).toBeGreaterThan(0);

  // Confirm: full wipe, back to Chapter 1 intake, chapters locked again.
  await startOver.click();
  await dialog.getByRole("button", { name: "Start over" }).click();
  await expect(page.getByRole("heading", { name: "Meet the Genie" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Let's do it" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(await page.evaluate(() => document.querySelector(".progress")?.getAttribute("aria-valuenow"))).toBe("0");
});
