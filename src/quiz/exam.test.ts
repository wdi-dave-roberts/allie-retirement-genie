import { describe, expect, it } from "vitest";
import { curveData } from "../chapters/ch2-the-curve";
import { formatExact, freeMoneyData } from "../chapters/ch3-free-money";
import { formatMoney } from "../lib/format";
import type { Profile } from "../lib/profile";
import { paycheck } from "../lib/tax2026";
import { finalExam } from "./exam";

const PROFILE: Profile = { salary: 52_000, monthlySpend: 2_600, currentSavings: 1_800, matchPercent: 6 };

describe("finalExam", () => {
  it("is 10 well-formed questions spanning all seven chapters", () => {
    const exam = finalExam(PROFILE);
    expect(exam.id).toBe("final");
    expect(exam.questions).toHaveLength(10);
    for (const q of exam.questions) {
      expect(new Set(q.choices).size).toBe(q.choices.length); // no duplicate choices
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.choices.length);
      expect(q.explain.length).toBeGreaterThan(0);
      expect(q.sectionRef.anchor).toMatch(/^sec-/);
    }
    // Every chapter contributes at least one question.
    const chapters = new Set(exam.questions.map((q) => q.sectionRef.chapter));
    expect(chapters).toEqual(new Set([0, 1, 2, 3, 4, 5, 6]));
  });

  it("computes the three applied answers from her numbers", () => {
    const exam = finalExam(PROFILE);
    const [match, waiting, takeHome] = exam.questions.slice(7);

    expect(match!.choices[match!.correctIndex]).toBe(formatExact(freeMoneyData(PROFILE).annualMatch));
    expect(match!.choices[match!.correctIndex]).toBe("$3,120"); // journey profile — drift alarm

    expect(waiting!.choices[waiting!.correctIndex]).toBe(formatMoney(curveData(PROFILE).gap));
    expect(waiting!.choices[waiting!.correctIndex]).toBe("$448K");

    const contribution = PROFILE.salary * 0.06;
    const monthlyCost =
      (paycheck(PROFILE.salary).net - paycheck(PROFILE.salary, contribution).net) / 12;
    expect(takeHome!.choices[takeHome!.correctIndex]).toBe(formatExact(monthlyCost));
    expect(takeHome!.choices[takeHome!.correctIndex]).toBe("$229");
  });

  it("swaps the match question to a concept one when there is no match", () => {
    const exam = finalExam({ ...PROFILE, matchPercent: 0 });
    expect(exam.questions).toHaveLength(10);
    const match = exam.questions[7]!;
    expect(match.choices.join(" ")).not.toMatch(/\$\d/); // no fake dollar figures
    expect(match.choices[match.correctIndex]).toBe("Zero — unenrolled means unmatched");
  });
});
