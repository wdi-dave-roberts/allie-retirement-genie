import { expect, test } from "@playwright/test";

/**
 * First-ever quiz pass: the folded Answer Key announces itself once — gold
 * shimmer on the summary plus a one-line aside — then never again (human UAT:
 * the "Review answers" link went unnoticed for four chapters).
 */

const RIGHT = ["Three", "It stays editable", "Jumps back to the part that taught it"];

async function passQuiz(page: import("@playwright/test").Page): Promise<void> {
  for (const label of RIGHT) await page.getByRole("radio", { name: label }).check();
  await page.locator("[data-quiz-submit]").click();
  await expect(page.getByText("Nailed it")).toBeVisible();
}

test("first pass ever shimmers and points at the key; later passes stay quiet", async ({
  page,
}) => {
  await page.goto("./?quiz-demo");

  // First pass: aside + fresh class present, flag written.
  await passQuiz(page);
  await expect(page.locator("[data-key-aside]")).toBeVisible();
  await expect(page.locator(".quiz__key-disclosure--fresh")).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem("genie.quiz.seen-key.v1"))).toBe("1");

  // Same quiz redone after a state wipe of the demo quiz only: flag survives,
  // so the reveal never replays.
  await page.evaluate(() => localStorage.removeItem("genie.quiz.demo.v1"));
  await page.reload();
  await passQuiz(page);
  await expect(page.locator("[data-key-aside]")).toHaveCount(0);
  await expect(page.locator(".quiz__key-disclosure--fresh")).toHaveCount(0);
  await expect(page.locator("[data-key-disclosure]")).toHaveCount(1); // key still folded there

  // Full reset wipes the flag with the rest of genie.quiz.* — reveal returns.
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await passQuiz(page);
  await expect(page.locator("[data-key-aside]")).toBeVisible();
});
