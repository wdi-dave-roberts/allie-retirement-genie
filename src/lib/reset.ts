/**
 * Reset — full wipe back to first-open (docs/GLOSSARY.md). Each store clears
 * its own keys; this just asks all of them, so a new store only has to add
 * itself here to be covered.
 */

import { clearChecklist } from "../chapters/ch7-lever-room";
import { clearEnrollment } from "./enrollment";
import { clearProfile } from "./profile";
import { clearProgress } from "./progress";

export function clearAllState(): void {
  clearProfile();
  clearProgress();
  clearEnrollment();
  clearChecklist();
}
