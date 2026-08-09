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
  localStorage.setItem(KEY, String(index));
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
  const next = Math.min(index + 1, CHAPTER_COUNT - 1);
  saveCurrent(next);
  return next;
}
