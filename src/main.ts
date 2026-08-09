import "./style.css";
import { chapters } from "./chapters/index";
import {
  CHAPTER_COUNT,
  completeChapter,
  loadCurrent,
  statusOf,
} from "./lib/progress";
import { isDone, loadQuizState, type SectionRef } from "./lib/quiz";
import { clearAllState } from "./lib/reset";
import { renderQuizDemo } from "./quiz/demo";
import { renderQuiz } from "./quiz/quiz-ui";

const app = document.querySelector<HTMLDivElement>("#app")!;

let current = loadCurrent(); // furthest unlocked chapter (Resume)
let view = current; // chapter on screen
let quizReturn: number | null = null; // view a Section Link jumped away from

function render(): void {
  // Each chapter starts at the top — otherwise tapping Continue at the bottom
  // of one chapter lands mid-page in the next.
  window.scrollTo(0, 0);
  const chapter = chapters[view]!;
  const quiz = chapter.quiz?.();
  // The Quiz completes the Chapter: forward stays off until pass or Answer Key.
  const quizDone = quiz
    ? isDone(loadQuizState(quiz.id, quiz.questions.length), quiz.questions)
    : true;
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
    ${quiz ? `<section class="quiz-slot" data-quiz-slot></section>` : ""}
    <nav class="nav">
      ${view === 0 ? "" : `<button class="btn btn--ghost" data-nav="back">Back</button>`}
      ${
        hideForward
          ? ""
          : `<button class="btn btn--primary" data-nav="forward"
        ${view === current && !quizDone ? "disabled" : ""}>
        ${view < current ? "Continue" : view === CHAPTER_COUNT - 1 ? "Finish" : "Complete chapter"}
      </button>`
      }
    </nav>
    ${quizReturn === null ? "" : `<button class="btn btn--primary quiz-return" data-quiz-return>Back to the quiz</button>`}
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
    gotoSection,
  });

  if (quiz) {
    renderQuiz(app.querySelector<HTMLElement>("[data-quiz-slot]")!, quiz, {
      onChange: (done) => {
        // Enable forward in place — a full render() would scroll to top
        // mid-quiz.
        const forward = app.querySelector<HTMLButtonElement>('[data-nav="forward"]');
        if (forward && view === current) forward.disabled = !done;
      },
      onSectionLink: (ref) => {
        gotoSection(ref);
      },
    });
  }

  app.querySelector<HTMLButtonElement>('[data-nav="back"]')?.addEventListener("click", () => {
    if (view > 0) {
      quizReturn = null;
      view -= 1;
      render();
    }
  });

  app.querySelector<HTMLButtonElement>('[data-nav="forward"]')?.addEventListener("click", () => {
    quizReturn = null;
    if (view === current) {
      current = completeChapter(view, current);
      view = current;
    } else if (view < current) {
      view += 1; // re-reading a complete chapter; forward never passes current
    }
    render();
  });

  app.querySelector<HTMLButtonElement>("[data-quiz-return]")?.addEventListener("click", () => {
    const back = quizReturn!;
    quizReturn = null;
    view = back;
    render();
    app.querySelector("[data-quiz-slot]")?.scrollIntoView({ block: "start" });
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

/** Section Link: jump to the teaching section, leaving a way back to the quiz. */
function gotoSection(ref: SectionRef): void {
  if (ref.chapter > current) return; // a Section Link never unlocks forward
  quizReturn = view;
  view = ref.chapter;
  render();
  document.getElementById(ref.anchor)?.scrollIntoView({ block: "start" });
}

if (new URLSearchParams(location.search).has("quiz-demo")) {
  renderQuizDemo(app);
} else {
  render();
}
