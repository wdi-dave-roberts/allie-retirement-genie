import { describe, expect, it } from "vitest";
import { NUDGE_AMPLITUDE, nudgeValue } from "./ch4-paycheck";

describe("nudgeValue", () => {
  it("starts and ends on her salary — the tour puts the thumb back", () => {
    expect(nudgeValue(65000, 0)).toBe(65000);
    expect(nudgeValue(65000, 1)).toBeCloseTo(65000, 6);
  });

  it("reaches the full glide at the halfway point", () => {
    expect(nudgeValue(65000, 0.5)).toBeCloseTo(65000 + NUDGE_AMPLITUDE, 6);
  });

  it("goes the other way when handed a negative amplitude (near the ceiling)", () => {
    expect(nudgeValue(250000, 0.5, -NUDGE_AMPLITUDE)).toBeCloseTo(250000 - NUDGE_AMPLITUDE, 6);
  });

  it("clamps progress, so a late frame can't overshoot backwards", () => {
    expect(nudgeValue(65000, 1.4)).toBeCloseTo(65000, 6);
    expect(nudgeValue(65000, -0.2)).toBe(65000);
  });
});
