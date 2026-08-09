/**
 * Quiz UI — renders a QuizSpec into a host element and runs the whole
 * Try/lock/Answer Key loop against src/lib/quiz.ts. Results never rely on
 * color alone: every mark pairs ✓/✕ with a word (docs/GLOSSARY.md: Try).
 * Navigation is the host's job — Section Links call back out.
 */

import {
  MAX_TRIES,
  allAnswered,
  isDone,
  isLocked,
  loadQuizState,
  passed,
  saveQuizState,
  selectAnswer,
  submitTry,
  type QuizSpec,
  type SectionRef,
} from "../lib/quiz";

export interface QuizHooks {
  /** Fires after every interaction; `done` = passed or Answer Key visible. */
  onChange?: (done: boolean) => void;
  /** Section Link tapped — the host decides how to get there. */
  onSectionLink?: (ref: SectionRef) => void;
}

export function renderQuiz(host: HTMLElement, spec: QuizSpec, hooks: QuizHooks = {}): void {
  const { questions } = spec;
  let state = loadQuizState(spec.id, questions.length);

  const mark = (right: boolean): string =>
    right
      ? `<span class="quiz__mark quiz__mark--right">✓ right</span>`
      : `<span class="quiz__mark quiz__mark--wrong">✕ not yet</span>`;

  const draw = (): void => {
    const done = isDone(state, questions);
    const win = passed(state, questions);

    const questionsHTML = questions
      .map((q, i) => {
        const locked = isLocked(state, questions, i);
        const choices = q.choices
          .map((choice, c) => {
            const wasSubmitted = state.tries > 0 && state.submitted[i] === c;
            const status = !wasSubmitted ? "" : c === q.correctIndex ? "--right" : "--wrong";
            return `
              <label class="quiz__choice ${status ? `quiz__choice${status}` : ""}">
                <input type="radio" name="quiz-${spec.id}-q${i}" value="${c}"
                  ${state.answers[i] === c ? "checked" : ""}
                  ${locked || done ? "disabled" : ""}>
                <span>${choice}</span>
                ${wasSubmitted ? mark(c === q.correctIndex) : ""}
              </label>`;
          })
          .join("");
        return `
          <fieldset class="quiz__q" data-q="${i}">
            <legend class="quiz__prompt">${i + 1}. ${q.prompt}</legend>
            ${choices}
          </fieldset>`;
      })
      .join("");

    const keyHTML = !done
      ? ""
      : `
        <section class="quiz__key" data-answer-key>
          <h4>Answer Key</h4>
          ${
            win
              ? ""
              : `<p class="dim">Three tries in — here's the key. No shame; it took me centuries to learn this stuff.</p>`
          }
          ${questions
            .map(
              (q, i) => `
            <div class="quiz__key-item">
              <p class="quiz__key-q">${i + 1}. ${q.prompt}</p>
              <p class="quiz__key-a"><span class="quiz__mark quiz__mark--right">✓</span> ${q.choices[q.correctIndex]}</p>
              <p class="quiz__key-why">${q.explain}</p>
              <button class="quiz__link" data-section-link="${i}">Show me that part again</button>
            </div>`,
            )
            .join("")}
        </section>`;

    host.innerHTML = `
      <section class="quiz" aria-label="Chapter quiz">
        <h3 class="quiz__title">Quick quiz</h3>
        ${
          done
            ? win
              ? `<p class="quiz__result">✓ Nailed it — the chapter's yours.</p>`
              : ""
            : `<p class="quiz__tries">${questions.length} questions to wrap the chapter. Try ${state.tries + 1} of ${MAX_TRIES} — no stakes, the lamp doesn't judge.</p>`
        }
        ${questionsHTML}
        ${
          done
            ? ""
            : `<button class="btn btn--primary" data-quiz-submit ${allAnswered(state) ? "" : "disabled"}>
                ${state.tries === 0 ? "Check my answers" : "Check again"}
              </button>`
        }
        ${keyHTML}
      </section>`;

    host.querySelectorAll<HTMLInputElement>("input[type=radio]").forEach((input) => {
      input.addEventListener("change", () => {
        const q = Number(input.closest<HTMLElement>("[data-q]")!.dataset.q);
        state = selectAnswer(state, questions, q, Number(input.value));
        saveQuizState(spec.id, state);
        draw();
        hooks.onChange?.(isDone(state, questions));
      });
    });

    host.querySelector<HTMLButtonElement>("[data-quiz-submit]")?.addEventListener("click", () => {
      state = submitTry(state, questions);
      saveQuizState(spec.id, state);
      draw();
      hooks.onChange?.(isDone(state, questions));
    });

    host.querySelectorAll<HTMLButtonElement>("[data-section-link]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const q = questions[Number(btn.dataset.sectionLink)];
        if (q) hooks.onSectionLink?.(q.sectionRef);
      });
    });
  };

  draw();
}
