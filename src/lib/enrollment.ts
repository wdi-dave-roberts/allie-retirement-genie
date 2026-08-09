/**
 * Promises Allie makes along the way, read by Chapter 7's Action Checklist:
 * the "I'm in" moment from Chapter 3 and the Roth-option check from Chapter 5.
 */

const KEY = "genie.enrolled.v1";
const ROTH_KEY = "genie.roth-check.v1";

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

export function isRothCheckFlagged(): boolean {
  try {
    return localStorage.getItem(ROTH_KEY) === "1";
  } catch {
    return false;
  }
}

export function setRothCheckFlagged(value: boolean): void {
  localStorage.setItem(ROTH_KEY, value ? "1" : "0");
}
