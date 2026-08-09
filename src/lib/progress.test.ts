import { beforeEach, describe, expect, it } from "vitest";
import { CHAPTER_COUNT, clearProgress, completeChapter, loadCurrent, saveCurrent } from "./progress";

// Tests run in plain node; give the store a real-enough localStorage.
const store = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
} as Storage;

beforeEach(() => store.clear());

describe("completeChapter", () => {
  it("advances the current chapter and persists, clamped at the last", () => {
    expect(completeChapter(0, 0)).toBe(1);
    expect(loadCurrent()).toBe(1);
    expect(completeChapter(CHAPTER_COUNT - 1, CHAPTER_COUNT - 1)).toBe(CHAPTER_COUNT - 1);
  });

  it("is a no-op off the current chapter", () => {
    saveCurrent(3);
    expect(completeChapter(1, 3)).toBe(3);
    expect(loadCurrent()).toBe(3);
  });
});

describe("stale-tab guards (WHI-102)", () => {
  it("a stale tab's advance never rewinds another tab's stored progress", () => {
    saveCurrent(4); // Tab B is at chapter 5
    expect(completeChapter(1, 1)).toBe(2); // Tab A, two chapters behind, clicks forward
    expect(loadCurrent()).toBe(4); // Tab B's progress survives
  });

  it("saveCurrent is monotonic", () => {
    saveCurrent(5);
    saveCurrent(2);
    expect(loadCurrent()).toBe(5);
  });

  it("after a Reset elsewhere, a stale tab cannot resurrect old progress", () => {
    saveCurrent(3);
    clearProgress(); // another tab confirmed Start Over
    expect(completeChapter(3, 3)).toBe(3); // stale tab clicks forward — refused
    expect(store.has("genie.progress.v1")).toBe(false); // store stays wiped
  });

  it("a fresh first run (no key yet) still advances normally", () => {
    expect(completeChapter(0, 0)).toBe(1);
    expect(loadCurrent()).toBe(1);
  });
});
