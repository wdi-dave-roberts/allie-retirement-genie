import { beforeEach, describe, expect, it } from "vitest";
import {
  MAX_TRIES,
  allAnswered,
  clearQuizState,
  isDone,
  isLocked,
  loadQuizState,
  newQuizState,
  passed,
  saveQuizState,
  selectAnswer,
  submitTry,
  type QuizQuestion,
  type QuizState,
} from "./quiz";

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

const ref = { chapter: 1, anchor: "sec" };
const questions: QuizQuestion[] = [
  { prompt: "Q1", choices: ["a", "b", "c"], correctIndex: 0, explain: "e1", sectionRef: ref },
  { prompt: "Q2", choices: ["a", "b", "c"], correctIndex: 1, explain: "e2", sectionRef: ref },
  { prompt: "Q3", choices: ["a", "b", "c"], correctIndex: 2, explain: "e3", sectionRef: ref },
];

function answerAll(state: QuizState, picks: number[]): QuizState {
  return picks.reduce((s, choice, i) => selectAnswer(s, questions, i, choice), state);
}

beforeEach(() => store.clear());

describe("try counting", () => {
  it("counts one Try per full submission, never past done", () => {
    let s = newQuizState(3);
    expect(s.tries).toBe(0);

    s = submitTry(s, questions); // nothing answered — not a Try
    expect(s.tries).toBe(0);

    s = answerAll(s, [1, 0, 0]); // all wrong
    for (let expected = 1; expected <= MAX_TRIES; expected++) {
      s = submitTry(s, questions);
      expect(s.tries).toBe(expected);
    }
    expect(isDone(s, questions)).toBe(true);
    expect(submitTry(s, questions)).toBe(s); // 4th Try refused
  });

  it("refuses a Try until every question is answered", () => {
    let s = newQuizState(3);
    s = selectAnswer(s, questions, 0, 0);
    expect(allAnswered(s)).toBe(false);
    expect(submitTry(s, questions)).toBe(s);
  });
});

describe("lock/edit rules", () => {
  it("locks right answers after a Try; wrong ones stay editable", () => {
    let s = answerAll(newQuizState(3), [0, 0, 0]); // Q1 right, Q2-3 wrong
    s = submitTry(s, questions);

    expect(isLocked(s, questions, 0)).toBe(true);
    expect(isLocked(s, questions, 1)).toBe(false);

    expect(selectAnswer(s, questions, 0, 2)).toBe(s); // locked — no edit
    const edited = selectAnswer(s, questions, 1, 1);
    expect(edited.answers[1]).toBe(1);
  });

  it("does not lock a right choice that was never submitted", () => {
    const s = answerAll(newQuizState(3), [0, 1, 2]); // all right, zero Tries
    expect(isLocked(s, questions, 0)).toBe(false);
    expect(passed(s, questions)).toBe(false);
  });

  it("refuses any edit once the quiz is done", () => {
    let s = answerAll(newQuizState(3), [0, 1, 2]);
    s = submitTry(s, questions);
    expect(selectAnswer(s, questions, 1, 0)).toBe(s);
  });
});

describe("pass detection", () => {
  it("passes when a Try submits every right answer", () => {
    let s = answerAll(newQuizState(3), [0, 1, 2]);
    s = submitTry(s, questions);
    expect(passed(s, questions)).toBe(true);
    expect(isDone(s, questions)).toBe(true);
    expect(s.tries).toBe(1);
  });

  it("is done but not passed after the Try limit", () => {
    let s = answerAll(newQuizState(3), [1, 0, 0]);
    for (let i = 0; i < MAX_TRIES; i++) s = submitTry(s, questions);
    expect(passed(s, questions)).toBe(false);
    expect(isDone(s, questions)).toBe(true);
  });
});

describe("state round-trip", () => {
  it("survives save/load intact", () => {
    let s = answerAll(newQuizState(3), [0, 0, 0]);
    s = submitTry(s, questions);
    saveQuizState("ch2", s);
    expect(loadQuizState("ch2", 3)).toEqual(s);
  });

  it("falls back to a fresh state on garbage or mismatched data", () => {
    const fresh = newQuizState(3);
    expect(loadQuizState("missing", 3)).toEqual(fresh);

    store.set("genie.quiz.bad.v1", "not json");
    expect(loadQuizState("bad", 3)).toEqual(fresh);

    saveQuizState("short", newQuizState(2)); // question count changed
    expect(loadQuizState("short", 3)).toEqual(fresh);

    store.set("genie.quiz.tries.v1", JSON.stringify({ ...fresh, tries: 99 }));
    expect(loadQuizState("tries", 3)).toEqual(fresh);
  });

  it("clearQuizState wipes every quiz key and nothing else", () => {
    saveQuizState("ch2", newQuizState(3));
    saveQuizState("final", newQuizState(10));
    store.set("genie.progress.v1", "3");
    clearQuizState();
    expect(loadQuizState("ch2", 3)).toEqual(newQuizState(3));
    expect(store.size).toBe(1);
    expect(store.get("genie.progress.v1")).toBe("3");
  });
});
