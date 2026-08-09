/**
 * Distractor picking for computed money questions: formatted figures can
 * collide (e.g. at zero federal tax the naive and real costs are equal), and
 * a choice list must never show the right answer twice.
 */
export function uniqueDistractors(correct: string, candidates: string[], count = 2): string[] {
  const out: string[] = [];
  for (const candidate of candidates) {
    if (out.length === count) break;
    if (candidate !== correct && !out.includes(candidate)) out.push(candidate);
  }
  return out;
}
