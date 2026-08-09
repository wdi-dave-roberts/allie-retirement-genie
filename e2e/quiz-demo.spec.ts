import { expect, test } from "@playwright/test";

/**
 * Quiz engine (WHI-95), driven through the ?quiz-demo route at 390px:
 * Tries, colored marks, lock/edit rules, Answer Key, Section Link,
 * persistence across reload.
 */

const WRONG = ["One — no pressure", "It locks forever", "Opens a new tab"];
const RIGHT = ["Three", "It stays editable", "Jumps back to the part that taught it"];

test("three wrong tries: marks, editable wrongs, locked rights, Answer Key", async ({ page }) => {
  await page.goto("./?quiz-demo");
  await expect(page.getByRole("heading", { name: "The Lamp Rules" })).toBeVisible();

  // Submit is off until every question has an answer.
  const submit = page.locator("[data-quiz-submit]");
  await expect(submit).toBeDisabled();
  for (const label of WRONG) await page.getByRole("radio", { name: label }).check();
  await expect(submit).toBeEnabled();

  // Try 1 — everything wrong: three ✕ marks, everything stays editable.
  await submit.click();
  await expect(page.getByText("✕ not yet")).toHaveCount(3);
  await expect(page.getByText("Try 2 of 3")).toBeVisible();
  for (const label of WRONG) await expect(page.getByRole("radio", { name: label })).toBeEnabled();

  // Try 2 — fix only Q1: it locks green, the others stay red and editable.
  await page.getByRole("radio", { name: RIGHT[0]! }).check();
  await page.locator("[data-quiz-submit]").click();
  await expect(page.getByText("✓ right")).toHaveCount(1);
  await expect(page.getByText("✕ not yet")).toHaveCount(2);
  for (const radio of await page.locator('fieldset[data-q="0"] input').all()) {
    await expect(radio).toBeDisabled();
  }
  await expect(page.getByRole("radio", { name: WRONG[1]! })).toBeEnabled();

  // Try 3 — still wrong: the Answer Key appears and the quiz closes down.
  await page.locator("[data-quiz-submit]").click();
  await expect(page.getByRole("heading", { name: "Answer Key" })).toBeVisible();
  await expect(page.getByText("took me centuries")).toBeVisible();
  await expect(page.locator("[data-quiz-submit]")).toHaveCount(0);
  for (const radio of await page.locator(".quiz input").all()) {
    await expect(radio).toBeDisabled();
  }

  // Section Link jumps back to the teaching section.
  await page.locator('[data-section-link="0"]').click();
  await expect(page.locator("#demo-lamp-rules")).toBeInViewport();

  // Done state survives a reload (localStorage round-trip).
  await page.reload();
  await expect(page.getByRole("heading", { name: "Answer Key" })).toBeVisible();
});

test("clean pass on the first Try: green across, Answer Key with explanations", async ({ page }) => {
  await page.goto("./?quiz-demo");
  for (const label of RIGHT) await page.getByRole("radio", { name: label }).check();
  await page.locator("[data-quiz-submit]").click();

  await expect(page.getByText("Nailed it")).toBeVisible();
  await expect(page.getByText("✓ right")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "Answer Key" })).toBeVisible();
  await expect(page.getByText("zero judgment")).toBeVisible(); // Genie explanation line
  await expect(page.getByText("took me centuries")).toHaveCount(0); // no consolation on a pass
});
