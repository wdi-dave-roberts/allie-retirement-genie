import { expect, test } from "@playwright/test";
import { NOTES } from "../src/notes/registry";

/**
 * Deeper Dive dead-link check (WHI-100 acceptance: every URL verified live).
 * Network-bound, so it only runs when asked:
 *   VERIFY_LINKS=1 pnpm exec playwright test dive-links
 * Run it whenever registry URLs change; skipped otherwise to keep the suite
 * offline-safe and flake-free.
 *
 * Investopedia's WAF fingerprints automated TLS clients and 403s them all —
 * headless Chromium, curl, and node fetch alike — while serving real
 * browsers fine (each URL hand-verified 200 on 2026-08-09). A 403 here
 * therefore means "bot-walled but served"; what this check catches is the
 * real rot: typos, moved pages, and dead hosts (404/410/5xx).
 */
test.skip(!process.env.VERIFY_LINKS, "set VERIFY_LINKS=1 to check external links");

for (const [id, note] of Object.entries(NOTES)) {
  if (!note.dive) continue;
  test(`${id} → ${note.dive.url}`, async ({ page }) => {
    const response = await page.goto(note.dive!.url, { waitUntil: "domcontentloaded" });
    const status = response?.status() ?? 0;
    expect(status, "dead or moved link").not.toBe(404);
    expect(status, "gone").not.toBe(410);
    expect(status, "server error").toBeLessThan(500);
  });
}
