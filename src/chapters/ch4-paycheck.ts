/**
 * Chapter 4 — Your Paycheck & the Bracket Myth. Waterfall of where gross pay
 * goes, an interactive bracket-bucket demo that kills "a raise can lower my
 * take-home," and the real per-month cost of a 6% pre-tax contribution.
 * All tax math from src/lib/tax2026.ts (primary-source constants).
 */

import { genieSVG } from "../genie/genie";
import { formatMoney } from "../lib/format";
import { loadProfile, type Profile } from "../lib/profile";
import { employerMatchMonthly } from "../lib/projection";
import { paintRange } from "../lib/range";
import type { QuizSpec } from "../lib/quiz";
import { noteRef } from "../notes/genie-note";
import { uniqueDistractors } from "../quiz/choices";
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
      ${seg(noteRef("ch4-fica", "FICA"), p.fica, "waterfall__bar--tax")}
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

/** Duration and reach of the one-shot slider tour (WHI-110). */
export const NUDGE_MS = 1000;
export const NUDGE_AMPLITUDE = 8000;

/**
 * Slider value at progress `t` (0-1) of the tour: a there-and-back arc that
 * leaves the thumb exactly where it started.
 */
export function nudgeValue(base: number, t: number, amplitude: number = NUDGE_AMPLITUDE): number {
  return base + amplitude * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
}

/**
 * One-shot "this is draggable" tour: the thumb glides a few thousand dollars
 * and back over ~1s with the readout live, so the control announces itself
 * (WHI-110). Chapter 4 renders once per visit, so no replay guard is needed.
 * Any pointer or key interaction cancels it and restores her salary — the
 * user's own drag then takes over from wherever they grabbed it.
 */
export function nudgeSlider(slider: HTMLInputElement, onFrame: () => void): void {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const base = Number(slider.value);
  const min = Number(slider.min);
  const max = Number(slider.max);
  // Near the ceiling there's no room to glide up — go the other way instead.
  const amplitude = base + NUDGE_AMPLITUDE > max ? -NUDGE_AMPLITUDE : NUDGE_AMPLITUDE;
  const cancelEvents = ["pointerdown", "keydown", "touchstart"] as const;

  let frame = 0;
  let start: number | null = null;

  const stop = (): void => {
    cancelAnimationFrame(frame);
    for (const name of cancelEvents) slider.removeEventListener(name, stop);
    slider.value = String(base);
    slider.dataset.nudged = "done"; // the tour is over — also what e2e watches for
    onFrame();
  };

  const step = (timestamp: number): void => {
    start ??= timestamp;
    const t = (timestamp - start) / NUDGE_MS;
    if (t >= 1) {
      stop();
      return;
    }
    slider.value = String(Math.min(max, Math.max(min, nudgeValue(base, t, amplitude))));
    onFrame();
    frame = requestAnimationFrame(step);
  };

  for (const name of cancelEvents) slider.addEventListener(name, stop, { once: true });
  frame = requestAnimationFrame(step);
}

/** Chapter 4 Quiz (WHI-96) — the monthly-cost figure is hers, from the tax lib. */
export function quizCh4(profile: Profile): QuizSpec {
  const contribution = (profile.salary * CONTRIBUTION_PERCENT) / 100;
  const monthlyCost = (paycheck(profile.salary).net - paycheck(profile.salary, contribution).net) / 12;
  const cost = formatExact(monthlyCost);
  const distractors = uniqueDistractors(cost, [
    formatExact(contribution / 12), // the myth this beat kills: 6% must cost 6%
    formatExact(monthlyCost * 2),
    formatExact(monthlyCost * 3),
  ]);
  return {
    id: "ch4",
    questions: [
      {
        prompt: "A raise bumps you into a higher bracket. Your take-home pay…",
        choices: [
          "Drops — the whole paycheck gets the new rate",
          "Rises — only dollars inside the top bucket pay the higher rate",
          "Stays exactly the same",
        ],
        correctIndex: 1,
        explain: "Brackets are buckets: the new rate never touches the dollars below the line.",
        sectionRef: { chapter: 3, anchor: "sec-bracket-myth" },
      },
      {
        prompt: "Compared to your marginal (top-bucket) rate, your effective rate is…",
        choices: [
          "Higher — fees pile on top",
          "Identical — two names, one number",
          "Lower — it's the average across all your buckets",
        ],
        correctIndex: 2,
        explain: "Averaged across every bucket, it always lands below your top rate.",
        sectionRef: { chapter: 3, anchor: "sec-effective" },
      },
      {
        prompt: `Putting ${formatExact(contribution / 12)} a month (6%) into your 401k shrinks your monthly take-home by about…`,
        choices: [cost, ...distractors],
        correctIndex: 0,
        explain: "The contribution leaves before federal tax, so your paycheck drops by less than the full amount.",
        sectionRef: { chapter: 3, anchor: "sec-pretax" },
      },
    ],
  };
}

