/**
 * Genie Note engine — tappable terms opening a single in-voice popup
 * (docs/GLOSSARY.md: Genie Note, Deeper Dive). Chapters render triggers via
 * noteRef() inside their template strings; one document-level controller
 * (initGenieNotes) drives every trigger, so chapter re-renders need no
 * re-wiring. The popup is a singleton fixed bottom sheet: one open at a
 * time for free, and zero layout shift.
 */

import { getNote } from "./registry";

/** Trigger markup for a registered note; unknown ids degrade to plain text. */
export function noteRef(id: string, display?: string): string {
  const note = getNote(id);
  if (!note) return display ?? id;
  return `<button type="button" class="genie-note" data-genie-note="${id}" aria-expanded="false">${display ?? note.term}</button>`;
}

let popup: HTMLElement | null = null;
let openTrigger: HTMLElement | null = null;

function ensurePopup(): HTMLElement {
  if (popup) return popup;
  popup = document.createElement("div");
  popup.className = "genie-note-popup";
  popup.setAttribute("role", "dialog");
  popup.hidden = true;
  document.body.appendChild(popup);
  return popup;
}

export function closeGenieNote(): void {
  if (popup) popup.hidden = true;
  openTrigger?.setAttribute("aria-expanded", "false");
  openTrigger = null;
}

function openGenieNote(trigger: HTMLElement): void {
  const id = trigger.dataset.genieNote!;
  const note = getNote(id);
  if (!note) return;
  const el = ensurePopup();
  el.setAttribute("aria-label", note.term);
  el.innerHTML = `
    <div class="genie-note-popup__head">
      <p class="genie-note-popup__term">${note.term}</p>
      <button type="button" class="genie-note-popup__close" data-note-close aria-label="Close note">✕</button>
    </div>
    <p class="genie-note-popup__body">${note.body}</p>
    ${
      note.dive
        ? `<a class="genie-note-popup__dive" href="${note.dive.url}" target="_blank" rel="noopener">${note.dive.label} ↗</a>`
        : ""
    }
  `;
  openTrigger?.setAttribute("aria-expanded", "false");
  openTrigger = trigger;
  trigger.setAttribute("aria-expanded", "true");
  el.hidden = false;
}

let controller: AbortController | null = null;

export function initGenieNotes(): void {
  if (controller) return;
  controller = new AbortController();
  const { signal } = controller;

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const trigger = target.closest<HTMLElement>("[data-genie-note]");
    if (trigger) {
      if (trigger === openTrigger) closeGenieNote();
      else openGenieNote(trigger);
      return;
    }
    if (target.closest("[data-note-close]")) {
      const back = openTrigger;
      closeGenieNote();
      back?.focus();
      return;
    }
    if (!target.closest(".genie-note-popup")) closeGenieNote(); // tap-outside
  }, { signal });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openTrigger) {
      const back = openTrigger;
      closeGenieNote();
      back.focus();
    }
  }, { signal });

  // Scroll-away dismisses; the sheet is fixed, so scrolling means she's reading on.
  window.addEventListener("scroll", () => closeGenieNote(), { passive: true, signal });

  // Desktop bonus: hover opens without a click.
  if (typeof matchMedia !== "undefined" && matchMedia("(hover: hover)").matches) {
    document.addEventListener("mouseover", (e) => {
      const trigger = (e.target as HTMLElement).closest<HTMLElement>("[data-genie-note]");
      if (trigger && trigger !== openTrigger) openGenieNote(trigger);
    }, { signal });
  }
}

/** Test seam: drop listeners and forget the singleton between DOM resets. */
export function resetGenieNotesForTest(): void {
  controller?.abort();
  controller = null;
  popup = null;
  openTrigger = null;
}
