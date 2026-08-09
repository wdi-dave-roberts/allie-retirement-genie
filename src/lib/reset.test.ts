import { beforeEach, describe, expect, it } from "vitest";
import { clearChecklist, loadChecklist } from "../chapters/ch7-lever-room";
import { isEnrolled, isRothCheckFlagged, setEnrolled, setRothCheckFlagged } from "./enrollment";
import { DEFAULT_PROFILE, loadProfile, saveProfile } from "./profile";
import { loadCurrent, saveCurrent } from "./progress";
import { loadQuizState, newQuizState, saveQuizState } from "./quiz";
import { clearAllState } from "./reset";

// Tests run in plain node; give the stores a real-enough localStorage.
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

function populateEverything(): void {
  saveProfile({ salary: 52_000, monthlySpend: 2_600, currentSavings: 1_800, matchPercent: 6 });
  saveCurrent(6);
  setEnrolled(true);
  setRothCheckFlagged(true);
  localStorage.setItem(
    "genie.checklist.v1",
    JSON.stringify({ login: true, enroll: true, match: true, roth: true, fund: true, doneBy: "2026-09-01" }),
  );
  saveQuizState("ch2", { ...newQuizState(3), tries: 2 });
}

describe("clearAllState", () => {
  beforeEach(() => {
    store.clear();
    populateEverything();
  });

  it("leaves no app keys in localStorage", () => {
    expect(store.size).toBeGreaterThan(0);
    clearAllState();
    expect(store.size).toBe(0);
  });

  it("returns every store to its first-open state", () => {
    clearAllState();
    expect(loadProfile()).toEqual(DEFAULT_PROFILE);
    expect(loadCurrent()).toBe(0);
    expect(isEnrolled()).toBe(false);
    expect(isRothCheckFlagged()).toBe(false);
    expect(loadChecklist().doneBy).toBe("");
    expect(loadQuizState("ch2", 3)).toEqual(newQuizState(3));
  });

  it("individual clears only remove their own keys", () => {
    clearChecklist();
    expect(loadChecklist().login).toBe(false);
    expect(loadProfile().salary).toBe(52_000);
    expect(loadCurrent()).toBe(6);
  });
});
