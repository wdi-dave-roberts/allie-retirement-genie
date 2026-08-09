/**
 * Chapter 3 — Free Money. The employer match as a declined raise, the
 * compounded value of just the match, and the "I'm in" Enrollment moment.
 * Math comes from src/lib/projection.ts only.
 */

import { genieSVG } from "../genie/genie";
import { lineChart } from "../lib/chart";
import { isEnrolled, setEnrolled } from "../lib/enrollment";
import { formatMoney } from "../lib/format";
import { loadProfile, type Profile } from "../lib/profile";
import { contributionMonthly, employerMatchMonthly, futureValueOfStream } from "../lib/projection";
import type { QuizSpec } from "../lib/quiz";
import { noteRef } from "../notes/genie-note";

const START_AGE = 32;
const RETIRE_AGE = 65;
/** App-wide default contribution used when there's no match to anchor to. */
const DEFAULT_CONTRIBUTION_PERCENT = 6;
/** Slider starts short of full match so the gap is visible on arrival. */
export const FORFEIT_DEFAULT_PERCENT = 3;

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

export interface ForfeitData {
  /** Match dollars per year she actually collects at this contribution. */
  capturedAnnual: number;
  /** Match dollars per year left with the employer. */
  forfeitedAnnual: number;
  /** The forfeited match stream, compounded to 65 in Real Dollars. */
  forfeitedCompounded: number;
  /** [age, balance] per year for the full-match line. */
  fullPoints: Array<[number, number]>;
  /** [age, balance] per year for her slider setting. */
  capturedPoints: Array<[number, number]>;
}

/**
 * What contributing below the full match costs (WHI-109). Same dollar-for-dollar
 * model as the rest of the chapter: her contribution is matched up to
 * `matchPercent`, so anything short of that is match she simply doesn't collect.
 */
export function forfeitData(profile: Profile, contributionPercent: number): ForfeitData {
  const fullMonthly = employerMatchMonthly(
    profile.salary,
    profile.matchPercent,
    profile.matchPercent,
  );
  const capturedMonthly = employerMatchMonthly(
    profile.salary,
    contributionPercent,
    profile.matchPercent,
  );
  const forfeitedMonthly = fullMonthly - capturedMonthly;

  const fullPoints: Array<[number, number]> = [];
  const capturedPoints: Array<[number, number]> = [];
  for (let age = START_AGE; age <= RETIRE_AGE; age++) {
    const months = (age - START_AGE) * 12;
    fullPoints.push([age, futureValueOfStream(fullMonthly, months)]);
    capturedPoints.push([age, futureValueOfStream(capturedMonthly, months)]);
  }

  return {
    capturedAnnual: capturedMonthly * 12,
    forfeitedAnnual: forfeitedMonthly * 12,
    forfeitedCompounded: futureValueOfStream(forfeitedMonthly, (RETIRE_AGE - START_AGE) * 12),
    fullPoints,
    capturedPoints,
  };
}

