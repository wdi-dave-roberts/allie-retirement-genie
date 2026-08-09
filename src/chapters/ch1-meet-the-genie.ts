/**
 * Chapter 1 — Meet the Genie. Narrative intro plus Profile intake as a
 * conversation: one question per screen, numbers stay in localStorage.
 * On revisit (Profile already saved) it becomes an edit screen, so changing
 * a number updates every downstream chapter's projections.
 */

import { genieSVG } from "../genie/genie";
import { loadProfile, saveProfile, type Profile } from "../lib/profile";
import { loadCurrent } from "../lib/progress";
import { isDone, loadQuizState, type QuizSpec } from "../lib/quiz";
import { renderQuiz } from "../quiz/quiz-ui";
import type { Chapter, ChapterContext } from "./index";

interface Question {
  key: keyof Profile;
  ask: string;
  hint: string;
  unit: "$" | "%";
}

export const QUESTIONS: Question[] = [
  {
    key: "salary",
    ask: "What do you make in a year, before taxes?",
    hint: "Ballpark is fine. I round to the nearest dream.",
    unit: "$",
  },
  {
    key: "monthlySpend",
    ask: "What goes out the door in a normal month?",
    hint: "Rent, tacos, the streaming service you forgot about.",
    unit: "$",
  },
  {
    key: "currentSavings",
    ask: "What have you saved so far, across everything?",
    hint: "Zero is an honest answer. We build from here.",
    unit: "$",
  },
  {
    key: "matchPercent",
    ask: "What percent of your salary does your employer match?",
    hint: "If you're not sure, leave it at 6 — that's your plan's number.",
    unit: "%",
  },
];

const RANGES: Record<keyof Profile, { min: number; max: number; tooHigh: string }> = {
  salary: {
    min: 1,
    max: 5_000_000,
    tooHigh: "If you make that much, you don't need a genie. Double-check it?",
  },
  monthlySpend: {
    min: 1,
    max: 100_000,
    tooHigh: "That's a lot of tacos per month. Double-check it?",
  },
  currentSavings: {
    min: 0,
    max: 10_000_000,
    tooHigh: "With savings like that, I should be asking you questions. Double-check it?",
  },
  matchPercent: {
    min: 0,
    max: 50,
    tooHigh: "No plan matches that much — I'd know, I'm magical. Try 0 to 50.",
  },
};

/** Parse a human-typed amount ("$65,000", "6%") into a number, or null. */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$%,\s]/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Genie-voiced validation. Returns an error message, or null when valid. */
export function validateField(key: keyof Profile, raw: string): string | null {
  const n = parseAmount(raw);
  if (n === null) return "A number, friend. I'm magic, not psychic.";
  const { min, max, tooHigh } = RANGES[key];
  if (n < 0) return "Negative? Let's keep the past in the past. Zero or more.";
  if (n < min) return "I need a number bigger than zero to work my magic.";
  if (n > max) return tooHigh;
  return null;
}

/** Gentle sanity nudge — informational, never blocking (WHI-94). */
export const SPEND_SANITY_NUDGE =
  "More goes out than comes in — typo, or a rough season? Either way, worth a double-check. No judgment; I live in a lamp.";

export function spendExceedsIncome(salary: number, monthlySpend: number): boolean {
  return salary > 0 && monthlySpend * 12 > salary;
}

const INTRO = [
  "Hi. I'm the Genie. I live in this lamp, and I know what you'll be worth in 2059.",
  "Most genies do three wishes. I do one, and it's a good one: I show you your own future — with your real numbers, not somebody's brochure.",
  "Seven chapters, about 25 minutes. First I need four numbers.",
];

const PRIVACY =
  "One rule before we start: your numbers stay on this phone. They never leave the lamp — no account, no cloud, nobody else. Not even me, and I live here.";

function isProfileComplete(p: Profile): boolean {
  return p.salary > 0 && p.monthlySpend > 0;
}

