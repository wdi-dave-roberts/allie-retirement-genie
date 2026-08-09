import { expect, test } from "@playwright/test";

/** Chapter 4 income simulator affordance (WHI-110): it has to look draggable. */

const SALARY = 65000;

async function openChapter4(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("./");
  await page.evaluate((salary) => {
    localStorage.setItem(
      "genie.profile.v1",
      JSON.stringify({ salary, monthlySpend: 3200, currentSavings: 4000, matchPercent: 6 }),
    );
    localStorage.setItem("genie.progress.v1", "3");
  }, SALARY);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your Paycheck & the Bracket Myth" })).toBeVisible();
}

test("labelled as a simulator, painted like a control", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await openChapter4(page);
  await expect(page.getByText("Income simulator — drag to try any salary")).toBeVisible();

  const slider = page.getByLabel("Income simulator");
  // Fat enough to hit, and the filled portion tracks the thumb.
  const box = await slider.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(40);
  await expect(slider).toHaveAttribute("data-nudged", "done"); // tour finished
  expect(await slider.evaluate((el) => el.style.getPropertyValue("--fill"))).toMatch(/%$/);

  expect(errors).toEqual([]);
});

test("the tour runs once and puts the thumb back on her salary", async ({ page }) => {
  await openChapter4(page);
  const slider = page.getByLabel("Income simulator");
  await expect(slider).toHaveAttribute("data-nudged", "done");
  await expect(slider).toHaveValue(String(SALARY));
  await expect(page.locator('[data-out="income"]')).toHaveText("$65K");
});

test("touching the slider mid-tour cancels it — no fighting the user", async ({ page }) => {
  await page.goto("./");
  await page.evaluate((salary) => {
    localStorage.setItem(
      "genie.profile.v1",
      JSON.stringify({ salary, monthlySpend: 3200, currentSavings: 4000, matchPercent: 6 }),
    );
    localStorage.setItem("genie.progress.v1", "3");
  }, SALARY);
  await page.reload();

  // Reach for the thumb while the tour is still in flight, then set a value.
  const slider = page.getByLabel("Income simulator");
  await slider.dispatchEvent("pointerdown");
  await expect(slider).toHaveAttribute("data-nudged", "done");
  await slider.fill("120000");

  // Past the end of the tour window, her value is untouched.
  await page.waitForTimeout(1200);
  await expect(slider).toHaveValue("120000");
  await expect(page.locator('[data-out="income"]')).toHaveText("$120K");
  // $120K gross less the standard deduction lands her in the 22% bucket.
  await expect(page.locator('[data-out="marginal"]')).toHaveText("22%");
});

test("a real drag moves the income and the readout follows", async ({ page }) => {
  await openChapter4(page);
  const slider = page.getByLabel("Income simulator");
  await expect(slider).toHaveAttribute("data-nudged", "done"); // tour done; the drag is all hers

  await slider.hover(); // scrolls it into view, parks the pointer on the thumb
  const box = (await slider.boundingBox())!;
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();

  expect(Number(await slider.inputValue())).toBeGreaterThan(SALARY);
  await expect(page.locator('[data-out="income"]')).toHaveText(
    formatK(Number(await slider.inputValue())),
  );
});

/** Mirrors formatMoney's $NNNK shape for the readout assertion. */
function formatK(value: number): string {
  return `$${Math.round(value / 1000)}K`;
}

test("prefers-reduced-motion: no tour, label still there", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openChapter4(page);
  const slider = page.getByLabel("Income simulator");
  await expect(page.getByText("Income simulator — drag to try any salary")).toBeVisible();
  await expect(slider).toHaveValue(String(SALARY));
  await expect(slider).not.toHaveAttribute("data-nudged", "done");
});

test("Ch7 levers share the affordance", async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => {
    localStorage.setItem(
      "genie.profile.v1",
      JSON.stringify({ salary: 65000, monthlySpend: 3200, currentSavings: 4000, matchPercent: 6 }),
    );
    localStorage.setItem("genie.progress.v1", "6");
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Lever Room" })).toBeVisible();
  for (const lever of ["contributionPercent", "retireAge", "raisePercent"]) {
    const input = page.locator(`[data-lever="${lever}"]`);
    expect(await input.evaluate((el) => el.style.getPropertyValue("--fill"))).toMatch(/%$/);
    expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(40);
  }
});

test("clean at 320px and in landscape", async ({ page }) => {
  await openChapter4(page);
  for (const size of [
    { width: 320, height: 640 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await expect(page.getByLabel("Income simulator")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }
});
