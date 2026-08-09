# Allie's Retirement Genie

Phone-first (390px) educational web app teaching retirement basics to Allie —
7 linear chapters, chapter quizzes, Genie Notes, Final Exam, Action Checklist.
Vite + TypeScript, no framework, no backend; all state in localStorage.

## Audience of one — not bugs

Allie is **32 years old and lives in Austin, TX**. The hardcoded age 32
(`src/chapters/ch7-lever-room.ts`) and Texas $0 state tax
(`src/chapters/ch4-paycheck.ts`) are deliberate personalization. Do not
generalize or flag them in reviews.

## Local main lags origin

The build/review loops merge PRs on GitHub; nothing pulls here automatically
(loop-review fast-forwards this checkout only when it's clean and on main).
**Before any UAT, verification, or build you'll trust: `git fetch` and check
the behind-count first.** A stale local main burned a full UAT pass on
2026-08-09.

## Build loop

Runs plain `loop-build` (project-scoped) on a cron. Don't add `cap:*` filters
here — this is a single-capability project, so a cap filter adds nothing, and
a stale one matching zero labels makes the cron skip every issue forever.

## Commands

- `pnpm test` — vitest (excludes `e2e/` and `.claude/` loop worktrees)
- `pnpm test:e2e` — Playwright against the production build on port 4173
- `pnpm build && pnpm preview --port 4173` — what e2e and UAT should run against
