/**
 * Quiz engine — Tries, lock/edit rules, pass detection, persistence
 * (docs/GLOSSARY.md: Quiz, Try, Answer Key, Section Link). Pure logic only;
 * rendering lives in src/quiz/. State is immutable — every transition
 * returns a new object (or the same one when the move is illegal).
 */

export const MAX_TRIES = 3;

export interface SectionRef {
  /** 0-based Chapter index the teaching section lives in. */
  chapter: number;
  /** DOM id of the section element the Section Link scrolls to. */
  anchor: string;
}

export interface QuizQuestion {
  prompt: string;
  /** 3-4 choices. */
  choices: string[];
  correctIndex: number;
  /** One-line Genie explanation shown in the Answer Key. */
  explain: string;
  sectionRef: SectionRef;
}

export interface QuizSpec {
  /** Stable persistence id (e.g. "ch2", "final"). */
  id: string;
  /** Built at render time so prompts can use the live Profile. */
  questions: QuizQuestion[];
}

export interface QuizState {
  /** Current selections, by question. */
  answers: (number | null)[];
  /** Selections as of the last Try — null before the first. */
  submitted: (number | null)[];
  tries: number;
}

export function newQuizState(questionCount: number): QuizState {
  return {
    answers: new Array<number | null>(questionCount).fill(null),
    submitted: new Array<number | null>(questionCount).fill(null),
    tries: 0,
  };
}

/** A right answer locks after the Try that submitted it; wrong ones stay editable. */
export function isLocked(state: QuizState, questions: QuizQuestion[], index: number): boolean {
  return state.submitted[index] !== null && state.submitted[index] === questions[index]?.correctIndex;
}

export function selectAnswer(
  state: QuizState,
  questions: QuizQuestion[],
  index: number,
  choice: number,
): QuizState {
  if (index < 0 || index >= questions.length) return state;
  if (choice < 0 || choice >= questions[index]!.choices.length) return state;
  if (isLocked(state, questions, index) || isDone(state, questions)) return state;
  const answers = state.answers.slice();
  answers[index] = choice;
  return { ...state, answers };
}

export function allAnswered(state: QuizState): boolean {
  return state.answers.every((a) => a !== null);
}

/** One whole-quiz submission = one Try. No-op unless all answered and Tries remain. */
export function submitTry(state: QuizState, questions: QuizQuestion[]): QuizState {
  if (!allAnswered(state) || isDone(state, questions)) return state;
  return { ...state, submitted: state.answers.slice(), tries: state.tries + 1 };
}

export function passed(state: QuizState, questions: QuizQuestion[]): boolean {
  return (
    state.tries > 0 && questions.every((q, i) => state.submitted[i] === q.correctIndex)
  );
}

/** Done = passed or out of Tries (the Answer Key shows either way). */
export function isDone(state: QuizState, questions: QuizQuestion[]): boolean {
  return passed(state, questions) || state.tries >= MAX_TRIES;
}

/* — Persistence — one key per quiz so Reset can wipe them all by prefix. */

const KEY_PREFIX = "genie.quiz.";

function quizKey(id: string): string {
  return `${KEY_PREFIX}${id}.v1`;
}

export function saveQuizState(id: string, state: QuizState): void {
  localStorage.setItem(quizKey(id), JSON.stringify(state));
}

export function loadQuizState(id: string, questionCount: number): QuizState {
  try {
    const raw = localStorage.getItem(quizKey(id));
    if (raw === null) return newQuizState(questionCount);
    const parsed: unknown = JSON.parse(raw);
    if (!isValidState(parsed, questionCount)) return newQuizState(questionCount);
    return parsed;
  } catch {
    return newQuizState(questionCount);
  }
}

function isValidState(value: unknown, questionCount: number): value is QuizState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const validSlots = (arr: unknown): arr is (number | null)[] =>
    Array.isArray(arr) &&
    arr.length === questionCount &&
    arr.every((a) => a === null || (Number.isInteger(a) && (a as number) >= 0));
  return (
    validSlots(v.answers) &&
    validSlots(v.submitted) &&
    Number.isInteger(v.tries) &&
    (v.tries as number) >= 0 &&
    (v.tries as number) <= MAX_TRIES
  );
}

/** Wipe every quiz's state (Chapter Quizzes and the Final Exam alike). */
export function clearQuizState(): void {
  const doomed: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== null && key.startsWith(KEY_PREFIX)) doomed.push(key);
  }
  for (const key of doomed) localStorage.removeItem(key);
}
