import { describe, expect, it } from "vitest";
import { employerMatchMonthly, futureValueOfStream } from "../lib/projection";
import { formatExact, freeMoneyData } from "./ch3-free-money";

const PROFILE = { salary: 65000, monthlySpend: 3200, currentSavings: 4000, matchPercent: 6 };

describe("freeMoneyData", () => {
  it("annual match is the declined raise: salary × matchPercent", () => {
    const data = freeMoneyData(PROFILE);
    expect(data.annualMatch).toBeCloseTo(65000 * 0.06, 6);
  });

  it("compounded Reveal matches projection-lib output for the match stream to 65", () => {
    const monthly = employerMatchMonthly(65000, 6, 6);
    const expected = futureValueOfStream(monthly, (65 - 32) * 12);
    const data = freeMoneyData(PROFILE);
    expect(data.matchMonthly).toBeCloseTo(monthly, 6);
    expect(data.compounded).toBeCloseTo(expected, 6);
  });

  it("updates when the Profile changes", () => {
    const base = freeMoneyData(PROFILE);
    expect(freeMoneyData({ ...PROFILE, salary: 130000 }).compounded).toBeCloseTo(
      base.compounded * 2,
      6,
    );
    expect(freeMoneyData({ ...PROFILE, matchPercent: 3 }).annualMatch).toBeCloseTo(
      65000 * 0.03,
      6,
    );
  });

  it("is all zeros with no match", () => {
    const data = freeMoneyData({ ...PROFILE, matchPercent: 0 });
    expect(data.annualMatch).toBe(0);
    expect(data.compounded).toBe(0);
  });
});

describe("formatExact", () => {
  it("keeps the raise exact-feeling", () => {
    expect(formatExact(3900)).toBe("$3,900");
    expect(formatExact(3899.6)).toBe("$3,900");
  });
});
