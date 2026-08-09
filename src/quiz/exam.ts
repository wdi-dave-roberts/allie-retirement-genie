/**
 * Final Exam (WHI-98) — 10 questions spanning all seven Chapters: the biggest
 * idea from each, plus three applied ones computed from her Profile (match
 * value, cost of waiting, take-home cost of 6%). Same engine and 3-Try /
 * Answer Key rules as a Chapter Quiz; rendering stays in quiz-ui.ts.
 */

import { curveData } from "../chapters/ch2-the-curve";
import { formatExact, freeMoneyData } from "../chapters/ch3-free-money";
import { formatMoney } from "../lib/format";
import type { Profile } from "../lib/profile";
import type { QuizQuestion, QuizSpec } from "../lib/quiz";
import { paycheck } from "../lib/tax2026";
import { uniqueDistractors } from "./choices";

const CONTRIBUTION_PERCENT = 6;

/** Applied match question — concept fallback for no-match plans (per quizCh3). */
function matchQuestion(profile: Profile): QuizQuestion {
  if (profile.matchPercent <= 0) {
    return {
      prompt: "How much employer match can anyone collect without enrolling?",
      choices: ["The standard 6%", "Half the usual amount", "Zero — unenrolled means unmatched"],
      correctIndex: 2,
      explain: "Every match everywhere requires your dollars first.",
      sectionRef: { chapter: 2, anchor: "sec-match" },
    };
  }
  const data = freeMoneyData(profile);
  const annual = formatExact(data.annualMatch);
  const distractors = uniqueDistractors(annual, [
    formatExact(data.matchMonthly), // the monthly figure posing as annual
    formatExact(data.annualMatch * 2),
    formatExact(data.annualMatch / 2),
  ]);
  return {
    prompt: "Your match, fully captured: how much free money lands per year?",
    choices: [distractors[0]!, annual, distractors[1]!],
    correctIndex: 1,
    explain: `100% of yours up to ${profile.matchPercent}% of salary — ${annual} a year for showing up enrolled.`,
    sectionRef: { chapter: 2, anchor: "sec-match" },
  };
}

export function finalExam(profile: Profile): QuizSpec {
  const curve = curveData(profile);
  const gap = formatMoney(curve.gap);
  const gapDistractors = uniqueDistractors(gap, [
    formatMoney(curve.now), // the whole balance posing as the cost
    formatMoney(curve.monthly * 12 * 10), // "waiting only skips the deposits"
    formatMoney(curve.gap / 2),
    formatMoney(curve.gap * 2),
  ]);
  const contribution = (profile.salary * CONTRIBUTION_PERCENT) / 100;
  const monthlyCost =
    (paycheck(profile.salary).net - paycheck(profile.salary, contribution).net) / 12;
  const cost = formatExact(monthlyCost);
  const costDistractors = uniqueDistractors(cost, [
    formatExact(contribution / 12), // the myth: 6% must cost 6%
    formatExact(monthlyCost * 2),
    formatExact(monthlyCost * 3),
  ]);

  return {
    id: "final",
    copy: {
      title: "The Final Exam",
      ariaLabel: "Final Exam",
      lead: "Ten questions, seven chapters, one lamp.",
      win: "Nailed it — the whole journey, aced.",
    },
    questions: [
      {
        prompt: "Rule one, since the very first screen: where do your four numbers live?",
        choices: [
          "On this phone — and nowhere else",
          "Backed up to the Genie's cloud",
          "With your 401k provider",
        ],
        correctIndex: 0,
        explain: "No account, no cloud, nobody else — not even me, and I live here.",
        sectionRef: { chapter: 0, anchor: "sec-privacy" },
      },
      {
        prompt: "The engine under every chart I've shown you?",
        choices: [
          "Growth earning growth on top of itself",
          "Steady annual raises",
          "Picking the right hot stock",
        ],
        correctIndex: 0,
        explain: "Compounding — each year's growth starts earning growth of its own. That's the whole magic.",
        sectionRef: { chapter: 1, anchor: "sec-growth" },
      },
      {
        prompt: "Chapter 3, one sentence: an unclaimed employer match is…",
        choices: [
          "A bonus you get eventually anyway",
          "A raise you're declining on purpose",
          "A tax problem",
        ],
        correctIndex: 1,
        explain: "The match is pay — it just waits for your dollars to show up first.",
        sectionRef: { chapter: 2, anchor: "sec-match" },
      },
      {
        prompt: '"My raise bumped my bracket, so my paycheck shrank." That sentence is…',
        choices: [
          "True — brackets punish raises",
          "Sometimes true near the line",
          "Never true — only the top-bucket dollars pay the new rate",
        ],
        correctIndex: 2,
        explain: "Whoever told you that owes you a coffee — dollars below the line never re-price.",
        sectionRef: { chapter: 3, anchor: "sec-bracket-myth" },
      },
      {
        prompt: "Roth vs Traditional. The one real difference?",
        choices: [
          "When the tax collector says hello",
          "How the money is invested",
          "Whether the match applies",
        ],
        correctIndex: 0,
        explain: "Same dollar, same growth — taxed now (Roth) or taxed at withdrawal (Traditional). Nothing else changes.",
        sectionRef: { chapter: 4, anchor: "sec-difference" },
      },
      {
        prompt: "Some year your balance drops 20%. The winning move?",
        choices: [
          "Sell before it gets worse",
          "Move everything to checking",
          "Nothing — it's expected, and selling on the way down is the only losing move",
        ],
        correctIndex: 2,
        explain: "The drop is already baked into every number I've shown you. It's the price of the magic.",
        sectionRef: { chapter: 5, anchor: "sec-drop" },
      },
      {
        prompt: "Three levers in the Lever Room — the one that swings your future hardest is the one…",
        choices: [
          "You fully control: your contribution percent",
          "The market controls: returns",
          "Your boss controls: raises",
        ],
        correctIndex: 0,
        explain: "Raises help and time helps, but what you put in is the engine.",
        sectionRef: { chapter: 6, anchor: "sec-levers" },
      },
      matchQuestion(profile),
      {
        prompt: "Your own curve: waiting ten years to start costs you, in today's dollars…",
        choices: [gapDistractors[0]!, gapDistractors[1]!, gap],
        correctIndex: 2,
        explain: "Not just the skipped deposits — all the growth those deposits never got to earn.",
        sectionRef: { chapter: 1, anchor: "sec-cost-of-waiting" },
      },
      {
        prompt: "Contributing 6% of your salary pre-tax shrinks your monthly take-home by about…",
        choices: [costDistractors[0]!, cost, costDistractors[1]!],
        correctIndex: 1,
        explain: "It leaves before federal tax — the paycheck drops by less than what lands in the account.",
        sectionRef: { chapter: 3, anchor: "sec-pretax" },
      },
    ],
  };
}
