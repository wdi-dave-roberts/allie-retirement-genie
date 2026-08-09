import { describe, expect, it } from "vitest";
import { formatMoney } from "../lib/format";
import {
  contributionMonthly,
  employerMatchMonthly,
  futureValueOfStream,
} from "../lib/projection";
import { curveData, LATE_START_AGE, RETIRE_AGE, START_AGE } from "./ch2-the-curve";

const PROFILE = { salary: 65000, monthlySpend: 3200, currentSavings: 4000, matchPercent: 6 };

describe("curveData", () => {
  it("matches projection-lib output exactly (the Reveal is unit-testable)", () => {
    const monthly = contributionMonthly(65000, 6) + employerMatchMonthly(65000, 6, 6);
    const now = futureValueOfStream(monthly, (RETIRE_AGE - START_AGE) * 12);
    const later = futureValueOfStream(monthly, (RETIRE_AGE - LATE_START_AGE) * 12);
    const data = curveData(PROFILE);
    expect(data.monthly).toBeCloseTo(monthly, 6);
    expect(data.now).toBeCloseTo(now, 6);
    expect(data.later).toBeCloseTo(later, 6);
    expect(data.gap).toBeCloseTo(now - later, 6);
    expect(data.gap).toBeGreaterThan(0);
  });

  it("late line stays at zero until 42, both lines end at 65", () => {
    const data = curveData(PROFILE);
    for (const [age, value] of data.laterPoints) {
      if (age <= LATE_START_AGE) expect(value).toBe(0);
      else expect(value).toBeGreaterThan(0);
    }
    expect(data.nowPoints[0]).toEqual([START_AGE, 0]);
    expect(data.nowPoints[data.nowPoints.length - 1]![0]).toBe(RETIRE_AGE);
  });

  it("scales with the Profile: double salary, double curve", () => {
    const base = curveData(PROFILE);
    const doubled = curveData({ ...PROFILE, salary: 130000 });
    expect(doubled.gap).toBeCloseTo(base.gap * 2, 6);
  });
});

describe("formatMoney", () => {
  it("formats for humans", () => {
    expect(formatMoney(1_203_441.87)).toBe("$1.2M");
    expect(formatMoney(1_000_000)).toBe("$1M");
    expect(formatMoney(850_000)).toBe("$850K");
    expect(formatMoney(999_499)).toBe("$999K");
    expect(formatMoney(42)).toBe("$42");
    expect(formatMoney(-12_500)).toBe("-$13K");
  });
});
