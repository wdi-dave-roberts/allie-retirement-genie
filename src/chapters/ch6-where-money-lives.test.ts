import { describe, expect, it } from "vitest";
import { futureValueLumpSum } from "../lib/projection";
import {
  CASH_MONTHLY_REAL_RATE,
  emergencyTarget,
  rotData,
} from "./ch6-where-money-lives";

const PROFILE = { salary: 65000, monthlySpend: 3200, currentSavings: 4000, matchPercent: 6 };

describe("emergencyTarget", () => {
  it("is 3-6× monthly spend from the Profile", () => {
    expect(emergencyTarget(PROFILE)).toEqual([9600, 19200]);
  });

  it("updates with the Profile", () => {
    expect(emergencyTarget({ ...PROFILE, monthlySpend: 4000 })).toEqual([12000, 24000]);
  });
});

describe("rotData", () => {
  it("matches projection-lib output for both lines", () => {
    const rot = rotData();
    expect(rot.invested20y).toBeCloseTo(futureValueLumpSum(10000, 240), 6);
    expect(rot.cash20y).toBeCloseTo(futureValueLumpSum(10000, 240, CASH_MONTHLY_REAL_RATE), 6);
  });

  it("cash rots in Real Dollars: below principal, monotonically shrinking", () => {
    const rot = rotData();
    expect(rot.cash10y).toBeLessThan(10000);
    expect(rot.cash20y).toBeLessThan(rot.cash10y);
    // ≈ −2%/yr → roughly $6,600 after 20 years
    expect(rot.cash20y).toBeGreaterThan(5500);
    expect(rot.cash20y).toBeLessThan(7500);
  });

  it("invested grows to ~4× in 20 years at 7% real", () => {
    const rot = rotData();
    expect(rot.invested20y).toBeGreaterThan(38000);
    expect(rot.invested20y).toBeLessThan(42000);
  });

  it("point series span year 0 to 20 and start at the principal", () => {
    const rot = rotData();
    expect(rot.cashPoints[0]).toEqual([0, 10000]);
    expect(rot.investedPoints[0]).toEqual([0, 10000]);
    expect(rot.cashPoints[rot.cashPoints.length - 1]![0]).toBe(20);
  });
});
