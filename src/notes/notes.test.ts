// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { closeGenieNote, initGenieNotes, noteRef, resetGenieNotesForTest } from "./genie-note";
import { getNote } from "./registry";

const click = (el: Element): void => {
  el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
};

const popup = (): HTMLElement => document.querySelector<HTMLElement>(".genie-note-popup")!;

describe("registry", () => {
  it("looks up known notes and misses unknown ids", () => {
    expect(getNote("demo-compounding")?.term).toBe("compound growth");
    expect(getNote("demo-compounding")?.dive?.url).toContain("investopedia");
    expect(getNote("demo-real-dollars")?.dive).toBeUndefined();
    expect(getNote("nope")).toBeUndefined();
  });
});

describe("noteRef", () => {
  it("renders a trigger for known notes and degrades to text for unknown ids", () => {
    expect(noteRef("demo-compounding")).toContain('data-genie-note="demo-compounding"');
    expect(noteRef("demo-compounding")).toContain('aria-expanded="false"');
    expect(noteRef("demo-compounding", "the magic")).toContain(">the magic<");
    expect(noteRef("nope")).toBe("nope"); // no dead trigger for missing content
    expect(noteRef("nope", "still prose")).toBe("still prose");
  });
});

describe("open/close", () => {
  beforeEach(() => {
    resetGenieNotesForTest();
    document.body.innerHTML = `
      <p>${noteRef("demo-compounding")} and ${noteRef("demo-real-dollars")}</p>
      <p id="outside">elsewhere</p>
    `;
    initGenieNotes();
  });

  it("opens on tap, marks the trigger expanded, closes on tap-outside", () => {
    const [t1] = document.querySelectorAll<HTMLElement>("[data-genie-note]");
    click(t1!);
    expect(popup().hidden).toBe(false);
    expect(popup().textContent).toContain("compound growth");
    expect(t1!.getAttribute("aria-expanded")).toBe("true");

    click(document.getElementById("outside")!);
    expect(popup().hidden).toBe(true);
    expect(t1!.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps one note open at a time", () => {
    const [t1, t2] = document.querySelectorAll<HTMLElement>("[data-genie-note]");
    click(t1!);
    click(t2!);
    expect(document.querySelectorAll(".genie-note-popup").length).toBe(1);
    expect(popup().textContent).toContain("Real Dollars");
    expect(t1!.getAttribute("aria-expanded")).toBe("false");
    expect(t2!.getAttribute("aria-expanded")).toBe("true");
  });

  it("re-tapping the open trigger, the close control, and Escape all close", () => {
    const [t1] = document.querySelectorAll<HTMLElement>("[data-genie-note]");
    click(t1!);
    click(t1!); // toggle
    expect(popup().hidden).toBe(true);

    click(t1!);
    click(popup().querySelector("[data-note-close]")!);
    expect(popup().hidden).toBe(true);

    click(t1!);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(popup().hidden).toBe(true);

    click(t1!);
    closeGenieNote();
    expect(popup().hidden).toBe(true);
  });

  it("renders the Deeper Dive link safely, and only when the note has one", () => {
    const [t1, t2] = document.querySelectorAll<HTMLElement>("[data-genie-note]");
    click(t1!);
    const dive = popup().querySelector<HTMLAnchorElement>(".genie-note-popup__dive")!;
    expect(dive.target).toBe("_blank");
    expect(dive.rel).toContain("noopener");

    click(t2!);
    expect(popup().querySelector(".genie-note-popup__dive")).toBeNull();
  });
});
