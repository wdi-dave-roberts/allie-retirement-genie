import { describe, expect, it } from "vitest";
import {
  BRACKETS_SINGLE_2026,
  STANDARD_DEDUCTION_SINGLE_2026,
  paycheck,
  taxableIncome,
} from "../lib/tax2026";
import { NUDGE_AMPLITUDE, bucketRows, nudgeValue } from "./ch4-paycheck";

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

describe("bucketRows", () => {
  it("leads with the standard deduction as the 0% bucket", () => {
    const [deduction] = bucketRows(65000);
    expect(deduction).toMatchObject({
      rate: 0,
      span: STANDARD_DEDUCTION_SINGLE_2026,
      dollarsIn: STANDARD_DEDUCTION_SINGLE_2026,
      tax: 0,
    });
  });

  it("spans are the bracket widths, in fill order", () => {
    const rows = bucketRows(65000);
    expect(rows.map((r) => r.rate)).toEqual([0, 0.1, 0.12, 0.22, 0.24, 0.32]);
    expect(rows[1]!.span).toBe(BRACKETS_SINGLE_2026[0]!.upTo);
    expect(rows[2]!.span).toBe(BRACKETS_SINGLE_2026[1]!.upTo - BRACKETS_SINGLE_2026[0]!.upTo);
  });

  it("buckets fill in order and spill into the next", () => {
    const rows = bucketRows(65000);
    const taxable = taxableIncome(65000); // 48,900
    expect(rows[1]!.dollarsIn).toBe(BRACKETS_SINGLE_2026[0]!.upTo); // 10% full
    expect(rows[2]!.dollarsIn).toBe(taxable - BRACKETS_SINGLE_2026[0]!.upTo); // spilled into 12%
    expect(rows[3]!.dollarsIn).toBe(0); // 22% untouched
  });

  it("per-bucket tax sums to the federal tax the paycheck lib reports", () => {
    for (const gross of [20000, 65000, 120000, 250000]) {
      const summed = bucketRows(gross).reduce((total, row) => total + row.tax, 0);
      expect(summed).toBeCloseTo(paycheck(gross).federal, 6);
    }
  });

  it("dollars in the buckets account for every dollar of gross, up to the top", () => {
    const gross = 65000;
    const held = bucketRows(gross).reduce((total, row) => total + row.dollarsIn, 0);
    expect(held).toBeCloseTo(gross, 6);
  });

  it("marginal badge sits on the top bucket receiving dollars", () => {
    expect(bucketRows(65000).find((r) => r.marginal)!.rate).toBe(0.12);
    expect(bucketRows(120000).find((r) => r.marginal)!.rate).toBe(0.22);
    // Top of the slider reaches the 32% bucket — the stack draws every one
    // she can actually fill.
    expect(bucketRows(250000).find((r) => r.marginal)!.rate).toBe(0.32);
    // Matches the readout's marginal rate, which is what the badge points at.
    for (const gross of [20000, 65000, 120000, 250000]) {
      expect(bucketRows(gross).find((r) => r.marginal)!.rate).toBe(paycheck(gross).marginalRate);
    }
  });

  it("at the slider floor only the deduction and 10% buckets are live", () => {
    const rows = bucketRows(20000);
    expect(rows[0]!.dollarsIn).toBe(STANDARD_DEDUCTION_SINGLE_2026);
    expect(rows[1]!.dollarsIn).toBe(20000 - STANDARD_DEDUCTION_SINGLE_2026);
    expect(rows.slice(2).every((r) => r.dollarsIn === 0)).toBe(true);
    expect(rows.find((r) => r.marginal)!.rate).toBe(0.1);
  });

  it("income under the deduction is all freebie — no NaN, no negative fills", () => {
    const rows = bucketRows(10000);
    expect(rows[0]!.dollarsIn).toBe(10000);
    expect(rows.slice(1).every((r) => r.dollarsIn === 0 && r.tax === 0)).toBe(true);
    expect(rows.find((r) => r.marginal)!.rate).toBe(0);
    for (const row of bucketRows(0)) {
      expect(Number.isFinite(row.dollarsIn / row.span)).toBe(true);
    }
  });
});
