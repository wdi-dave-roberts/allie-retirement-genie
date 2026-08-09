import { describe, expect, it } from "vitest";
import {
  federalIncomeTax,
  ficaTax,
  marginalRate,
  paycheck,
  taxableIncome,
} from "./tax2026";

describe("taxableIncome", () => {
  it("subtracts standard deduction and pre-tax 401(k)", () => {
    expect(taxableIncome(65000)).toBe(48900);
    expect(taxableIncome(65000, 3900)).toBe(45000);
    expect(taxableIncome(10000)).toBe(0);
  });
});

describe("federalIncomeTax — known values", () => {
  it("taxes exactly through the 10% bracket", () => {
    expect(federalIncomeTax(12400)).toBeCloseTo(1240, 2);
  });

  it("$65k salary, no 401(k): $5,620 federal", () => {
    // taxable 48,900 → 1,240 + 12% × (48,900 − 12,400) = 5,620
    expect(federalIncomeTax(taxableIncome(65000))).toBeCloseTo(5620, 2);
  });

  it("zero taxable → zero tax", () => {
    expect(federalIncomeTax(0)).toBe(0);
  });
});

describe("ficaTax — known values", () => {
  it("7.65% below both caps", () => {
    expect(ficaTax(65000)).toBeCloseTo(65000 * 0.0765, 2);
  });

  it("caps Social Security at the 2026 wage base and adds 0.9% over $200k", () => {
    const expected = 184500 * 0.062 + 250000 * 0.0145 + 50000 * 0.009;
    expect(ficaTax(250000)).toBeCloseTo(expected, 2);
  });
});

describe("paycheck", () => {
  it("$65k, no 401(k): net = gross − federal − FICA", () => {
    const p = paycheck(65000);
    expect(p.federal).toBeCloseTo(5620, 2);
    expect(p.fica).toBeCloseTo(4972.5, 2);
    expect(p.net).toBeCloseTo(65000 - 5620 - 4972.5, 2);
    expect(p.marginalRate).toBe(0.12);
    expect(p.effectiveRate).toBeCloseTo(5620 / 65000, 6);
  });

  it("6% pre-tax contribution costs less than 6% in take-home", () => {
    const without = paycheck(65000);
    const contribution = 65000 * 0.06;
    const withK = paycheck(65000, contribution);
    const takeHomeCost = without.net - withK.net;
    expect(takeHomeCost).toBeLessThan(contribution);
    // cost = contribution − federal savings (12% bracket): 3,900 × 0.88
    expect(takeHomeCost).toBeCloseTo(3900 - 3900 * 0.12, 2);
  });

  it("net take-home is monotonic: a raise NEVER lowers net pay", () => {
    let prev = -Infinity;
    for (let gross = 10_000; gross <= 700_000; gross += 500) {
      const { net } = paycheck(gross);
      expect(net).toBeGreaterThan(prev);
      prev = net;
    }
  });

  it("caps the 401(k) deferral at the 2026 employee limit", () => {
    expect(paycheck(300000, 50000).pretax401k).toBe(24500);
  });
});

describe("marginalRate", () => {
  it("steps at bracket edges", () => {
    expect(marginalRate(12400)).toBe(0.1);
    expect(marginalRate(12401)).toBe(0.12);
    expect(marginalRate(50401)).toBe(0.22);
    expect(marginalRate(700000)).toBe(0.37);
  });
});