export const chapter4 = {
  id: "paycheck-bracket-myth",
  title: "Your Paycheck & the Bracket Myth",
  quiz: (): QuizSpec => quizCh4(loadProfile()),
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
      <div class="speech" id="sec-bracket-myth"><p>Now, the myth. "A raise pushed me into a higher bracket, so I took home less." <strong>Never true.</strong> Only the dollars <em>inside</em> the top bucket get the higher rate. Drag your income and watch.</p></div>
      <p class="dim slider__hint">Income simulator — drag to try any salary</p>
      <label class="slider">
        <input type="range" min="20000" max="250000" step="1000" value="${salary}" data-income aria-label="Income simulator" />
      </label>
      <p class="bracket-readout">
        Income <strong data-out="income"></strong> ·
        ${noteRef("ch4-marginal-bracket", "marginal")} <strong data-out="marginal"></strong> ·
        ${noteRef("ch4-effective-rate", "effective")} <strong data-out="effective"></strong><br />
        Take-home <strong data-out="net"></strong> <span class="dim" data-out="delta"></span>
      </p>
      <p class="dim" id="sec-effective">"Effective" is what you actually pay averaged across all your buckets — always lower than your top one.</p>
      ${bucketsHTML()}
      <div class="speech" id="sec-pretax"><p>One more trick while we're here: your 6% goes in <em>before</em> federal tax. That's ${formatExact(contribution / 12)} a month (${formatExact(contribution)} a year) — but your take-home only drops <strong>${formatExact(monthlyCost)} a month</strong>, while <strong>${formatExact(monthlyIntoAccount)} a month</strong> lands in your account, match included.</p></div>
      <p class="dim">2026 single-filer brackets, ${noteRef("ch4-standard-deduction", "standard deduction")}, verified against IRS and SSA sources. Real Dollars everywhere else, real tax law here.</p>
    `;

    const slider = root.querySelector<HTMLInputElement>("[data-income]")!;
    const out = (name: string): HTMLElement => root.querySelector(`[data-out="${name}"]`)!;
    const fills = [...root.querySelectorAll<HTMLElement>(".bucket")];
    let lastGross = Number(slider.value);
    let lastNet = paycheck(lastGross).net;

    const update = (): void => {
      const gross = Number(slider.value);
      paintRange(slider);
      const p = paycheck(gross);
      const taxable = taxableIncome(gross);
      out("income").textContent = formatMoney(gross);
      out("marginal").textContent = pct(p.marginalRate);
      out("effective").textContent = pct(p.effectiveRate);
      out("net").textContent = formatExact(p.net);
      // "IMPOSSIBLE" is the raise-never-lowers-take-home invariant — it only
      // applies when income moved up. Dragging left lowers net legitimately.
      out("delta").textContent =
        gross >= lastGross
          ? p.net >= lastNet
            ? "— up, always up"
            : "— IMPOSSIBLE, file a bug"
          : "— less in, less out. The myth only breaks upward.";
      lastGross = gross;
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
    nudgeSlider(slider, update);
  },
};
