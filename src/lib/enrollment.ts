/**
 * The "I'm in" promise from Chapter 3 — read by Chapter 7's Action Checklist.
 */

const KEY = "genie.enrolled.v1";

export function isEnrolled(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setEnrolled(value: boolean): void {
  localStorage.setItem(KEY, value ? "1" : "0");
}
