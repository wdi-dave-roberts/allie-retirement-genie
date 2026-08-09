/**
 * Chapter 7 — Lever Room & Action Checklist. The finale: three levers driving
 * a live Real-Dollars projection, then the concrete steps to enroll, then a
 * note from 65-year-old Allie. All growth composed from src/lib/projection.ts.
 */

import { genieSVG } from "../genie/genie";
import { lineChart } from "../lib/chart";
import { isEnrolled, isRothCheckFlagged } from "../lib/enrollment";
import { formatMoney } from "../lib/format";
import { loadProfile, type Profile } from "../lib/profile";
import {
  contributionMonthly,
  employerMatchMonthly,
  futureValueOfStream,
} from "../lib/projection";
import { confetti } from "./ch3-free-money";

export const CURRENT_AGE = 32;

export interface Levers {
  contributionPercent: number; // 0-20
  retireAge: number; // 55-70
  raisePercent: number; // 0-5 annual salary growth
}

export interface LeverResult {
  balance: number;
  /** [age, balance] per year from 32 to retireAge. */
  points: Array<[number, number]>;
}

/**
 * Year-by-year composition of projection-lib primitives: each year's level
 * contribution stream is accumulated, then the whole balance compounds
 * forward. With raisePercent = 0 this equals the closed-form lib output.
 */
export function leverProjection(profile: Profile, levers: Levers): LeverResult {
  const years = levers.retireAge - CURRENT_AGE;
  const monthlyRate = 0.07 / 12;
  const points: Array<[number, number]> = [[CURRENT_AGE, profile.currentSavings]];
  let balance = profile.currentSavings;
  let salary = profile.salary;
  for (let y = 0; y < years; y++) {
    const monthly =
      contributionMonthly(salary, levers.contributionPercent) +
      employerMatchMonthly(salary, levers.contributionPercent, profile.matchPercent);
    balance = balance * Math.pow(1 + monthlyRate, 12) + futureValueOfStream(monthly, 12);
    salary *= 1 + levers.raisePercent / 100;
    points.push([CURRENT_AGE + y + 1, balance]);
  }
  return { balance, points };
}

interface Checklist {
  login: boolean;
  enroll: boolean;
  match: boolean;
  roth: boolean;
  fund: boolean;
  doneBy: string;
}

const CHECKLIST_KEY = "genie.checklist.v1";

export function loadChecklist(): Checklist {
  const empty: Checklist = { login: false, enroll: false, match: false, roth: false, fund: false, doneBy: "" };
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    return raw ? { ...empty, ...(JSON.parse(raw) as Partial<Checklist>) } : empty;
  } catch {
    return empty;
  }
}

function saveChecklist(c: Checklist): void {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(c));
}

export function clearChecklist(): void {
  localStorage.removeItem(CHECKLIST_KEY);
}

