/**
 * Chapter progression — linear, with back-navigation to complete Chapters.
 * `current` is the furthest unlocked chapter index (0-based). Persisted so
 * reopening the app Resumes where Allie left off.
 */

export const CHAPTER_COUNT = 7;

export type ChapterStatus = "locked" | "current" | "complete";

const KEY = "genie.progress.v1";

export function loadCurrent(): number {
  try {
    const raw = localStorage.getItem(KEY);
    const n = raw === null ? 0 : Number(raw);
    if (!Number.isInteger(n) || n < 0) return 0;
    return Math.min(n, CHAPTER_COUNT - 1);
  } catch {
    return 0;
  }
}

export function saveCurrent(index: number): void {
  // Monotonic: a stale tab's write must never rewind real progress (WHI-102).
  localStorage.setItem(KEY, String(Math.max(index, loadCurrent())));
}

/** Raw stored value; storage errors read as "0" (unreadable ≠ reset). */
function storedRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return "0";
  }
}

export function clearProgress(): void {
  localStorage.removeItem(KEY);
}

export function statusOf(index: number, current: number): ChapterStatus {
  if (index < current) return "complete";
  if (index === current) return "current";
  return "locked";
}

/** Advance past `index` if it is the current chapter. Returns the new current. */
export function completeChapter(index: number, current: number): number {
  if (index !== current) return current;
  // Progress key gone while this tab holds progress = another tab Reset;
  // advancing would write pre-Reset state back into the wiped store (WHI-102).
  if (current > 0 && storedRaw() === null) return current;
  const next = Math.min(index + 1, CHAPTER_COUNT - 1);
  saveCurrent(next);
  return next;
}
