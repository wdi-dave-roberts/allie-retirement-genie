import { expect, test } from "@playwright/test";

/** Chapter 3 match-forfeit slider (WHI-109): the gradient between partial and full capture. */

async function openChapter3(
  page: import("@playwright/test").Page,
  matchPercent: number,
): Promise<void> {
  await page.goto("./");
  await page.evaluate((mp) => {
    localStorage.setItem(
      "genie.profile.v1",
      JSON.stringify({ salary: 60000, monthlySpend: 2600, currentSavings: 1800, matchPercent: mp }),
    );
    localStorage.setItem("genie.progress.v1", "2");
  }, matchPercent);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Free Money" })).toBeVisible();
}

test("slider starts below full match and drives both figures live", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await openChapter3(page, 6);
  const slider = page.getByLabel("Your contribution percent");

  // Default 3% of $60K: employer hands over $1,800, keeps the other $1,800.
  await expect(slider).toHaveValue("3");
  await expect(page.getByText("At 3%, your employer hands you $1,800")).toBeVisible();
  await expect(page.getByText("keeps the $1,800 you didn't claim")).toBeVisible();
  await expect(page.locator("[data-forfeit-reveal]")).not.toHaveText("$0");

  // Slide to zero: none captured, the whole match forfeited.
  await slider.fill("0");
  await expect(page.getByText("At 0%, your employer hands you $0")).toBeVisible();
  await expect(page.getByText("keeps the $3,600 you didn't claim")).toBeVisible();

  // Slide to full match: forfeit collapses to nothing.
  await slider.fill("6");
  await expect(page.getByText("every dollar they'll give")).toBeVisible();
  await expect(page.locator("[data-forfeit-reveal]")).toHaveText("$0");
  await expect(page.getByText("you didn't claim")).toHaveCount(0);

  // Two lines, age markers, no rendering NaN at either end (WHI-103/104).
  await expect(page.locator("[data-forfeit-chart] polyline")).toHaveCount(2);
  await expect(page.locator("[data-forfeit-chart] text")).toHaveCount(3);
  await expect(page.locator("[data-forfeit-chart]")).not.toContainText("NaN");

  expect(errors).toEqual([]);
});

test("her drag survives the enroll toggle", async ({ page }) => {
  await openChapter3(page, 6);
  await page.getByLabel("Your contribution percent").fill("5");
  await page.getByRole("button", { name: "I'm in" }).click();
  await expect(page.getByRole("button", { name: /tap to take it back/ })).toBeVisible();
  await expect(page.getByLabel("Your contribution percent")).toHaveValue("5");
});

test("no match: no slider, no table to leave money on", async ({ page }) => {
  await openChapter3(page, 0);
  await expect(page.getByLabel("Your contribution percent")).toHaveCount(0);
  await expect(page.getByText("you didn't claim")).toHaveCount(0);
});

test("readable at 320px and in landscape", async ({ page }) => {
  await openChapter3(page, 6);
  for (const size of [
    { width: 320, height: 640 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    const slider = page.getByLabel("Your contribution percent");
    await expect(slider).toBeVisible();
    const box = await slider.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(size.width);
    // Nothing spills sideways off the phone.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }
});