function defaultDoneBy(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export const chapter7 = {
  id: "lever-room",
  title: "Lever Room & Action Checklist",
  // The story ends here: setting a done-by date is the finale. A "Finish"
  // button can't advance anywhere (progress clamps at the last chapter), so
  // let the chapter own its ending like Chapter 1 owns its intake.
  selfPaced: true,
  render(root: HTMLElement): void {
    const profile = loadProfile();
    if (profile.salary <= 0) {
      root.innerHTML = `
        <div class="chapter__genie">${genieSVG("idle")}</div>
        <p class="chapter__kicker">Chapter 7</p>
        <h2 class="chapter__title">Lever Room</h2>
        <div class="speech"><p>The levers need your numbers. Chapter 1 first — then come pull things.</p></div>
      `;
      return;
    }

    const levers: Levers = {
      contributionPercent: isEnrolled() ? Math.max(6, profile.matchPercent) : 6,
      retireAge: 65,
      raisePercent: 2,
    };

    root.innerHTML = `
      <div class="chapter__genie">${genieSVG("celebrate")}</div>
      <p class="chapter__kicker">Chapter 7</p>
      <h2 class="chapter__title">Lever Room</h2>
      <div class="speech"><p>Every lever in here is yours. Pull.</p></div>
      <div class="lever">
        <label>Contribution <strong data-lv="contrib"></strong>
          <input type="range" min="0" max="20" step="1" value="${levers.contributionPercent}" data-lever="contributionPercent" /></label>
        <label>Retire at <strong data-lv="age"></strong>
          <input type="range" min="55" max="70" step="1" value="${levers.retireAge}" data-lever="retireAge" /></label>
        <label>Raises <strong data-lv="raise"></strong>/yr
          <input type="range" min="0" max="5" step="0.5" value="${levers.raisePercent}" data-lever="raisePercent" /></label>
      </div>
      <div class="reveal reveal--instant">
        <p class="reveal__number" data-balance></p>
        <p>yours at <span data-retire-age></span>, in today's dollars</p>
      </div>
      <figure class="curve" data-chart></figure>
      <h2>The Action Checklist</h2>
      <div class="speech"><p>Playtime's over — here's the whole ritual. Twenty minutes, one lifetime of difference.</p></div>
      <ul class="checklist" data-checklist></ul>
      <label class="doneby">Done by
        <input type="date" data-doneby />
      </label>
      <div class="finale" data-finale hidden>
        <div class="chapter__genie">${genieSVG("celebrate")}</div>
        <div class="speech"><p data-note></p></div>
        <p class="reveal__number">✨</p>
        <p>That's my one wish, granted. Go get your raise, Allie.</p>
      </div>
    `;

    const q = <T extends HTMLElement>(s: string): T => root.querySelector(s) as T;
    const checklist = loadChecklist();

    const items = (): Array<{ key: keyof Checklist; label: string; note?: string }> => [
      { key: "login", label: "Log in to your 401k provider (the enrollment email HR sent — it's in there somewhere)" },
      { key: "enroll", label: `Enroll at ${levers.contributionPercent}% — your Lever Room number` },
      {
        key: "match",
        label: "Confirm the actual match formula and vesting schedule",
        note: "Vesting is just how long you stay before their match is fully yours if you leave. Your own money? Yours from day one, always.",
      },
      { key: "roth", label: isRothCheckFlagged() ? "Check the Roth 401k box (you flagged this in Chapter 5)" : "Ask whether the plan has a Roth option" },
      { key: "fund", label: "Pick the target-date fund closest to 2059" },
    ];

    const drawChecklist = (): void => {
      q("[data-checklist]").innerHTML = items()
        .map(
          (it) => `
        <li class="checklist__item ${checklist[it.key] ? "checklist__item--done" : ""}">
          <label><input type="checkbox" data-check="${it.key}" ${checklist[it.key] ? "checked" : ""} /> ${it.label}</label>
          ${it.note ? `<p class="checklist__note">${it.note}</p>` : ""}
        </li>`,
        )
        .join("");
      for (const box of root.querySelectorAll<HTMLInputElement>("[data-check]")) {
        box.addEventListener("change", () => {
          (checklist[box.dataset.check as keyof Checklist] as boolean) = box.checked;
          saveChecklist(checklist);
          drawChecklist();
        });
      }
    };

    const drawProjection = (): void => {
      const result = leverProjection(profile, levers);
      q("[data-lv='contrib']").textContent = `${levers.contributionPercent}%`;
      q("[data-lv='age']").textContent = String(levers.retireAge);
      q("[data-lv='raise']").textContent = `${levers.raisePercent}%`;
      q("[data-balance]").textContent = formatMoney(result.balance);
      q("[data-retire-age]").textContent = String(levers.retireAge);
      q("[data-chart]").innerHTML = lineChart({
        series: [{ points: result.points, className: "curve__line curve__line--now" }],
        label: `Projected balance from age ${CURRENT_AGE} to ${levers.retireAge}: ${formatMoney(result.balance)} in Real Dollars`,
      });
      const note = `Hey. It's you, at ${levers.retireAge}. The ${formatMoney(result.balance)} is real — I'm looking at it. It started the week you set a done-by date and stopped declining raises. Thank you for that. — Allie, ${2026 + levers.retireAge - CURRENT_AGE}`;
      q("[data-note]").textContent = note;
      drawChecklist(); // enroll-step label tracks the contribution slider
    };

    const finale = (fire: boolean): void => {
      const el = q("[data-finale]");
      const was = el.hidden;
      el.hidden = !checklist.doneBy;
      if (fire && was && !el.hidden) confetti(root);
    };

    for (const slider of root.querySelectorAll<HTMLInputElement>("[data-lever]")) {
      slider.addEventListener("input", () => {
        const key = slider.dataset.lever as keyof Levers;
        levers[key] = Number(slider.value);
        drawProjection();
      });
    }

    const doneBy = q<HTMLInputElement>("[data-doneby]");
    doneBy.value = checklist.doneBy || defaultDoneBy();
    doneBy.addEventListener("change", () => {
      checklist.doneBy = doneBy.value;
      saveChecklist(checklist);
      drawProjection();
      finale(true);
    });

    drawProjection();
    finale(false);
  },
};
