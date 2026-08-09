/**
 * Chapter registry — 7 Chapters, placeholder content for now. Real content
 * lands in the per-chapter issues (WHI-76..82). Placeholders consume design
 * tokens via classes only; no colors live in chapter code.
 */

import { genieSVG, type GeniePose } from "../genie/genie";
import { chapter2 } from "./ch2-the-curve";

export interface Chapter {
  id: string;
  title: string;
  render(root: HTMLElement): void;
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
  {
    id: "meet-the-genie",
    title: "Meet the Genie",
    render: placeholder(
      "Chapter 1",
      "Meet the Genie",
      "Hi. I live in a lamp and I know what you'll be worth in 2059. Want to peek?",
      "celebrate",
    ),
  },
  chapter2,
  {
    id: "free-money",
    title: "Free Money",
    render: placeholder(
      "Chapter 3",
      "Free Money",
      "Your employer is holding out cash and you haven't put your hand out. Let's fix that.",
      "point",
    ),
  },
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
  {
    id: "roth-vs-traditional",
    title: "Roth vs Traditional",
    render: placeholder(
      "Chapter 5",
      "Roth vs Traditional",
      "Two doors, same room. The only question is when the tax collector says hello.",
      "idle",
    ),
  },
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
  {
    id: "lever-room",
    title: "Lever Room & Action Checklist",
    render: placeholder(
      "Chapter 7",
      "Lever Room & Action Checklist",
      "Every lever in here is yours. Pull a few and watch your future move.",
      "celebrate",
    ),
  },
];
