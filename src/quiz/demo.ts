/**
 * Demo quiz (?quiz-demo) — a standalone route that exercises the whole
 * engine end to end without touching real Chapter content (that lands with
 * WHI-96/97). The Playwright spec drives this page.
 */

import type { QuizSpec } from "../lib/quiz";
import { renderQuiz } from "./quiz-ui";

const DEMO_ANCHOR = "demo-lamp-rules";

export const demoQuiz: QuizSpec = {
  id: "demo",
  questions: [
    {
      prompt: "How many Tries does a Quiz give you?",
      choices: ["One — no pressure", "Three", "Seven, like the chapters"],
      correctIndex: 1,
      explain: "Three tries, zero judgment — then I hand you the Answer Key anyway.",
      sectionRef: { chapter: 0, anchor: DEMO_ANCHOR },
    },
    {
      prompt: "What happens to a wrong answer after a Try?",
      choices: ["It locks forever", "It stays editable", "The lamp confiscates it"],
      correctIndex: 1,
      explain: "Wrong answers stay open for another go; right ones lock in green.",
      sectionRef: { chapter: 0, anchor: DEMO_ANCHOR },
    },
    {
      prompt: "What does a Section Link do?",
      choices: ["Opens a new tab", "Jumps back to the part that taught it", "Resets the quiz"],
      correctIndex: 1,
      explain: "Straight back to the teaching — your quiz waits exactly as you left it.",
      sectionRef: { chapter: 0, anchor: DEMO_ANCHOR },
    },
  ],
};

export function renderQuizDemo(app: HTMLElement): void {
  app.innerHTML = `
    <main class="chapter">
      <p class="chapter__kicker">Demo</p>
      <h2 class="chapter__title">The Lamp Rules</h2>
      <section id="${DEMO_ANCHOR}" class="speech">
        <p>House rules, straight from the lamp: every Quiz gives you
        <strong>three Tries</strong>. After each one, right answers lock in
        green and wrong answers stay editable. Pass — or run out of Tries —
        and the Answer Key appears, with a Section Link back to the part
        that taught it.</p>
      </section>
      <section class="quiz-slot" data-quiz-slot></section>
    </main>
  `;
  renderQuiz(app.querySelector<HTMLElement>("[data-quiz-slot]")!, demoQuiz, {
    onSectionLink: (ref) => {
      document.getElementById(ref.anchor)?.scrollIntoView({ block: "start" });
    },
  });
}