/** Chapter 1 Quiz (WHI-96) — privacy and what the four numbers drive. Static: it's about the rules, not her figures. */
export function quizCh1(): QuizSpec {
  const privacy = { chapter: 0, anchor: "sec-privacy" };
  return {
    id: "ch1",
    questions: [
      {
        prompt: "Where do your four numbers live?",
        choices: ["On this phone — and nowhere else", "In the Genie's cloud", "With your employer's HR system"],
        correctIndex: 0,
        explain: "No account, no cloud, nobody else — not even me, and I live here.",
        sectionRef: privacy,
      },
      {
        prompt: "What do those four numbers do?",
        choices: [
          "Qualify you for a credit card",
          "Drive every projection in the chapters ahead",
          "Get reported to the IRS",
        ],
        correctIndex: 1,
        explain: "Salary, spend, savings, match — every chart ahead is built from them.",
        sectionRef: { chapter: 0, anchor: "sec-four-numbers" },
      },
      {
        prompt: "Which of these do I actually know about you?",
        choices: ["Your name", "Your Social Security number", "Your monthly spending"],
        correctIndex: 2,
        explain: "Four numbers, zero identity — I can see your future and still couldn't pick you out of a lineup.",
        sectionRef: privacy,
      },
    ],
  };
}

/**
 * Mount the Chapter 1 Quiz with a gated finish button. Used by both the
 * intake's last step and the edit screen (a Section Link detour or reload
 * mid-quiz re-renders Chapter 1 as the edit screen, which must still offer
 * the way forward while the chapter is current).
 */
function mountQuiz(root: HTMLElement, ctx: ChapterContext): void {
  const spec = quizCh1();
  const finish = root.querySelector<HTMLButtonElement>("[data-finish]");
  const sync = (done: boolean): void => {
    if (finish) finish.hidden = !done;
  };
  sync(isDone(loadQuizState(spec.id, spec.questions.length), spec.questions));
  renderQuiz(root.querySelector<HTMLElement>("[data-quiz-slot]")!, spec, {
    onChange: sync,
    onSectionLink: (ref) => document.getElementById(ref.anchor)?.scrollIntoView({ block: "start" }),
  });
  finish?.addEventListener("click", () => ctx.complete());
}

const FOUR_NUMBERS_RECAP =
  "Those four numbers — salary, spend, savings, match — power every chart ahead.";

export function fieldHTML(q: Question, value: number, autofocus: boolean, verbatim = false): string {
  // Intake hides zero (empty = unanswered); edit mode shows stored values as-is.
  const shown = verbatim || value > 0 || q.key === "matchPercent" ? String(value) : "";
  return `
    <label class="field">
      <span class="field__unit">${q.unit}</span>
      <input name="${q.key}" inputmode="numeric" autocomplete="off"
        value="${shown}" ${autofocus ? "autofocus" : ""} />
    </label>
    <p class="field__error" data-error hidden></p>
  `;
}

function renderIntake(root: HTMLElement, ctx: ChapterContext): void {
  let step = 0; // 0 = intro, 1..QUESTIONS.length = questions, then privacy
  const draft = loadProfile();

  const show = (): void => {
    if (step === 0) {
      root.innerHTML = `
        <div class="chapter__genie">${genieSVG("celebrate")}</div>
        <p class="chapter__kicker">Chapter 1</p>
        <h2 class="chapter__title">Meet the Genie</h2>
        ${INTRO.map((line) => `<div class="speech"><p>${line}</p></div>`).join("")}
        <button class="btn btn--primary" data-next>Let's do it</button>
      `;
      root.querySelector("[data-next]")!.addEventListener("click", () => {
        step = 1;
        show();
      });
      return;
    }

    if (step <= QUESTIONS.length) {
      const q = QUESTIONS[step - 1]!;
      root.innerHTML = `
        <div class="chapter__genie">${genieSVG("point")}</div>
        <p class="chapter__kicker">Question ${step} of ${QUESTIONS.length}</p>
        <div class="speech"><p>${q.ask}</p></div>
        <form data-question>
          ${fieldHTML(q, draft[q.key], true)}
          <p class="dim">${q.hint}</p>
          <p class="dim" data-sanity hidden>${SPEND_SANITY_NUDGE}</p>
          <button class="btn btn--primary" type="submit">That's my number</button>
        </form>
      `;
      const form = root.querySelector<HTMLFormElement>("[data-question]")!;
      if (q.key === "monthlySpend") {
        const input = form.querySelector<HTMLInputElement>("input")!;
        const sanity = form.querySelector<HTMLElement>("[data-sanity]")!;
        input.addEventListener("input", () => {
          const n = parseAmount(input.value);
          sanity.hidden = !(n !== null && spendExceedsIncome(draft.salary, n));
        });
      }
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector<HTMLInputElement>("input")!;
        const error = validateField(q.key, input.value);
        const errorEl = form.querySelector<HTMLElement>("[data-error]")!;
        if (error) {
          errorEl.textContent = error;
          errorEl.hidden = false;
          return;
        }
        draft[q.key] = parseAmount(input.value)!;
        step += 1;
        show();
      });
      return;
    }

    // Privacy + quiz + finish. Save before the quiz: a Section Link detour
    // re-renders Chapter 1, and saved numbers keep the intake from restarting.
    saveProfile(draft);
    root.innerHTML = `
      <div class="chapter__genie">${genieSVG("idle")}</div>
      <p class="chapter__kicker">One more thing</p>
      <div class="speech" id="sec-privacy"><p>${PRIVACY}</p></div>
      <p class="dim" id="sec-four-numbers">${FOUR_NUMBERS_RECAP}</p>
      <div data-quiz-slot></div>
      <button class="btn btn--primary" data-finish hidden>Show me my future</button>
    `;
    mountQuiz(root, ctx);
  };

  show();
}

