/**
 * Chapter 2 — The Curve. Compound growth of her contributions starting now
 * (age 32) vs starting at 42, in Real Dollars to 65. All math comes from
 * src/lib/projection.ts; this file only shapes and displays it.
 */

import { genieSVG } from "../genie/genie";
import { lineChart } from "../lib/chart";
import { formatMoney } from "../lib/format";
import { loadProfile, type Profile } from "../lib/profile";
import {
  contributionMonthly,
  employerMatchMonthly,
  futureValueOfStream,
} from "../lib/projection";

export const START_AGE = 32;
export const LATE_START_AGE = 42;
export const RETIRE_AGE = 65;
const CONTRIBUTION_PERCENT = 6;

export interface CurveData {
  /** Combined employee + match monthly contribution. */
  monthly: number;
  /** Balance at 65 starting now. */
  now: number;
  /** Balance at 65 starting at 42. */
  later: number;
  /** The Reveal: what waiting ten years costs, in today's dollars. */
  gap: number;
  /** [age, balance] per year for each line. */
  nowPoints: Array<[number, number]>;
  laterPoints: Array<[number, number]>;
}

export function curveData(profile: Profile): CurveData {
  const monthly =
    contributionMonthly(profile.salary, CONTRIBUTION_PERCENT) +
    employerMatchMonthly(profile.salary, CONTRIBUTION_PERCENT, profile.matchPercent);

  const nowPoints: Array<[number, number]> = [];
  const laterPoints: Array<[number, number]> = [];
  for (let age = START_AGE; age <= RETIRE_AGE; age++) {
    nowPoints.push([age, futureValueOfStream(monthly, (age - START_AGE) * 12)]);
    laterPoints.push([
      age,
      age <= LATE_START_AGE ? 0 : futureValueOfStream(monthly, (age - LATE_START_AGE) * 12),
    ]);
  }

  const now = nowPoints[nowPoints.length - 1]![1];
  const later = laterPoints[laterPoints.length - 1]![1];
  return { monthly, now, later, gap: now - later, nowPoints, laterPoints };
}

export const chapter2 = {
  id: "the-curve",
  title: "The Curve",
  render(root: HTMLElement): void {
    const profile = loadProfile();
    if (profile.salary <= 0) {
      root.innerHTML = `
        <div class="chapter__genie">${genieSVG("idle")}</div>
        <p class="chapter__kicker">Chapter 2</p>
        <h2 class="chapter__title">The Curve</h2>
        <div class="speech"><p>I need your numbers before I can show you this one. Hop back a chapter — I'll wait, I'm immortal.</p></div>
      `;
      return;
    }

    const data = curveData(profile);
    root.innerHTML = `
      <div class="chapter__genie">${genieSVG("point")}</div>
      <p class="chapter__kicker">Chapter 2</p>
      <h2 class="chapter__title">The Curve</h2>
      <div class="speech"><p>Quick setup first: say you put 6% of each paycheck into your 401k, and your employer chips in the same on top. That second part sounds made up — it's real, and Chapter 3 is entirely about it.</p></div>
      <div class="speech"><p>Now watch that money grow — starting today vs starting at 42. Growth earns growth. That's the whole trick.</p></div>
      <figure class="curve">
        ${lineChart({
          series: [
            { points: data.laterPoints, className: "curve__line curve__line--later" },
            { points: data.nowPoints, className: "curve__line curve__line--now" },
          ],
          label: `Savings to age ${RETIRE_AGE}: starting now reaches ${formatMoney(data.now)}, starting at ${LATE_START_AGE} reaches ${formatMoney(data.later)}`,
        })}
        <figcaption class="curve__legend">
          <span class="curve__key curve__key--now">start now → ${formatMoney(data.now)}</span>
          <span class="curve__key curve__key--later">start at ${LATE_START_AGE} → ${formatMoney(data.later)}</span>
        </figcaption>
      </figure>
      <div class="reveal">
        <p class="reveal__number" data-reveal>${formatMoney(data.gap)}</p>
        <p>That's what waiting ten years costs you — in today's dollars. Not a fee. Just growth that never got the chance to grow.</p>
      </div>
      <p class="dim">Real Dollars: inflation is already accounted for, so this is what it buys in 2026 terms.</p>
    `;
  },
};
