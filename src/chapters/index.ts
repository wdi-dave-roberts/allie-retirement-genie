/**
 * Chapter registry — 7 Chapters, placeholder content for now. Real content
 * lands in the per-chapter issues (WHI-76..82). Placeholders consume design
 * tokens via classes only; no colors live in chapter code.
 */

import { genieSVG, type GeniePose } from "../genie/genie";
import { chapter1 } from "./ch1-meet-the-genie";
import { chapter2 } from "./ch2-the-curve";
import { chapter3 } from "./ch3-free-money";
import { chapter5 } from "./ch5-roth";
import { chapter7 } from "./ch7-lever-room";

export interface ChapterContext {
  /** Mark this chapter complete and advance (no-op unless it is current). */
  complete(): void;
}

export interface Chapter {
  id: string;
  title: string;
  /** Self-paced chapters drive their own completion; the shell hides its button. */
  selfPaced?: boolean;
  render(root: HTMLElement, ctx: ChapterContext): void;
}

function placeholder(kicker: string, title: string, line: string, pose: GeniePose): (root: HTMLElement) => void {
  return (root) => {
    root.innerHTML = `
      <div class="chapter__genie">${genieSVG(pose)}</div>
      <p class="chapter__kicker">${kicker}</p>
      <h2 class="chapter__title">${title}</h2>
      <div class="speech"><p>${line}</p></div>
      <p class="dim">Placeholder — this Chapter's real content is on its way.</p>
    `;
  };
}

export const chapters: Chapter[] = [
  chapter1,
  chapter2,
  chapter3,
  {
    id: "paycheck-bracket-myth",
    title: "Your Paycheck & the Bracket Myth",
    render: placeholder(
      "Chapter 4",
      "Your Paycheck & the Bracket Myth",
      "A raise never lowers your take-home. Whoever told you that owes you a coffee.",
      "idle",
    ),
  },
  chapter5,
  {
    id: "where-money-lives",
    title: "Where Money Lives",
    render: placeholder(
      "Chapter 6",
      "Where Money Lives",
      "An account is a bucket, not an investment. What you put in the bucket is the magic.",
      "idle",
    ),
  },
  chapter7,
];
