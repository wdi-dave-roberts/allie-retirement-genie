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


  // — Chapters 5-7 (WHI-101) —
  "ch5-roth-vs-traditional": {
    term: "Roth vs Traditional",
    body: "Two flavors of the same 401k, split by one question: taxes now (Roth) or taxes at withdrawal (Traditional). Same investments, same growth, same match either way. Pick a flavor, not a fight.",
    dive: {
      label: "Roth 401k, from the top",
      url: "https://www.investopedia.com/terms/r/roth401k.asp",
    },
  },
  "ch5-tax-free-growth": {
    term: "tax-free growth",
    body: "In a Roth, the tax collector visits once — on the way in — and never again. Thirty-three years of compounding, withdrawn without a bill at 65. That's the whole romance.",
  },
  "ch6-hysa": {
    term: "high-yield savings account",
    body: "A plain savings account at an online bank, minus the marble lobby — which is why it pays roughly 10x the big-bank rate. Same federal insurance, up to $250,000. Your emergency fund's natural habitat.",
    dive: {
      label: "High-yield savings, explained",
      url: "https://www.investopedia.com/high-yield-savings-accounts-4770633",
    },
  },
  "ch6-index-fund": {
    term: "index fund",
    body: "One fund that buys a sliver of every company in the market, automatically. No manager guessing, no stock-picking — just owning the whole haystack instead of hunting the needle. It's how boring wins.",
    dive: {
      label: "Index funds, gently",
      url: "https://www.investopedia.com/terms/i/indexfund.asp",
    },
  },
  "ch6-target-date-fund": {
    term: "target-date fund",
    body: "One fund dated near your retirement year — 2059 for you — that starts stock-heavy and calms itself down as the date approaches. It rebalances on its own; you do nothing. Eleven seconds of choosing, decades of autopilot.",
    dive: {
      label: "How target-date funds work",
      url: "https://www.investopedia.com/terms/t/target-date_fund.asp",
    },
  },
  "ch6-expense-ratio": {
    term: "expense ratio",
    body: "What a fund charges yearly to exist, skimmed quietly off the top. Index funds run around 0.03% — three dollars per $10,000 — while actively managed funds often take 30x that for worse results. Fees compound too, just against you.",
    dive: {
      label: "Expense ratios, decoded",
      url: "https://www.investopedia.com/terms/e/expenseratio.asp",
    },
  },
  "ch7-contribution-limit": {
    term: "contribution limit",
    body: "The IRS caps 401k deposits at $24,500 a year in 2026 — a ceiling you're nowhere near at 6%, so climb freely. The cap exists because the tax break is generous and Congress keeps a lid on it. Future raises can chase it; today just needs the match.",
    dive: {
      label: "The IRS on 401k limits",
      url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits",
    },
  },
  "ch7-raise-assumption": {
    term: "2% a year raises",
    body: "A deliberately humble guess: your salary creeping 2% a year ahead of inflation. Careers usually beat that — promotions exist — but the lamp would rather under-promise. Pull the lever up when reality outperforms.",
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
