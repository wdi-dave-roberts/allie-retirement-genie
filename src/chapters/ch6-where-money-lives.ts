/**
 * Chapter 6 — Where Money Lives. Emergency fund first (3-6× monthly spend),
 * then the savings-account rot Reveal, then index funds / target-date fund
 * as the easy button. Growth math via src/lib/projection.ts.
 */

import { genieSVG } from "../genie/genie";
import { lineChart } from "../lib/chart";
import { formatMoney } from "../lib/format";
import { loadProfile, type Profile } from "../lib/profile";
import { futureValueLumpSum } from "../lib/projection";

/**
 * Idle-cash real return: 0.4% nominal checking yield against a 2.5% long-run
 * inflation assumption (≈ CPI long-run average; the app's Real Dollars
 * convention already bakes inflation into the 7% investment return, so cash
 * must carry the same haircut). Real rate ≈ −2.05%/yr.
 */
export const CASH_NOMINAL_YIELD = 0.004;
export const INFLATION_ASSUMPTION = 0.025;
export const CASH_MONTHLY_REAL_RATE =
  Math.pow((1 + CASH_NOMINAL_YIELD) / (1 + INFLATION_ASSUMPTION), 1 / 12) - 1;

export const ROT_PRINCIPAL = 10_000;
export const ROT_YEARS = 20;

export interface RotData {
  cash10y: number;
  cash20y: number;
  invested20y: number;
  cashPoints: Array<[number, number]>;
  investedPoints: Array<[number, number]>;
}

export function rotData(principal: number = ROT_PRINCIPAL): RotData {
  const cashPoints: Array<[number, number]> = [];
  const investedPoints: Array<[number, number]> = [];
  for (let year = 0; year <= ROT_YEARS; year++) {
    cashPoints.push([year, futureValueLumpSum(principal, year * 12, CASH_MONTHLY_REAL_RATE)]);
    investedPoints.push([year, futureValueLumpSum(principal, year * 12)]);
  }
  return {
    cash10y: futureValueLumpSum(principal, 120, CASH_MONTHLY_REAL_RATE),
    cash20y: futureValueLumpSum(principal, 240, CASH_MONTHLY_REAL_RATE),
    invested20y: futureValueLumpSum(principal, 240),
    cashPoints,
    investedPoints,
  };
}

/** Emergency-fund target: [3×, 6×] her actual monthly spend. */
export function emergencyTarget(profile: Profile): [number, number] {
  return [profile.monthlySpend * 3, profile.monthlySpend * 6];
}

/** Whole dollars with separators. */
function formatExact(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export const chapter6 = {
  id: "where-money-lives",
  title: "Where Money Lives",
  render(root: HTMLElement): void {
    const profile = loadProfile();
    if (profile.monthlySpend <= 0) {
      root.innerHTML = `
        <div class="chapter__genie">${genieSVG("idle")}</div>
        <p class="chapter__kicker">Chapter 6</p>
        <h2 class="chapter__title">Where Money Lives</h2>
        <div class="speech"><p>I need your monthly spend for this one — Chapter 1 has the intake.</p></div>
      `;
      return;
    }

    const [low, high] = emergencyTarget(profile);
    const rot = rotData();

    root.innerHTML = `
      <div class="chapter__genie">${genieSVG("point")}</div>
      <p class="chapter__kicker">Chapter 6</p>
      <h2 class="chapter__title">Where Money Lives</h2>
      <div class="speech"><p>An account is a <em>bucket</em>, not an investment. Before any magic: an emergency fund. Three to six months of your real spending, parked in a high-yield savings account you never touch.</p></div>
      <div class="reveal reveal--instant">
        <p class="reveal__number">${formatExact(low)} – ${formatExact(high)}</p>
        <p>Your bucket. Boring on purpose. This is what lets you take every other risk in this app.</p>
      </div>
      <div class="speech"><p>Now the rot. $10,000 "safe" in a 0.4% checking account isn't safe — inflation eats it alive. Same $10,000, invested at 7% real:</p></div>
      <figure class="curve">
        ${lineChart({
          series: [
            { points: rot.cashPoints, className: "curve__line curve__line--later" },
            { points: rot.investedPoints, className: "curve__line curve__line--now" },
          ],
          label: `$10,000 over ${ROT_YEARS} years in Real Dollars: invested grows to ${formatMoney(rot.invested20y)}, idle cash rots to ${formatMoney(rot.cash20y)}`,
        })}
        <figcaption class="curve__legend">
          <span class="curve__key curve__key--now">invested → ${formatMoney(rot.invested20y)}</span>
          <span class="curve__key curve__key--later">checking → ${formatMoney(rot.cash20y)}</span>
        </figcaption>
      </figure>
      <p class="dim">Real Dollars, 20 years. The checking line isn't flat — it's melting: ${formatMoney(rot.cash10y)} by year 10.</p>
      <div class="speech"><p>Inside the 401k, skip the stock-picking cosplay. Nobody beats the market reliably — so own the <em>whole</em> market for fees around 0.03%. Easiest version: your plan's <strong>target-date fund</strong> — one fund, dated near 2059, that starts aggressive and calms down as you age. It is a genuinely fine default, and picking it takes eleven seconds.</p></div>
    `;
  },
};
