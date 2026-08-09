/**
 * Chapter 4 — Your Paycheck & the Bracket Myth. Waterfall of where gross pay
 * goes, an interactive bracket-bucket demo that kills "a raise can lower my
 * take-home," and the real per-month cost of a 6% pre-tax contribution.
 * All tax math from src/lib/tax2026.ts (primary-source constants).
 */

import { genieSVG } from "../genie/genie";
import { formatMoney } from "../lib/format";
import { loadProfile } from "../lib/profile";
import { employerMatchMonthly } from "../lib/projection";
import { BRACKETS_SINGLE_2026, paycheck, taxableIncome } from "../lib/tax2026";

const CONTRIBUTION_PERCENT = 6;

/** Whole dollars with separators — paycheck figures should feel exact. */
function formatExact(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function waterfallHTML(gross: number): string {
  const p = paycheck(gross);
  const seg = (label: string, value: number, cls: string): string => `
    <div class="waterfall__row">
      <span class="waterfall__label">${label}</span>
      <div class="waterfall__track">
        <div class="waterfall__bar ${cls}" style="width:${((value / gross) * 100).toFixed(1)}%"></div>
      </div>
      <span class="waterfall__value">${formatExact(value)}</span>
    </div>`;
  return `
    <div class="waterfall">
      ${seg("Gross", gross, "waterfall__bar--gross")}
      ${seg("Federal tax", p.federal, "waterfall__bar--tax")}
      ${seg("FICA", p.fica, "waterfall__bar--tax")}
      ${seg("Texas tax", 0, "waterfall__bar--tax")}
      ${seg("Take-home", p.net, "waterfall__bar--net")}
    </div>`;
}

function bucketsHTML(): string {
  const rows = BRACKETS_SINGLE_2026.filter((b) => b.upTo <= 260_000 || b.rate === 0.24)
    .map(
      (b) => `
      <div class="bucket" data-rate="${b.rate}">
        <span class="bucket__label">${pct(b.rate)}</span>
        <div class="bucket__track"><div class="bucket__fill" data-fill></div></div>
      </div>`,
    )
    .join("");
  return `<div class="buckets">${rows}</div>`;
}

export const chapter4 = {
  id: "paycheck-bracket-myth",
  title: "Your Paycheck & the Bracket Myth",
  render(root: HTMLElement): void {
    const profile = loadProfile();
    if (profile.salary <= 0) {
      root.innerHTML = `
        <div class="chapter__genie">${genieSVG("idle")}</div>
        <p class="chapter__kicker">Chapter 4</p>
        <h2 class="chapter__title">Your Paycheck &amp; the Bracket Myth</h2>
        <div class="speech"><p>No numbers, no magic. Chapter 1 is a quick trip back.</p></div>
      `;
      return;
    }

    const salary = profile.salary;
    const base = paycheck(salary);
    const contribution = (salary * CONTRIBUTION_PERCENT) / 100;
    const withK = paycheck(salary, contribution);
    const monthlyCost = (base.net - withK.net) / 12;
    const monthlyIntoAccount =
      contribution / 12 +
      employerMatchMonthly(salary, CONTRIBUTION_PERCENT, profile.matchPercent);

    root.innerHTML = `
      <div class="chapter__genie">${genieSVG("point")}</div>
      <p class="chapter__kicker">Chapter 4</p>
      <h2 class="chapter__title">Your Paycheck &amp; the Bracket Myth</h2>
      <div class="speech"><p>Where does ${formatExact(salary)} actually go? Watch. And yes — that Texas line is <strong>zero state income tax</strong>. I picked a good state to live in a lamp in.</p></div>
      ${waterfallHTML(salary)}
      <div class="speech"><p>Now, the myth. "A raise pushed me into a higher bracket, so I took home less." <strong>Never true.</strong> Only the dollars <em>inside</em> the top bucket get the higher rate. Drag your income and watch.</p></div>
      <label class="slider">
        <input type="range" min="20000" max="250000" step="1000" value="${salary}" data-income />
      </label>
      <p class="bracket-readout">
        Income <strong data-out="income"></strong> ·
        marginal <strong data-out="marginal"></strong> ·
        effective <strong data-out="effective"></strong><br />
        Take-home <strong data-out="net"></strong> <span class="dim" data-out="delta"></span>
      </p>
      ${bucketsHTML()}
      <div class="speech"><p>One more trick while we're here: your 6% goes in <em>before</em> federal tax. Contributing ${formatExact(contribution)} a year only shrinks your take-home by <strong>${formatExact(monthlyCost)} a month</strong> — while <strong>${formatExact(monthlyIntoAccount)} a month</strong> lands in your account, match included.</p></div>
      <p class="dim">2026 single-filer brackets, standard deduction, verified against IRS and SSA sources. Real Dollars everywhere else, real tax law here.</p>
    `;

    const slider = root.querySelector<HTMLInputElement>("[data-income]")!;
    const out = (name: string): HTMLElement => root.querySelector(`[data-out="${name}"]`)!;
    const fills = [...root.querySelectorAll<HTMLElement>(".bucket")];
    let lastNet = paycheck(Number(slider.value)).net;

    const update = (): void => {
      const gross = Number(slider.value);
      const p = paycheck(gross);
      const taxable = taxableIncome(gross);
      out("income").textContent = formatMoney(gross);
      out("marginal").textContent = pct(p.marginalRate);
      out("effective").textContent = pct(p.effectiveRate);
      out("net").textContent = formatExact(p.net);
      out("delta").textContent =
        p.net >= lastNet ? "— up, always up" : "— IMPOSSIBLE, file a bug";
      lastNet = p.net;

      let floor = 0;
      for (const bucket of fills) {
        const rate = Number(bucket.dataset.rate);
        const bracket = BRACKETS_SINGLE_2026.find((b) => b.rate === rate)!;
        const span = Math.min(bracket.upTo, 260_000) - floor;
        const inBucket = Math.max(0, Math.min(taxable, bracket.upTo) - floor);
        bucket.querySelector<HTMLElement>("[data-fill]")!.style.width =
          `${((inBucket / span) * 100).toFixed(1)}%`;
        bucket.classList.toggle("bucket--top", taxable > floor && taxable <= bracket.upTo);
        floor = bracket.upTo;
      }
    };

    slider.addEventListener("input", update);
    update();
  },
};
