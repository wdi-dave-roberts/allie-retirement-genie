# Glossary — Allie Retirement Genie

Ubiquitous-language reference for this repo. Terms here are the ones `loop-spec`
challenges every spec interview against, and the ones code/commits/issue titles
should use verbatim rather than re-deriving synonyms.

Maintained by `loop-spec`. Edit directly if a definition drifts from reality.

## Terms

- **Genie** — the app's narrator and only character. Full classic-lamp energy:
  named, first-person voice throughout, warm and funny, never lecturing. The
  Genie "grants" Allie's financial future by showing it to her.

- **Chapter** — one of 7 sequential sections of the one-shot experience. States:
  `locked` → `current` → `complete`. Progression is linear; Allie may navigate
  back to any `complete` chapter, never forward past `current`. Target length
  per chapter: under 5 minutes.

- **Profile** — Allie's real numbers, collected in Chapter 1: annual salary,
  monthly spend, current savings, employer match percent (default 6). Lives in
  `localStorage` only; never leaves her device, never appears in this repo.

- **Reveal** — an animated moment where a chart or number lands a chapter's
  point (e.g. the cost of waiting, the compounded value of the match). Every
  chapter builds to at least one Reveal.

- **The Curve** — Chapter 2's Reveal: compound growth of her contributions
  starting now (age 32) vs starting at 42, in Real Dollars.

- **Free Money** — Chapter 3's framing of the employer match: unenrolled = 
  declining a raise. Default match model: employer matches 100% of her
  contribution up to 6% of salary (she confirms her plan's actual formula in
  the Action Checklist).

- **Enrollment** — the conversion event the whole app builds toward: Allie
  enrolls in her 401k at ≥ 6% (full match capture), today.

- **Bracket Myth** — the false belief that a raise can lower take-home pay by
  "pushing you into a higher bracket." Chapter 4 kills it with an interactive
  marginal-bracket filler.

- **Real Dollars** — all projections displayed in today's (2026) purchasing
  power, using a 7% real annual return. See ADR 2026-08-08-projection-conventions.

- **Lever Room** — Chapter 7's playground: sliders for contribution %,
  retirement age, and raise assumptions, driving a live projection.

- **Action Checklist** — Chapter 7's concrete close: steps to enroll, target
  contribution %, confirm match formula, done-by date.

- **Resume** — progress persists in `localStorage`; reopening the app returns
  Allie to her `current` chapter. One-shot doesn't mean one-sitting.

- **Reset** — full wipe of all persisted state (Profile, chapter progress,
  "I'm in" toggle, Roth flag, Action Checklist, Quiz and Final Exam state)
  back to first-open: Chapter 1 intake. Triggered from a subtle "Start over"
  footer link present on every Chapter, behind a confirm dialog in Genie
  voice. There is no partial reset.

- **Quiz** — 3-question check at the end of each Chapter, taken to complete
  the Chapter. Questions are personalized from the Profile where possible.
  Passing is optional: after the Try limit, the Answer Key shows and she
  advances regardless. State persists per Chapter in `localStorage`.

- **Try** — one whole-quiz submission. Max 3 per Quiz (and per Final Exam).
  After each Try, every answer is colored (green = right, red = wrong, with
  icons — never color alone); wrong answers stay editable.

- **Answer Key** — the disclosure after the 3rd Try (or a pass): correct
  answers, a one-line Genie explanation each, and a Section Link per question.
  Distinct from **Reveal**, which stays reserved for chart moments.

- **Section Link** — a link on a Quiz/Exam question that jumps back to the
  Chapter section teaching that concept, without losing quiz state.

- **Final Exam** — 10 questions spanning all Chapters, presented after
  Chapter 7's Lever Room and before the Action Checklist. Same Try/Answer Key
  rules as a Quiz. The finale celebration references the score; the journey
  still ends with the Action Checklist, not the test.

- **Genie Note** — level-1 progressive disclosure: a curated term or figure
  rendered tappable (dotted-underline affordance; hover on desktop, tap on
  phone) that opens a short in-voice popup explanation. At most one open at a
  time; dismiss by tap-outside or close. ~15-20 exist across the app — an
  invitation to linger, never required reading.

- **Deeper Dive** — level-2 disclosure: an optional single external link at
  the foot of a Genie Note, opening in a new tab. Sources are hand-curated
  and beginner-suitable (Investopedia/CFPB-style explainers over IRS PDFs;
  official sources only when the figure itself is the point). Zero or one
  per Genie Note.
