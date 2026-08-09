/**
 * Styled range inputs (WHI-110). WebKit has no ::-moz-range-progress, so the
 * filled portion of the track is a gradient driven by a --fill custom property
 * that has to be repainted whenever the value changes.
 */

/** Fraction of the track left of the thumb, 0-1. */
export function rangeFraction(min: number, max: number, value: number): number {
  if (!(max > min)) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/** Repaints one input's filled track. Safe to call on every input event. */
export function paintRange(input: HTMLInputElement): void {
  const fraction = rangeFraction(Number(input.min), Number(input.max), Number(input.value));
  input.style.setProperty("--fill", `${(fraction * 100).toFixed(1)}%`);
}

/** Repaints every range input under `root`. */
export function paintRanges(root: ParentNode): void {
  for (const input of root.querySelectorAll<HTMLInputElement>('input[type="range"]')) {
    paintRange(input);
  }
}
