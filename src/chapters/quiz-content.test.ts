import { describe, expect, it } from "vitest";
import { formatMoney } from "../lib/format";
import type { Profile } from "../lib/profile";
import { paycheck } from "../lib/tax2026";
import { uniqueDistractors } from "../quiz/choices";
import { contributionMonthly, employerMatchMonthly } from "../lib/projection";
import { quizCh1 } from "./ch1-meet-the-genie";
import { curveData, quizCh2 } from "./ch2-the-curve";
import { formatExact, freeMoneyData, quizCh3 } from "./ch3-free-money";
import { quizCh4 } from "./ch4-paycheck";
import { quizCh5 } from "./ch5-roth";
import { emergencyTarget, formatRange, quizCh6 } from "./ch6-where-money-lives";
import { quizCh7 } from "./ch7-lever-room";

const PROFILE: Profile = { salary: 52_000, monthlySpend: 2_600, currentSavings: 1_800, matchPercent: 6 };

function expectWellFormed(quiz: { id: string; questions: ReturnType<typeof quizCh1>["questions"] }): void {
  expect(quiz.questions).toHaveLength(3);
  for (const q of quiz.questions) {
    expect(new Set(q.choices).size).toBe(q.choices.length); // no duplicate choices
    expect(q.correctIndex).toBeGreaterThanOrEqual(0);
    expect(q.correctIndex).toBeLessThan(q.choices.length);
    expect(q.explain.length).toBeGreaterThan(0);
    expect(q.sectionRef.anchor).toMatch(/^sec-/);
  }
}

describe("uniqueDistractors", () => {
  it("skips collisions with the correct answer and duplicates", () => {
    expect(uniqueDistractors("$50", ["$50", "$100", "$100", "$150"])).toEqual(["$100", "$150"]);
  });
});

describe("quizCh1", () => {
  it("is well-formed and points at Chapter 1 anchors", () => {
    const quiz = quizCh1();
    expectWellFormed(quiz);
    expect(quiz.id).toBe("ch1");
    for (const q of quiz.questions) expect(q.sectionRef.chapter).toBe(0);
  });
});

describe("quizCh2", () => {
  it("uses her cost-of-waiting figure as the right answer", () => {
    const quiz = quizCh2(PROFILE);
    expectWellFormed(quiz);
    const q = quiz.questions[1]!;
    expect(q.choices[q.correctIndex]).toBe(formatMoney(curveData(PROFILE).gap));
    expect(q.choices[q.correctIndex]).toBe("$448K"); // journey profile — drift alarm
  });
});

describe("quizCh3", () => {
  it("uses her annual match figure as the right answer", () => {
    const quiz = quizCh3(PROFILE);
    expectWellFormed(quiz);
    const q = quiz.questions[0]!;
    expect(q.choices[q.correctIndex]).toBe(formatExact(freeMoneyData(PROFILE).annualMatch));
    expect(q.choices[q.correctIndex]).toBe("$3,120");
  });

  it("swaps to concept questions when there is no match", () => {
    const quiz = quizCh3({ ...PROFILE, matchPercent: 0 });
    expectWellFormed(quiz);
    for (const q of quiz.questions) {
      expect(q.choices.join(" ")).not.toMatch(/\$\d/); // no fake dollar figures
      expect(q.sectionRef.anchor).toBe("sec-match"); // the only anchor the no-match body renders
    }
  });
});

describe("quizCh4", () => {
  it("uses the real pre-tax monthly cost, with the naive 6%/12 as a distractor", () => {
    const quiz = quizCh4(PROFILE);
    expectWellFormed(quiz);
    const q = quiz.questions[2]!;
    const contribution = PROFILE.salary * 0.06;
    const monthlyCost = (paycheck(PROFILE.salary).net - paycheck(PROFILE.salary, contribution).net) / 12;
    expect(q.choices[q.correctIndex]).toBe(formatExact(monthlyCost));
    expect(q.choices[q.correctIndex]).toBe("$229"); // journey profile — drift alarm
    expect(q.choices).toContain(formatExact(contribution / 12)); // "$260", the myth
  });

  it("keeps choices unique even when zero tax makes naive and real costs equal", () => {
    const quiz = quizCh4({ ...PROFILE, salary: 12_000 });
    expectWellFormed(quiz);
  });
});

describe("quizCh5", () => {
  it("is well-formed and points at Chapter 5 anchors", () => {
    const quiz = quizCh5();
    expectWellFormed(quiz);
    expect(quiz.id).toBe("ch5");
    for (const q of quiz.questions) expect(q.sectionRef.chapter).toBe(4);
  });
});

describe("quizCh6", () => {
  it("uses her 3-6× emergency range, exactly as the chapter prints it", () => {
    const quiz = quizCh6(PROFILE);
    expectWellFormed(quiz);
    const q = quiz.questions[0]!;
    const [low, high] = emergencyTarget(PROFILE);
    expect(q.choices[q.correctIndex]).toBe(formatRange(low, high));
    expect(q.choices[q.correctIndex]).toBe("$7,800 – $15,600"); // journey profile — drift alarm
  });
});

describe("quizCh7", () => {
  it("uses her monthly all-in figure, with the match-forgotten total as a distractor", () => {
    const quiz = quizCh7(PROFILE, 6);
    expectWellFormed(quiz);
    const q = quiz.questions[1]!;
    const total =
      contributionMonthly(PROFILE.salary, 6) + employerMatchMonthly(PROFILE.salary, 6, 6);
    expect(q.choices[q.correctIndex]).toBe(formatExact(total));
    expect(q.choices[q.correctIndex]).toBe("$520"); // journey profile — drift alarm
    expect(q.choices).toContain(formatExact(contributionMonthly(PROFILE.salary, 6))); // "$260"
  });

  it("keeps choices unique when no match makes the naive total collide", () => {
    const quiz = quizCh7({ ...PROFILE, matchPercent: 0 }, 6);
    expectWellFormed(quiz);
  });
});
