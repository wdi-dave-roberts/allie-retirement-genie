# Decision — 2026-08-08 Projection conventions

**Status:** Accepted

## Decision

All projections display in **Real Dollars** (today's purchasing power) using a
**7% real annual return**, compounded monthly, with one plain-language footnote
explaining that inflation is already accounted for. Default retirement age 65.
Default match model: employer matches 100% of contributions up to 6% of salary.

Shared math lives in `src/lib/projection.ts` with unit tests; every chapter
that shows a projection imports it. No chapter re-implements compounding.

Tax figures (2026 federal single-filer brackets, standard deduction, FICA
rates/caps, 401k contribution limit) are **verified against current primary
sources at build time** and recorded as constants with a source comment. Texas
residency: no state income tax. Never fill tax numbers from model memory.

## Context

Nominal projections (~10%) produce bigger, more exciting numbers but mislead at
a 33-year horizon — a $4M headline that buys $1.5M of groceries erodes trust in
exactly the person this app is trying to convince. Real Dollars keeps every
Reveal honest: "this is what it buys in 2026 terms." The 7% real figure is the
long-run S&P 500 inflation-adjusted return, the standard textbook assumption for
this kind of education.

The audience is one specific 32-year-old in Texas with an unenrolled 401k and a
6% employer match — accuracy of the paycheck and match math is the app's
credibility. Hence the hard rule on sourcing tax constants at build time.
