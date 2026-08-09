/**
 * Genie Note registry (docs/GLOSSARY.md: Genie Note, Deeper Dive) — all note
 * copy lives here, keyed by id, so chapters reference terms in one place.
 * Real content lands with WHI-100/101; the demo-* notes exercise the engine.
 */

export interface DeeperDive {
  label: string;
  url: string;
}

export interface GenieNote {
  /** The term as the popup titles it. */
  term: string;
  /** 2-3 sentences, Genie voice. */
  body: string;
  /** Zero or one beginner-suitable external link. */
  dive?: DeeperDive;
}

export const NOTES: Record<string, GenieNote> = {
  // — Chapters 1-4 (WHI-100) —
  "ch1-401k": {
    term: "401k",
    body: "A retirement account your job gives you: money slides out of your paycheck and into investments before most taxes touch it. It's not the investment itself — it's the magic bag the investments live in. Named after a line of tax code, which is the least magical origin story I know.",
    dive: {
      label: "What a 401k is, from the top",
      url: "https://www.investopedia.com/terms/1/401kplan.asp",
    },
  },
  "ch2-compound-growth": {
    term: "compound growth",
    body: "Your money earns growth, then that growth starts earning growth of its own. Nothing happens for a while — then everything happens at once. Time is the main ingredient, which is why we start today.",
    dive: {
      label: "Compounding, explained slowly",
      url: "https://www.investopedia.com/terms/c/compoundinterest.asp",
    },
  },
  "ch2-real-return": {
    term: "7% real return",
    body: "Stocks have averaged roughly 10% a year over the last century, and inflation eats about 3. I project with the 7% that's left, so every number is in what-it-actually-buys terms. Conservative enough to trust, magical enough to work.",
    dive: {
      label: "Real vs nominal returns",
      url: "https://www.investopedia.com/terms/r/realrateofreturn.asp",
    },
  },
  "ch2-the-number": {
    term: "Where this number comes from",
    body: "No hand-waving: your monthly contribution plus the match, dropped in every month, each deposit compounding at 7% real until 65. Deposits and time — that's the whole recipe. The lamp just does the multiplication.",
  },
  "ch3-employer-match": {
    term: "employer match",
    body: "Your job adds money to your 401k, but only when you put money in first — that's the whole deal. It's part of your pay that never shows up unless you claim it. Free money is rare; this is the real thing.",
    dive: {
      label: "How matching works",
      url: "https://www.investopedia.com/terms/m/matchingcontribution.asp",
    },
  },
  "ch4-fica": {
    term: "FICA",
    body: "The paycheck line that funds Social Security (6.2%) and Medicare (1.45%). Social Security is a check when you're older; Medicare covers the doctor visits. It buys future-you a floor — the 401k builds the house on top.",
    dive: {
      label: "FICA, decoded",
      url: "https://www.investopedia.com/terms/f/fica.asp",
    },
  },
  "ch4-standard-deduction": {
    term: "standard deduction",
    body: "The first chunk of your income the IRS doesn't tax at all — $16,100 for a single filer in 2026. Everyone gets it, no paperwork gymnastics required. Your buckets only start filling above that line.",
    dive: {
      label: "The IRS on the standard deduction",
      url: "https://www.irs.gov/taxtopics/tc551",
    },
  },
  "ch4-marginal-bracket": {
    term: "marginal bracket",
    body: "Your top bucket — the rate only your last dollars pay. It's the number people panic about and the one that matters least. No raise ever gets swallowed by it; you watched the buckets fill.",
    dive: {
      label: "Marginal rates, gently",
      url: "https://www.investopedia.com/terms/m/marginaltaxrate.asp",
    },
  },
  "ch4-effective-rate": {
    term: "effective rate",
    body: "All your buckets averaged into one honest number — what you actually pay. It always lands below your marginal rate. When a headline scares you, ask which of the two it's quoting.",
  },

  // — Engine demo (?note-demo) —
  "demo-compounding": {
    term: "compound growth",
    body: "Your money earns growth, then that growth earns growth of its own. Give it decades and the curve stops being polite. It's the only magic I do that banks also believe in.",
    dive: {
      label: "Compounding, explained slowly",
      url: "https://www.investopedia.com/terms/c/compounding.asp",
    },
  },
  "demo-real-dollars": {
    term: "Real Dollars",
    body: "Every number I show you is pre-shrunk for inflation — what the money actually buys in 2026 terms. Future you and present you, speaking the same currency.",
  },
};

export function getNote(id: string): GenieNote | undefined {
  return NOTES[id];
}
