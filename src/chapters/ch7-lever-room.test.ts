import { describe, expect, it } from "vitest";
import {
  contributionMonthly,
  employerMatchMonthly,
  futureValueLumpSum,
  futureValueOfStream,
} from "../lib/projection";
import { CURRENT_AGE, leverProjection } from "./ch7-lever-room";

const PROFILE = { salary: 65000, monthlySpend: 3200, currentSavings: 4000, matchPercent: 6 };

describe("leverProjection", () => {
  it("with zero raises equals the closed-form projection-lib output", () => {
    const levers = { contributionPercent: 6, retireAge: 65, raisePercent: 0 };
    const months = (65 - CURRENT_AGE) * 12;
    const monthly = contributionMonthly(65000, 6) + employerMatchMonthly(65000, 6, 6);
    const expected = futureValueLumpSum(4000, months) + futureValueOfStream(monthly, months);
    expect(leverProjection(PROFILE, levers).balance).toBeCloseTo(expected, 4);
  });

  it("matches brute-force month-by-month accumulation with raises", () => {
    const levers = { contributionPercent: 10, retireAge: 60, raisePercent: 3 };
    const r = 0.07 / 12;
    let balance = 4000;
    let salary = 65000;
    for (let y = 0; y < 60 - CURRENT_AGE; y++) {
      const monthly =
        contributionMonthly(salary, 10) + employerMatchMonthly(salary, 10, 6);
      for (let m = 0; m < 12; m++) balance = balance * (1 + r) + monthly;
      salary *= 1.03;
    }
    expect(leverProjection(PROFILE, levers).balance).toBeCloseTo(balance, 4);
  });

  it("every lever moves the balance the right direction", () => {
    const base = leverProjection(PROFILE, { contributionPercent: 6, retireAge: 65, raisePercent: 2 });
    expect(
      leverProjection(PROFILE, { contributionPercent: 10, retireAge: 65, raisePercent: 2 }).balance,
    ).toBeGreaterThan(base.balance);
    expect(
      leverProjection(PROFILE, { contributionPercent: 6, retireAge: 70, raisePercent: 2 }).balance,
    ).toBeGreaterThan(base.balance);
    expect(
      leverProjection(PROFILE, { contributionPercent: 6, retireAge: 65, raisePercent: 4 }).balance,
    ).toBeGreaterThan(base.balance);
    expect(
      leverProjection(PROFILE, { contributionPercent: 6, retireAge: 55, raisePercent: 2 }).balance,
    ).toBeLessThan(base.balance);
  });

  it("points run from age 32 to retireAge, starting at current savings", () => {
    const { points } = leverProjection(PROFILE, { contributionPercent: 6, retireAge: 58, raisePercent: 1 });
    expect(points[0]).toEqual([32, 4000]);
    expect(points[points.length - 1]![0]).toBe(58);
    expect(points).toHaveLength(58 - 32 + 1);
  });
});
