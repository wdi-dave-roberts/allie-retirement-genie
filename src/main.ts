import "./style.css";
import { chapters } from "./chapters/index";
import {
  CHAPTER_COUNT,
  completeChapter,
  loadCurrent,
  statusOf,
} from "./lib/progress";
import { clearAllState } from "./lib/reset";

const app = document.querySelector<HTMLDivElement>("#app")!;

let current = loadCurrent(); // furthest unlocked chapter (Resume)
let view = current; // chapter on screen

function render(): void {
  // Each chapter starts at the top — otherwise tapping Continue at the bottom
  // of one chapter lands mid-page in the next.
  window.scrollTo(0, 0);
  const chapter = chapters[view]!;
  // Self-paced chapters (e.g. Chapter 1 intake) drive their own completion.
  const hideForward = chapter.selfPaced === true && view === current;
  app.innerHTML = `
    <div class="progress" role="progressbar" aria-valuemin="0"
      aria-valuemax="${CHAPTER_COUNT}" aria-valuenow="${current}"
      aria-label="Chapter progress">
      ${chapters
        .map((_, i) => `<div class="progress__seg progress__seg--${statusOf(i, current)}"></div>`)
        .join("")}
    </div>
    <main class="chapter" data-chapter-id="${chapter.id}"></main>
    <nav class="nav">
      ${view === 0 ? "" : `<button class="btn btn--ghost" data-nav="back">Back</button>`}
      ${
        hideForward
          ? ""
          : `<button class="btn btn--primary" data-nav="forward">
        ${view < current ? "Continue" : view === CHAPTER_COUNT - 1 ? "Finish" : "Complete chapter"}
      </button>`
      }
    </nav>
    <footer class="reset">
      <button class="reset__link" data-reset>Start over</button>
    </footer>
    <dialog class="reset__dialog" data-reset-dialog>
      <p>Rub the lamp again? Everything starts over — your numbers, your progress, all of it.</p>
      <form method="dialog" class="reset__actions">
        <button value="cancel" class="btn btn--ghost" autofocus>Keep my future</button>
        <button value="confirm" class="btn btn--danger">Start over</button>
      </form>
    </dialog>
  `;

  chapter.render(app.querySelector<HTMLElement>(".chapter")!, {
    complete: () => {
      if (view === current) {
        current = completeChapter(view, current);
        view = current;
        render();
      }
    },
  });

  app.querySelector<HTMLButtonElement>('[data-nav="back"]')?.addEventListener("click", () => {
    if (view > 0) {
      view -= 1;
      render();
    }
  });

  app.querySelector<HTMLButtonElement>('[data-nav="forward"]')?.addEventListener("click", () => {
    if (view === current) {
      current = completeChapter(view, current);
      view = current;
    } else if (view < current) {
      view += 1; // re-reading a complete chapter; forward never passes current
    }
    render();
  });

  const dialog = app.querySelector<HTMLDialogElement>("[data-reset-dialog]")!;
  app.querySelector<HTMLButtonElement>("[data-reset]")!.addEventListener("click", () => {
    dialog.showModal();
  });
  dialog.addEventListener("close", () => {
    if (dialog.returnValue === "confirm") {
      clearAllState();
      location.reload(); // land on Chapter 1 intake with no stale in-memory state
    }
  });
}

render();
