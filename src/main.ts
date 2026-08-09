import "./style.css";
import { chapters } from "./chapters/index";
import {
  CHAPTER_COUNT,
  completeChapter,
  loadCurrent,
  statusOf,
} from "./lib/progress";

const app = document.querySelector<HTMLDivElement>("#app")!;

let current = loadCurrent(); // furthest unlocked chapter (Resume)
let view = current; // chapter on screen

function render(): void {
  app.innerHTML = `
    <div class="progress" role="progressbar" aria-valuemin="0"
      aria-valuemax="${CHAPTER_COUNT}" aria-valuenow="${current}"
      aria-label="Chapter progress">
      ${chapters
        .map((_, i) => `<div class="progress__seg progress__seg--${statusOf(i, current)}"></div>`)
        .join("")}
    </div>
    <main class="chapter" data-chapter-id="${chapters[view]!.id}"></main>
    <nav class="nav">
      <button class="btn btn--ghost" data-nav="back" ${view === 0 ? "disabled" : ""}>Back</button>
      <button class="btn btn--primary" data-nav="forward"
        ${view === CHAPTER_COUNT - 1 && view < current ? "disabled" : ""}>
        ${view < current ? "Continue" : view === CHAPTER_COUNT - 1 ? "Finish" : "Complete chapter"}
      </button>
    </nav>
  `;

  chapters[view]!.render(app.querySelector<HTMLElement>(".chapter")!);

  app.querySelector<HTMLButtonElement>('[data-nav="back"]')!.addEventListener("click", () => {
    if (view > 0) {
      view -= 1;
      render();
    }
  });

  app.querySelector<HTMLButtonElement>('[data-nav="forward"]')!.addEventListener("click", () => {
    if (view === current) {
      current = completeChapter(view, current);
      view = current;
    } else if (view < current) {
      view += 1; // re-reading a complete chapter; forward never passes current
    }
    render();
  });
}

render();