/** Whole dollars with thousands separators — the raise should feel exact. */
export function formatExact(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function confetti(host: HTMLElement): void {
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

/** Chapter 3 Quiz (WHI-96) — the yearly match figure is hers; a no-match plan gets concept questions instead. */
export function quizCh3(profile: Profile): QuizSpec {
  if (profile.matchPercent <= 0) {
    return {
      id: "ch3",
      questions: [
        {
          prompt: "Your plan has no match — yet the 401k is still the first bucket because…",
          choices: [
            "It guarantees a fixed return",
            "Money goes in before federal tax and compounds untouched for decades",
            "It's insured against market losses",
          ],
          correctIndex: 1,
          explain: "Pre-tax going in, decades of compounding — no match required.",
          sectionRef: { chapter: 2, anchor: "sec-match" },
        },
        {
          prompt: "An employer match, where plans offer one, is…",
          choices: [
            "Free money added when you contribute",
            "A loan you repay at retirement",
            "A fee for managing the account",
          ],
          correctIndex: 0,
          explain: "Extra pay that only shows up when you put money in — which is why Chapter 7 has you confirm your plan's real formula.",
          sectionRef: { chapter: 2, anchor: "sec-match" },
        },
        {
          prompt: "How much match can anyone collect without enrolling?",
          choices: ["The standard 6%", "Half the usual amount", "Zero — unenrolled means unmatched"],
          correctIndex: 2,
          explain: "Every match everywhere requires your dollars first.",
          sectionRef: { chapter: 2, anchor: "sec-match" },
        },
      ],
    };
  }

  const data = freeMoneyData(profile);
  return {
    id: "ch3",
    questions: [
      {
        prompt: "At full capture, what's the match worth to you per year?",
        choices: [
          formatExact(data.matchMonthly), // mistaking the monthly figure for the annual one
          formatExact(data.annualMatch * 2),
          formatExact(data.annualMatch),
        ],
        correctIndex: 2,
        explain: `100% of what you put in, up to ${profile.matchPercent}% of salary — ${formatExact(data.annualMatch)} of free money a year.`,
        sectionRef: { chapter: 2, anchor: "sec-match" },
      },
      {
        prompt: "Staying unenrolled while that match is on the table is like…",
        choices: [
          "Declining a raise on purpose",
          "Dodging a tax bill",
          "Avoiding stock-market risk",
        ],
        correctIndex: 0,
        explain: "The match is pay you only collect by contributing.",
        sectionRef: { chapter: 2, anchor: "sec-match" },
      },
      {
        prompt: "A dollar you contribute inside the match does what the moment it arrives?",
        choices: [
          "Waits for the market to open",
          "Doubles instantly — 100% return before any growth",
          "Gets taxed as a bonus",
        ],
        correctIndex: 1,
        explain: "Dollar-for-dollar match: yours plus theirs, on day one.",
        sectionRef: { chapter: 2, anchor: "sec-double" },
      },
    ],
  };
}

export const chapter3 = {
  id: "free-money",
  title: "Free Money",
  quiz: (): QuizSpec => quizCh3(loadProfile()),
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
    const noMatch = profile.matchPercent <= 0;
    // Survives the enroll re-render below, so a toggle doesn't reset her drag.
    let forfeitPercent = Math.min(FORFEIT_DEFAULT_PERCENT, profile.matchPercent);
    // No match to compound? Show her own default 6% instead — still worth the chapter.
    const ownCompounded = futureValueOfStream(
      contributionMonthly(profile.salary, DEFAULT_CONTRIBUTION_PERCENT),
      (RETIRE_AGE - START_AGE) * 12,
    );

    const matchBody = `
        <div class="speech" id="sec-match"><p>Your ${noteRef("ch3-employer-match", "employer matches")} what you put in, up to ${profile.matchPercent}% of your salary. If your plan matches dollar-for-dollar — most do — being unenrolled means declining a <strong>${formatExact(data.annualMatch)}-a-year raise</strong>. On purpose. For no reason. (You'll confirm your plan's exact formula in Chapter 7 — it's on the checklist.)</p></div>
        <div class="reveal">
          <p class="reveal__number" data-reveal>${formatMoney(data.compounded)}</p>
          <p>That's just the match — nothing of yours — compounded to 65, in today's dollars.</p>
        </div>
        <div class="speech" id="sec-double"><p>And here's the part banks dream about: at a dollar-for-dollar match, every dollar you put in up to ${profile.matchPercent}% <strong>doubles the moment it arrives</strong>. 100% return before the market even wakes up.</p></div>
        <div class="speech" id="sec-forfeit"><p>Don't take my word for it. Slide it — this is you putting in less than ${profile.matchPercent}%, and me holding up the part you'd never see.</p></div>
        <div class="lever">
          <label>You put in <strong data-forfeit-pct></strong>
            <input type="range" min="0" max="${profile.matchPercent}" step="1" value="${forfeitPercent}" data-forfeit aria-label="Your contribution percent" /></label>
        </div>
        <p data-forfeit-line></p>
        <figure class="curve">
          <div data-forfeit-chart></div>
          <figcaption class="curve__legend">
            <span class="curve__key curve__key--now">full ${profile.matchPercent}% match</span>
            <span class="curve__key curve__key--later">your setting</span>
          </figcaption>
        </figure>
        <div class="reveal reveal--instant">
          <p class="reveal__number" data-forfeit-reveal></p>
          <p data-forfeit-caption></p>
        </div>`;

    const noMatchBody = `
        <div class="speech" id="sec-match"><p>Your profile says no ${noteRef("ch3-employer-match", "employer match")}. Rare, but it happens — and it changes nothing about the move. The 401k is still your best first bucket: your money goes in before federal tax (Chapter 4 shows that trick), and it compounds untouched for 33 years.</p></div>
        <div class="reveal">
          <p class="reveal__number" data-reveal>${formatMoney(ownCompounded)}</p>
          <p>That's your own ${DEFAULT_CONTRIBUTION_PERCENT}%, compounded to 65, in today's dollars — no match required.</p>
        </div>`;

    const drawForfeit = (): void => {
      const slider = root.querySelector<HTMLInputElement>("[data-forfeit]");
      if (!slider) return; // no-match plans skip the whole beat
      slider.value = String(forfeitPercent);
      const f = forfeitData(profile, forfeitPercent);
      const full = forfeitPercent >= profile.matchPercent;

      root.querySelector("[data-forfeit-pct]")!.textContent = `${forfeitPercent}%`;
      root.querySelector("[data-forfeit-line]")!.innerHTML = full
        ? `At ${profile.matchPercent}% they hand you <strong>${formatExact(f.capturedAnnual)}</strong> a year — every dollar they'll give. Nothing stays on their side of the table.`
        : `At ${forfeitPercent}%, your employer hands you <strong>${formatExact(f.capturedAnnual)}</strong> a year — and keeps the <strong>${formatExact(f.forfeitedAnnual)}</strong> you didn't claim.`;
      root.querySelector("[data-forfeit-chart]")!.innerHTML = lineChart({
        series: [
          { points: f.capturedPoints, className: "curve__line curve__line--later" },
          { points: f.fullPoints, className: "curve__line curve__line--now" },
        ],
        label: `Match dollars compounded to ${RETIRE_AGE}: full ${profile.matchPercent}% capture reaches ${formatMoney(data.compounded)}, contributing ${forfeitPercent}% reaches ${formatMoney(data.compounded - f.forfeitedCompounded)}`,
        xLabels: [
          { x: START_AGE, text: String(START_AGE) },
          { x: Math.round((START_AGE + RETIRE_AGE) / 2), text: String(Math.round((START_AGE + RETIRE_AGE) / 2)) },
          { x: RETIRE_AGE, text: String(RETIRE_AGE) },
        ],
      });
      root.querySelector("[data-forfeit-reveal]")!.textContent = formatMoney(f.forfeitedCompounded);
      root.querySelector("[data-forfeit-caption]")!.textContent = full
        ? "left on the table. Leave the slider right there and that stays true."
        : `left on the table by ${RETIRE_AGE} — in today's dollars. That's the gap between the two lines, and it's theirs to keep.`;
    };

    const draw = (): void => {
      const enrolled = isEnrolled();
      root.innerHTML = `
        <div class="chapter__genie">${genieSVG(enrolled ? "celebrate" : "point")}</div>
        <p class="chapter__kicker">Chapter 3</p>
        <h2 class="chapter__title">Free Money</h2>
        ${noMatch ? noMatchBody : matchBody}
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
      root.querySelector<HTMLInputElement>("[data-forfeit]")?.addEventListener("input", (e) => {
        forfeitPercent = Number((e.target as HTMLInputElement).value);
        drawForfeit();
      });
      drawForfeit();
    };

    draw();
  },
};
