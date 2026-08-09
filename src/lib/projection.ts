/**
 * Shared projection math — the only place compounding lives.
 *
 * All values are Real Dollars (today's purchasing power) at a 7% real annual
 * return, compounded monthly. See docs/decisions/2026-08-08-projection-conventions.md.
 */

export const REAL_ANNUAL_RETURN = 0.07;
export const MONTHLY_RATE = REAL_ANNUAL_RETURN / 12;
export const DEFAULT_MATCH_PERCENT = 6;

/** Future value of a lump sum after `months` of monthly compounding. */
export function futureValueLumpSum(
  present: number,
  months: number,
  monthlyRate: number = MONTHLY_RATE,
): number {
  return present * Math.pow(1 + monthlyRate, months);
}

/**
 * Future value of a level monthly contribution stream (contributed at each
 * month's end) after `months` months.
 */
export function futureValueOfStream(
  monthlyContribution: number,
  months: number,
  monthlyRate: number = MONTHLY_RATE,
): number {
  if (monthlyRate === 0) return monthlyContribution * months;
  return (monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1)) / monthlyRate;
}

/**
 * Employer match, per month: 100% of the employee's contribution up to
 * `matchPercent` of salary (the default plan model per the glossary).
 */
export function employerMatchMonthly(
  annualSalary: number,
  contributionPercent: number,
  matchPercent: number = DEFAULT_MATCH_PERCENT,
): number {
  const matchedPercent = Math.min(Math.max(contributionPercent, 0), matchPercent);
  return (annualSalary * (matchedPercent / 100)) / 12;
}

/** Employee's own monthly contribution at `contributionPercent` of salary. */
export function contributionMonthly(annualSalary: number, contributionPercent: number): number {
  return (annualSalary * (contributionPercent / 100)) / 12;
}

/**
 * Projected balance: current savings grown as a lump sum, plus employee and
 * employer match streams, over `months` months.
 */
export function projectBalance(opts: {
  currentSavings: number;
  annualSalary: number;
  contributionPercent: number;
  matchPercent?: number;
  months: number;
}): number {
  const monthly =
    contributionMonthly(opts.annualSalary, opts.contributionPercent) +
    employerMatchMonthly(opts.annualSalary, opts.contributionPercent, opts.matchPercent);
  return (
    futureValueLumpSum(opts.currentSavings, opts.months) +
    futureValueOfStream(monthly, opts.months)
  );
}
