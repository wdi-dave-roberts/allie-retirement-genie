import { describe, expect, it } from "vitest";
import { BRACKETS_SINGLE_2026, STANDARD_DEDUCTION_SINGLE_2026 } from "../lib/tax2026";
import { rothRethinkGross } from "./ch5-roth";

describe("rothRethinkGross", () => {
  it("is the gross income where the 22% bracket starts, derived from the tax constants", () => {
    expect(rothRethinkGross()).toBe(66_500); // 2026: 50,400 taxable + 16,100 deduction
    const twelvePctTop = BRACKETS_SINGLE_2026.find((b) => b.rate === 0.12)!.upTo;
    expect(rothRethinkGross()).toBe(twelvePctTop + STANDARD_DEDUCTION_SINGLE_2026);
  });
});
