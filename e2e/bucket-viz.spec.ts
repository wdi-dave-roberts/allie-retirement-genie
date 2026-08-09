import { expect, test } from "@playwright/test";

/** Chapter 4 bucket viz (WHI-111): dollars per bracket, deduction as the 0% bucket. */

async function openChapter4(
  page: import("@playwright/test").Page,
  salary = 65000,
): Promise<void> {
  await page.goto("./");
  await page.evaluate((s) => {
    localStorage.setItem(
      "genie.profile.v1",
      JSON.stringify({ salary: s, monthlySpend: 3200, currentSavings: 4000, matchPercent: 6 }),
    );
    localStorage.setItem("genie.progress.v1", "3");
  }, salary);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your Paycheck & the Bracket Myth" })).toBeVisible();
}

test("the standard deduction is taught first, then leads the stack", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await openChapter4(page);

  // Copy beat lands before the viz.
  await expect(page.locator("#sec-deduction")).toContainText("ignores your first $16,100");
  await expect(page.locator("#sec-deduction")).toContainText("standard deduction");

  // And it's the first bucket in the stack, at 0%.
  const first = page.locator('[data-bucket="0"]');
  await expect(first.locator(".bucket__rate")).toHaveText("0%");
  await expect(first.locator(".bucket__label")).toContainText("your first $16,100");
  await expect(first.locator("[data-note]")).toHaveText("$16,100 in → $0 tax");

  expect(errors).toEqual([]);
});

test("each row shows the slice it holds and the tax it makes", async ({ page }) => {
  await openChapter4(page); // $65,000 → taxable $48,900

  // 10% bucket fills completely: the first $12,400 of taxable income.
  const ten = page.locator('[data-bucket="1"]');
  await expect(ten.locator(".bucket__label")).toContainText("the next $12,400");
  await expect(ten.locator("[data-note]")).toHaveText("$12,400 in → $1,240 tax");

  // 12% bucket catches the spill: $48,900 - $12,400 = $36,500.
  const twelve = page.locator('[data-bucket="2"]');
  await expect(twelve.locator("[data-note]")).toHaveText("$36,500 in → $4,380 tax");

  // 22% is out of reach at this income.
  await expect(page.locator('[data-bucket="3"] [data-note]')).toContainText("empty");
});

test("dragging up spills into the next bucket and moves the marginal badge", async ({ page }) => {
  await openChapter4(page);
  const slider = page.locator("[data-income]");

  // At $65K the 12% bucket is her top one.
  await expect(page.locator('[data-bucket="2"]')).toHaveClass(/bucket--top/);
  await expect(page.locator('[data-bucket="2"] [data-badge]')).toBeVisible();
  await expect(page.locator('[data-bucket="3"] [data-badge]')).toBeHidden();

  // Push past the 12% ceiling — the 22% bucket takes the overflow and the badge.
  await slider.fill("120000");
  await expect(page.locator('[data-bucket="2"] [data-note]')).toHaveText(
    "$38,000 in → $4,560 tax", // 12% bucket now full: 50,400 - 12,400
  );
  await expect(page.locator('[data-bucket="3"]')).toHaveClass(/bucket--top/);
  await expect(page.locator('[data-bucket="3"] [data-badge]')).toBeVisible();
  await expect(page.locator('[data-bucket="2"] [data-badge]')).toBeHidden();
  await expect(page.locator('[data-out="marginal"]')).toHaveText("22%");
});

test("effective rate reads as the sum of the buckets on screen", async ({ page }) => {
  await openChapter4(page);
  const sum = page.locator("[data-bucket-sum]");
  await expect(sum).toContainText("all buckets:");
  await expect(sum).toContainText("÷ $65,000 =");

  // The stated total matches the per-bucket tax annotations above it.
  const perBucket = await page.locator("[data-note]").allTextContents();
  const summed = perBucket.reduce((total, text) => {
    const tax = /→ \$([\d,]+) tax/.exec(text);
    return total + (tax ? Number(tax[1]!.replace(/,/g, "")) : 0);
  }, 0);
  await expect(sum).toContainText(`$${summed.toLocaleString("en-US")} tax`);

  // And it tracks the readout's effective figure.
  const effective = await page.locator('[data-out="effective"]').textContent();
  await expect(sum).toContainText(`= ${effective} effective`);
});

test("no NaN at the slider extremes", async ({ page }) => {
  await openChapter4(page);
  const slider = page.locator("[data-income]");
  for (const income of ["20000", "250000"]) {
    await slider.fill(income);
    await expect(page.locator(".buckets")).not.toContainText("NaN");
    await expect(page.locator("[data-bucket-sum]")).not.toContainText("NaN");
    const widths = await page
      .locator("[data-fill]")
      .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.width));
    expect(widths.every((w) => /^\d+(\.\d+)?%$/.test(w))).toBe(true);
  }
});

test("quiz Section Links still land on their sections", async ({ page }) => {
  await openChapter4(page);
  await expect(page.locator("#sec-bracket-myth")).toBeVisible();
  await expect(page.locator("#sec-effective")).toBeVisible();
  await expect(page.locator("#sec-pretax")).toBeVisible();
  await expect(page.getByText("averaged across all your buckets")).toBeVisible();
});

test("legible at 320px — no horizontal overflow", async ({ page }) => {
  await openChapter4(page, 250000); // longest labels and annotations
  for (const size of [
    { width: 320, height: 640 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await expect(page.locator('[data-bucket="0"]')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }
});
