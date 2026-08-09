import { describe, expect, it } from "vitest";
import { rangeFraction } from "./range";

describe("rangeFraction", () => {
  it("maps value to its position along the track", () => {
    expect(rangeFraction(0, 100, 0)).toBe(0);
    expect(rangeFraction(0, 100, 50)).toBe(0.5);
    expect(rangeFraction(0, 100, 100)).toBe(1);
    expect(rangeFraction(20000, 250000, 65000)).toBeCloseTo(45 / 230, 6);
  });

  it("clamps outside the track instead of painting past the ends", () => {
    expect(rangeFraction(0, 100, -20)).toBe(0);
    expect(rangeFraction(0, 100, 140)).toBe(1);
  });

  it("degenerate or unparsed bounds paint empty, never NaN", () => {
    expect(rangeFraction(5, 5, 5)).toBe(0);
    expect(rangeFraction(Number.NaN, Number.NaN, 10)).toBe(0);
  });
});
