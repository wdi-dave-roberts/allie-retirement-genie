import { describe, expect, it } from "vitest";
import {
  contributionMonthly,
  employerMatchMonthly,
  futureValueLumpSum,
  futureValueOfStream,
  projectBalance,
} from "./projection";

describe("futureValueOfStream", () => {
  it("matches the textbook known value: $100/mo at 1% monthly for 12 months = $1,268.25", () => {
    expect(futureValueOfStream(100, 12, 0.01)).toBeCloseTo(1268.25, 2);
  });

  it("matches brute-force month-by-month accumulation at the default rate", () => {
    const monthly = 250;
    const months = 120;
    let balance = 0;
    for (let m = 0; m < months; m++) {
      balance = balance * (1 + 0.07 / 12) + monthly;
    }
    expect(futureValueOfStream(monthly, months)).toBeCloseTo(balance, 6);
  });

  it("degrades to simple accumulation at 0% rate", () => {
    expect(futureValueOfStream(100, 24, 0)).toBe(2400);
  });
});

describe("futureValueLumpSum", () => {
  it("matches the known value: $1,000 at 1% monthly for 12 months = $1,126.83", () => {
    expect(futureValueLumpSum(1000, 12, 0.01)).toBeCloseTo(1126.83, 2);
  });

  it("returns the principal for 0 months", () => {
    expect(futureValueLumpSum(5000, 0)).toBe(5000);
  });
});

describe("employerMatchMonthly", () => {
  it("matches 100% of contribution up to the match cap", () => {
    // $60k salary, contributing 4%, 6% match → employer matches the full 4%
    expect(employerMatchMonthly(60000, 4)).toBeCloseTo(200, 6);
  });

  it("caps at matchPercent when contributing above it", () => {
    // Contributing 10% against a 6% match → employer adds 6% of salary
    expect(employerMatchMonthly(60000, 10)).toBeCloseTo(300, 6);
  });

  it("is zero when unenrolled", () => {
    expect(employerMatchMonthly(60000, 0)).toBe(0);
  });

  it("never goes negative on bad input", () => {
    expect(employerMatchMonthly(60000, -5)).toBe(0);
  });
});

describe("projectBalance", () => {
  it("sums lump-sum growth and both contribution streams", () => {
    const months = 12 * 33; // age 32 → 65
    const expected =
      futureValueLumpSum(10000, months) +
      futureValueOfStream(contributionMonthly(60000, 6) + employerMatchMonthly(60000, 6), months);
    expect(
      projectBalance({
        currentSavings: 10000,
        annualSalary: 60000,
        contributionPercent: 6,
        months,
      }),
    ).toBeCloseTo(expected, 6);
  });
});