function renderEdit(root: HTMLElement, ctx: ChapterContext): void {
  const profile = loadProfile();
  // Reload or Section Link detour mid-quiz lands here while the chapter is
  // still current — keep offering the quiz-gated way forward.
  const stillCurrent = loadCurrent() === 0;
  root.innerHTML = `
    <div class="chapter__genie">${genieSVG("idle")}</div>
    <p class="chapter__kicker">Chapter 1</p>
    <h2 class="chapter__title">Your numbers</h2>
    <div class="speech" id="sec-four-numbers"><p>Life changes, numbers change. Edit away — every chapter ahead updates instantly. ${FOUR_NUMBERS_RECAP}</p></div>
    <form data-edit>
      ${QUESTIONS.map(
        (q) => `
        <p class="dim">${q.ask}</p>
        ${fieldHTML(q, profile[q.key], false, true)}
      `,
      ).join("")}
      <p class="dim" data-sanity hidden>${SPEND_SANITY_NUDGE}</p>
      <button class="btn btn--primary" type="submit">Update my future</button>
      <p class="dim" data-saved hidden>Done. The future noticed.</p>
    </form>
    <p class="dim" id="sec-privacy">House rule, always: your numbers stay on this phone — no account, no cloud, nobody else.</p>
    <div data-quiz-slot></div>
    ${stillCurrent ? `<button class="btn btn--primary" data-finish hidden>Show me my future</button>` : ""}
  `;
  mountQuiz(root, ctx);
  const form = root.querySelector<HTMLFormElement>("[data-edit]")!;
  {
    const inputs = [...form.querySelectorAll<HTMLInputElement>("input")];
    const sanity = form.querySelector<HTMLElement>("[data-sanity]")!;
    const check = (): void => {
      const salary = parseAmount(inputs[0]!.value) ?? 0;
      const spend = parseAmount(inputs[1]!.value) ?? 0;
      sanity.hidden = !spendExceedsIncome(salary, spend);
    };
    for (const input of inputs) input.addEventListener("input", check);
    check(); // stored profile may already trip it
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll<HTMLInputElement>("input")];
    const errors = form.querySelectorAll<HTMLElement>("[data-error]");
    let valid = true;
    const next = { ...profile };
    inputs.forEach((input, i) => {
      const q = QUESTIONS[i]!;
      const error = validateField(q.key, input.value);
      const errorEl = errors[i]!;
      errorEl.textContent = error ?? "";
      errorEl.hidden = !error;
      if (error) valid = false;
      else next[q.key] = parseAmount(input.value)!;
    });
    if (!valid) return;
    saveProfile(next);
    form.querySelector<HTMLElement>("[data-saved]")!.hidden = false;
  });
}

export const chapter1: Chapter = {
  id: "meet-the-genie",
  title: "Meet the Genie",
  selfPaced: true,
  render(root, ctx) {
    if (isProfileComplete(loadProfile())) renderEdit(root, ctx);
    else renderIntake(root, ctx);
  },
};
