/** Human-friendly money formatting: $1.2M, $850K, $42 — never $1,203,441.87. */
export function formatMoney(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    const m = Math.round((abs / 1_000_000) * 10) / 10;
    return `${sign}$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
}
