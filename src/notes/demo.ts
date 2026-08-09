/**
 * Genie Note demo (?note-demo) — a note in chapter prose and one in a chart
 * caption, per the WHI-99 acceptance criteria. Real chapter notes land with
 * WHI-100/101; the Playwright spec drives this page.
 */

import { noteRef } from "./genie-note";

export function renderNoteDemo(app: HTMLElement): void {
  app.innerHTML = `
    <main class="chapter">
      <p class="chapter__kicker">Demo</p>
      <h2 class="chapter__title">Genie Notes</h2>
      <div class="speech"><p>Money left alone grows by ${noteRef("demo-compounding")} — the dotted underline means I have more to say. Tap it. I'll keep it short; I know you're busy becoming rich.</p></div>
      <figure class="curve">
        <figcaption class="curve__legend">
          <span>all figures in ${noteRef("demo-real-dollars")}</span>
        </figcaption>
      </figure>
    </main>
  `;
}
