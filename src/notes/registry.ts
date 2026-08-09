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
