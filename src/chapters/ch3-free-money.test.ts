import { describe, expect, it } from "vitest";
import { lineChart } from "../lib/chart";
import { employerMatchMonthly, futureValueOfStream } from "../lib/projection";
import { forfeitData, formatExact, freeMoneyData } from "./ch3-free-money";

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

describe("forfeitData", () => {
  it("at 0% the whole match is forfeited; at full match nothing is", () => {
    const none = forfeitData(PROFILE, 0);
    expect(none.capturedAnnual).toBe(0);
    expect(none.forfeitedAnnual).toBeCloseTo(freeMoneyData(PROFILE).annualMatch, 6);

    const all = forfeitData(PROFILE, PROFILE.matchPercent);
    expect(all.forfeitedAnnual).toBe(0);
    expect(all.forfeitedCompounded).toBe(0);
  });

  it("captured + forfeited always equals the full match", () => {
    const full = freeMoneyData(PROFILE).annualMatch;
    for (const pct of [0, 1, 3, 5, 6]) {
      const f = forfeitData(PROFILE, pct);
      expect(f.capturedAnnual + f.forfeitedAnnual).toBeCloseTo(full, 6);
    }
  });

  it("never goes negative above the match ceiling", () => {
    const over = forfeitData(PROFILE, 20);
    expect(over.forfeitedAnnual).toBe(0);
    expect(over.capturedAnnual).toBeCloseTo(freeMoneyData(PROFILE).annualMatch, 6);
  });

  it("forfeited compounding is the projection-lib stream of the unclaimed match", () => {
    const f = forfeitData(PROFILE, 3);
    const missed = employerMatchMonthly(65000, 6, 6) - employerMatchMonthly(65000, 3, 6);
    expect(f.forfeitedCompounded).toBeCloseTo(futureValueOfStream(missed, (65 - 32) * 12), 6);
  });

  it("lines run 32 to 65 and land on the chapter's compounded figures", () => {
    const f = forfeitData(PROFILE, 3);
    expect(f.fullPoints).toHaveLength(65 - 32 + 1);
    expect(f.fullPoints[0]).toEqual([32, 0]);
    expect(f.fullPoints[f.fullPoints.length - 1]![1]).toBeCloseTo(
      freeMoneyData(PROFILE).compounded,
      6,
    );
    // The gap between the lines IS the forfeited compounding.
    const last = f.fullPoints.length - 1;
    expect(f.fullPoints[last]![1] - f.capturedPoints[last]![1]).toBeCloseTo(
      f.forfeitedCompounded,
      6,
    );
  });

  it("renders clean SVG at both slider ends — no NaN when the lines coincide", () => {
    for (const pct of [0, PROFILE.matchPercent]) {
      const f = forfeitData(PROFILE, pct);
      const svg = lineChart({
        series: [
          { points: f.capturedPoints, className: "curve__line curve__line--later" },
          { points: f.fullPoints, className: "curve__line curve__line--now" },
        ],
        label: "test",
        xLabels: [{ x: 32, text: "32" }],
      });
      expect(svg).not.toContain("NaN");
    }
  });
});

describe("formatExact", () => {
  it("keeps the raise exact-feeling", () => {
    expect(formatExact(3900)).toBe("$3,900");
    expect(formatExact(3899.6)).toBe("$3,900");
  });
});
