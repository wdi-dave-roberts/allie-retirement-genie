/**
 * 2026 federal tax constants — single filer, standard deduction only.
 *
 * VERIFIED against primary sources on 2026-08-08 (per ADR
 * 2026-08-08-projection-conventions: never fill these from model memory):
 *
 * - Brackets & standard deduction: IRS newsroom, "IRS releases tax inflation
 *   adjustments for tax year 2026" (Rev. Proc. 2025-32)
 *   https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill
 * - Social Security wage base 2026 ($184,500, rate 6.2%): SSA October 2025
 *   COLA announcement, https://www.ssa.gov/cola/ (reported at
 *   https://tax.thomsonreuters.com/news/ssa-announces-social-security-taxable-wage-base-for-2026/)
 * - Medicare 1.45% + 0.9% additional over $200,000 (statutory, not indexed):
 *   https://www.irs.gov/taxtopics/tc751
 * - 401(k) employee deferral limit 2026 ($24,500): IRS Notice 2025-67,
 *   https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500
 *
 * Texas: no state income tax.
 */

export const STANDARD_DEDUCTION_SINGLE_2026 = 16_100;
export const LIMIT_401K_EMPLOYEE_2026 = 24_500;

export const SS_RATE = 0.062;
export const SS_WAGE_BASE_2026 = 184_500;
export const MEDICARE_RATE = 0.0145;
export const ADDL_MEDICARE_RATE = 0.009;
export const ADDL_MEDICARE_THRESHOLD_SINGLE = 200_000;

/** Upper bound of each bracket on TAXABLE income (single, 2026). */
export const BRACKETS_SINGLE_2026: ReadonlyArray<{ rate: number; upTo: number }> = [
  { rate: 0.1, upTo: 12_400 },
  { rate: 0.12, upTo: 50_400 },
  { rate: 0.22, upTo: 105_700 },
  { rate: 0.24, upTo: 201_775 },
  { rate: 0.32, upTo: 256_225 },
  { rate: 0.35, upTo: 640_600 },
  { rate: 0.37, upTo: Infinity },
];

/** Taxable income after pre-tax 401(k) and the standard deduction. */
export function taxableIncome(gross: number, pretax401k = 0): number {
  return Math.max(0, gross - pretax401k - STANDARD_DEDUCTION_SINGLE_2026);
}

/** Progressive federal income tax on taxable income. */
export function federalIncomeTax(taxable: number): number {
  let tax = 0;
  let floor = 0;
  for (const { rate, upTo } of BRACKETS_SINGLE_2026) {
    if (taxable <= floor) break;
    tax += (Math.min(taxable, upTo) - floor) * rate;
    floor = upTo;
  }
  return tax;
}

/** FICA on gross wages — 401(k) deferrals do not reduce FICA. */
export function ficaTax(gross: number): number {
  const ss = Math.min(gross, SS_WAGE_BASE_2026) * SS_RATE;
  const medicare = gross * MEDICARE_RATE;
  const addl = Math.max(0, gross - ADDL_MEDICARE_THRESHOLD_SINGLE) * ADDL_MEDICARE_RATE;
  return ss + medicare + addl;
}

/** Marginal rate at a given taxable income. */
export function marginalRate(taxable: number): number {
  for (const { rate, upTo } of BRACKETS_SINGLE_2026) {
    if (taxable <= upTo) return rate;
  }
  return BRACKETS_SINGLE_2026[BRACKETS_SINGLE_2026.length - 1]!.rate;
}

export interface Paycheck {
  gross: number;
  pretax401k: number;
  federal: number;
  fica: number;
  /** Take-home after 401(k), federal tax, and FICA. */
  net: number;
  /** Federal tax ÷ gross. */
  effectiveRate: number;
  marginalRate: number;
}

export function paycheck(gross: number, pretax401k = 0): Paycheck {
  const capped = Math.min(pretax401k, LIMIT_401K_EMPLOYEE_2026);
  const taxable = taxableIncome(gross, capped);
  const federal = federalIncomeTax(taxable);
  const fica = ficaTax(gross);
  return {
    gross,
    pretax401k: capped,
    federal,
    fica,
    net: gross - capped - federal - fica,
    effectiveRate: gross > 0 ? federal / gross : 0,
    marginalRate: marginalRate(taxable),
  };
}
