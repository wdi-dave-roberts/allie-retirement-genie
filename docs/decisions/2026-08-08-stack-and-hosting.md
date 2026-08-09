# Decision — 2026-08-08 Stack and hosting

**Status:** Accepted

## Decision

Vite + TypeScript, no UI framework. Hand-rolled SVG charts, CSS animations,
pnpm. Deployed to GitHub Pages from a public repo via GitHub Actions.

## Context

One-shot, phone-first, chart-heavy narrative app with 7 linear chapters and no
backend. A framework buys nothing here: state is a small Profile object in
`localStorage` and a chapter index. Vanilla TS keeps the dependency surface
tiny for unattended loop builds and leaves nothing to maintain later.

Repo was private; GitHub Pages on the free plan requires public. The code is
generic financial-education content — Allie's actual numbers are entered by her
at runtime and stored in `localStorage` only, so nothing private ships in the
repo. Public + Pages chosen over Cloudflare Pages (one less service) and over
a single-file AirDrop build (a URL is a better gift on a phone).
