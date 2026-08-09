# Decision — 2026-08-09 No merge gates

**Status:** Accepted (Dave, direct instruction in loop-review session)

## Decision

Every PR in this repo merges automatically once loop-review passes it. No
hard-gate labels, no 🚀 approval, no 🛑 veto window. Slack #merge-ready posts
continue as an FYI/audit trail only.

## Context

The app is a client-only educational game: no backend, no sends, no payments,
no external writes. Worst-case blast radius of a bad merge is a broken static
page, fixed by the next merge. The deploy workflow itself was reviewed and
gated once (WHI-83); routine changes riding through it are low stakes.

Supersedes the default hard-gate heuristic for this repo, including the
deploy/automation path rule. If this repo ever grows a genuinely scary surface
(collecting data, sending anything, spending money), revisit.
