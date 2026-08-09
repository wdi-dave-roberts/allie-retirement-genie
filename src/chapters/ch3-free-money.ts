/**
 * Chapter 3 — Free Money. The employer match as a declined raise, the
 * compounded value of just the match, and the "I'm in" Enrollment moment.
 * Math comes from src/lib/projection.ts only.
 */

import { genieSVG } from "../genie/genie";
import { isEnrolled, setEnrolled } from "../lib/enrollment";
import { formatMoney } from "../lib/format";
import { loadProfile, type Profile } from "../lib/profile";
import { employerMatchMonthly, futureValueOfStream } from "../lib/projection";

const START_AGE = 32;
const RETIRE_AGE = 65;

export interface FreeMoneyData {
  /** Employer match per month at full capture. */
  matchMonthly: number;
  /** The declined raise: match dollars per year. */
  annualMatch: number;
  /** Just the match, compounded to 65 in Real Dollars. */
  compounded: number;
}

export function freeMoneyData(profile: Profile): FreeMoneyData {
  const matchMonthly = employerMatchMonthly(
    profile.salary,
    profile.matchPercent,
    profile.matchPercent,
  );
  return {
    matchMonthly,
    annualMatch: matchMonthly * 12,
    compounded: futureValueOfStream(matchMonthly, (RETIRE_AGE - START_AGE) * 12),
  };
}

/** Whole dollars with thousands separators — the raise should feel exact. */
export function formatExact(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function confetti(host: HTMLElement): void {
  const burst = document.createElement("div");
  burst.className = "confetti";
  const pieces = 36;
  let spans = "";
  for (let i = 0; i < pieces; i++) {
    const dx = (Math.random() * 2 - 1) * 160;
    const delay = Math.random() * 0.2;
    const dur = 1.2 + Math.random() * 0.8;
    const rot = Math.random() * 720 - 360;
    const hue = i % 3; // cycles the three token colors via nth-child rules
    spans += `<span class="confetti__piece confetti__piece--${hue}" style="--dx:${dx.toFixed(0)}px;--rot:${rot.toFixed(0)}deg;animation-delay:${delay.toFixed(2)}s;animation-duration:${dur.toFixed(2)}s"></span>`;
  }
  burst.innerHTML = spans;
  host.appendChild(burst);
  setTimeout(() => burst.remove(), 2400);
}

export const chapter3 = {
  id: "free-money",
  title: "Free Money",
  render(root: HTMLElement): void {
    const profile = loadProfile();
    if (profile.salary <= 0) {
      root.innerHTML = `
        <div class="chapter__genie">${genieSVG("idle")}</div>
        <p class="chapter__kicker">Chapter 3</p>
        <h2 class="chapter__title">Free Money</h2>
        <div class="speech"><p>I need your numbers for this one. Hop back to Chapter 1 — I'll keep the lamp warm.</p></div>
      `;
      return;
    }

    const data = freeMoneyData(profile);

    const draw = (): void => {
      const enrolled = isEnrolled();
      root.innerHTML = `
        <div class="chapter__genie">${genieSVG(enrolled ? "celebrate" : "point")}</div>
        <p class="chapter__kicker">Chapter 3</p>
        <h2 class="chapter__title">Free Money</h2>
        <div class="speech"><p>Your employer matches what you put in, up to ${profile.matchPercent}% of your salary. Unenrolled, that means you are currently declining a <strong>${formatExact(data.annualMatch)}-a-year raise</strong>. On purpose. For no reason.</p></div>
        <div class="reveal">
          <p class="reveal__number" data-reveal>${formatMoney(data.compounded)}</p>
          <p>That's just the match — nothing of yours — compounded to 65, in today's dollars.</p>
        </div>
        <div class="speech"><p>And here's the part banks dream about: every dollar you put in up to ${profile.matchPercent}% <strong>doubles the moment it arrives</strong>. 100% return before the market even wakes up.</p></div>
        <button class="btn ${enrolled ? "btn--ghost" : "btn--primary"}" data-enroll>
          ${enrolled ? "I'm in ✓ (tap to take it back)" : "I'm in"}
        </button>
        <p class="dim" data-promise ${enrolled ? "" : "hidden"}>That's a promise to yourself, not paperwork. The actual enrollment steps are in Chapter 7's Action Checklist.</p>
      `;
      root.querySelector<HTMLButtonElement>("[data-enroll]")!.addEventListener("click", () => {
        const next = !isEnrolled();
        setEnrolled(next);
        draw();
        if (next) confetti(root);
      });
    };

    draw();
  },
};
