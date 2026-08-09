/**
 * Chapter registry — all 7 Chapters (WHI-76..82). Chapters consume design
 * tokens via classes only; no colors live in chapter code.
 */

import type { QuizSpec, SectionRef } from "../lib/quiz";
import { chapter1 } from "./ch1-meet-the-genie";
import { chapter2 } from "./ch2-the-curve";
import { chapter3 } from "./ch3-free-money";
import { chapter4 } from "./ch4-paycheck";
import { chapter5 } from "./ch5-roth";
import { chapter6 } from "./ch6-where-money-lives";
import { chapter7 } from "./ch7-lever-room";

export interface ChapterContext {
  /** Mark this chapter complete and advance (no-op unless it is current). */
  complete(): void;
  /** Cross-chapter Section Link jump, with a way back (Final Exam links). */
  gotoSection?(ref: SectionRef): void;
}

export interface Chapter {
  id: string;
  title: string;
  /** Self-paced chapters drive their own completion; the shell hides its button. */
  selfPaced?: boolean;
  /**
   * End-of-chapter Quiz; completing it (pass or Answer Key seen) is what
   * completes the Chapter. Built at render time so questions can use the
   * live Profile.
   */
  quiz?: () => QuizSpec;
  render(root: HTMLElement, ctx: ChapterContext): void;
}

export const chapters: Chapter[] = [
  chapter1,
  chapter2,
  chapter3,
  chapter4,
  chapter5,
  chapter6,
  chapter7,
];
