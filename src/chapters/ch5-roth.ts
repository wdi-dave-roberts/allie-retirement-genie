/**
 * Chapter 5 — Roth vs Traditional. One real difference, one clear
 * recommendation, under three minutes. No calculator (per non-goals).
 */

import { genieSVG } from "../genie/genie";
import { isRothCheckFlagged, setRothCheckFlagged } from "../lib/enrollment";
import { formatMoney } from "../lib/format";
import type { QuizSpec } from "../lib/quiz";
import { noteRef } from "../notes/genie-note";
import { BRACKETS_SINGLE_2026, STANDARD_DEDUCTION_SINGLE_2026 } from "../lib/tax2026";

/**
 * Gross income where the 22% bracket begins — the point where the Roth
 * recommendation deserves a second look. Derived from the tax constants so
 * a year-over-year update there keeps this copy honest.
 */
export function rothRethinkGross(): number {
  const twelvePctTop = BRACKETS_SINGLE_2026.find((b) => b.rate === 0.12)!.upTo;
  return twelvePctTop + STANDARD_DEDUCTION_SINGLE_2026;
}

/** Chapter 5 Quiz (WHI-97) — static: the one difference, the pick, the match. */
export function quizCh5(): QuizSpec {
  return {
    id: "ch5",
    questions: [
      {
        prompt: "The only real difference between Roth and Traditional is…",
        choices: [
          "Which investments you're allowed to pick",
          "When the tax collector says hello",
          "Whether you get the employer match",
        ],
        correctIndex: 1,
        explain: "Same dollar, same growth — the only question is taxed now (Roth) or taxed at withdrawal (Traditional).",
        sectionRef: { chapter: 4, anchor: "sec-difference" },
      },
      {
        prompt: "The Genie's pick at 32 — and the why?",
        choices: [
          "Roth — today's tax rate is likely the lowest you'll ever pay",
          "Traditional — taxes at 65 are always lower",
          "Neither — wait until you're sure to enroll",
        ],
        correctIndex: 0,
        explain: "Decades of raises ahead means today's rate is the bargain, and 33 years of growth walks out tax-free.",
        sectionRef: { chapter: 4, anchor: "sec-recommendation" },
      },
      {
        prompt: "Whichever box you tick, the employer match is…",
        choices: [
          "Roth, if you picked Roth",
          "Forfeited until you decide",
          "Pre-tax either way — this choice should never delay enrolling",
        ],
        correctIndex: 2,
        explain: "The match doesn't care which you chose — so nothing about Roth vs Traditional is a reason to wait.",
        sectionRef: { chapter: 4, anchor: "sec-recommendation" },
      },
    ],
  };
}

export const chapter5 = {
  id: "roth-vs-traditional",
  title: "Roth vs Traditional",
  quiz: (): QuizSpec => quizCh5(),
  render(root: HTMLElement): void {
    const draw = (): void => {
      const flagged = isRothCheckFlagged();
      root.innerHTML = `
        <div class="chapter__genie">${genieSVG("idle")}</div>
        <p class="chapter__kicker">Chapter 5</p>
        <h2 class="chapter__title">Roth vs Traditional</h2>
        <div class="speech" id="sec-difference"><p>Deep breath. This one has a reputation, and it doesn't deserve it. There is exactly one difference: <strong>when the tax collector says hello.</strong></p></div>
        <div class="paths">
          <div class="path">
            <h3 class="path__title">${noteRef("ch5-roth-vs-traditional", "Roth")}</h3>
            <ol class="path__steps">
              <li>Tax bites your dollar <strong>now</strong></li>
              <li>It grows for 33 years</li>
              <li>You keep <strong>every penny</strong> at 65</li>
            </ol>
          </div>
          <div class="path">
            <h3 class="path__title">${noteRef("ch5-roth-vs-traditional", "Traditional")}</h3>
            <ol class="path__steps">
              <li>Whole dollar goes in <strong>untaxed</strong></li>
              <li>It grows for 33 years</li>
              <li>Tax bites <strong>at withdrawal</strong></li>
            </ol>
          </div>
        </div>
        <div class="speech"><p>Same dollar, same growth, same math — the only question is whether your tax rate is lower today or at 65. You're 32, single, with decades of raises ahead. Today is probably the cheapest tax you will ever pay.</p></div>
        <div class="speech"><p>Why so confident? Your top rate today is 12% — near the bottom of the ladder. Traditional's only trick is skipping tax at a <em>high</em> rate to pay a lower one later, and skipping 12% saves almost nothing. Worst case, Roth costs you a rounding error. And if this plan works, future-you is richer than today-you — then Roth wins outright. When a raise pushes you past ${formatMoney(rothRethinkGross())} — that's where the 22% bracket starts — the question gets interesting. Revisit it then.</p></div>
        <div class="speech speech--recommendation" id="sec-recommendation"><p><strong>My recommendation: pick Roth if your plan offers a Roth 401k.</strong> Your rate today is likely the lowest it'll ever be, and 33 years of growth ${noteRef("ch5-tax-free-growth", "walks out tax-free")}. One honest trade: Roth skips Chapter 4's take-home discount — your paycheck feels the whole contribution now, and the payback is never paying tax on those dollars again. No Roth option? Traditional is still a clear win — and the match is pre-tax either way, so nothing about this choice should delay enrolling.</p></div>
        <button class="btn ${flagged ? "btn--ghost" : "btn--primary"}" data-roth-check>
          ${flagged ? "On my checklist ✓" : "Remind me: does my plan have Roth?"}
        </button>
        <p class="dim">This lands in your Action Checklist in Chapter 7.</p>
      `;
      root.querySelector<HTMLButtonElement>("[data-roth-check]")!.addEventListener("click", () => {
        setRothCheckFlagged(!isRothCheckFlagged());
        draw();
      });
    };
    draw();
  },
};
