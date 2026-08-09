import { describe, expect, it } from "vitest";
import { fieldHTML, parseAmount, QUESTIONS, spendExceedsIncome, validateField } from "./ch1-meet-the-genie";

describe("parseAmount", () => {
  it("parses plain and formatted amounts", () => {
    expect(parseAmount("65000")).toBe(65000);
    expect(parseAmount("$65,000")).toBe(65000);
    expect(parseAmount(" 6% ")).toBe(6);
    expect(parseAmount("1234.56")).toBe(1234.56);
  });

  it("rejects junk", () => {
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("banana")).toBeNull();
    expect(parseAmount("12abc")).toBeNull();
  });
});

describe("validateField", () => {
  it("accepts sane values", () => {
    expect(validateField("salary", "$65,000")).toBeNull();
    expect(validateField("monthlySpend", "3200")).toBeNull();
    expect(validateField("currentSavings", "0")).toBeNull();
    expect(validateField("matchPercent", "6")).toBeNull();
  });

  it("rejects non-numbers with a friendly line", () => {
    expect(validateField("salary", "a lot")).toMatch(/number/i);
  });

  it("rejects zero where a positive number is required", () => {
    expect(validateField("salary", "0")).not.toBeNull();
    expect(validateField("monthlySpend", "0")).not.toBeNull();
  });

  it("allows zero savings and zero match", () => {
    expect(validateField("currentSavings", "0")).toBeNull();
    expect(validateField("matchPercent", "0")).toBeNull();
  });

  it("rejects negatives and absurd highs", () => {
    expect(validateField("currentSavings", "-5")).not.toBeNull();
    expect(validateField("salary", "9999999999")).not.toBeNull();
    expect(validateField("matchPercent", "80")).not.toBeNull();
  });
});

describe("fieldHTML", () => {
  const savings = QUESTIONS.find((q) => q.key === "currentSavings")!;

  it("hides zero during intake (empty = unanswered)", () => {
    expect(fieldHTML(savings, 0, false)).toContain('value=""');
  });

  it("renders stored zero verbatim in edit mode (regression: zero savings blocked all edits)", () => {
    expect(fieldHTML(savings, 0, false, true)).toContain('value="0"');
  });
});

describe("spendExceedsIncome", () => {
  it("trips only when spend x 12 exceeds salary", () => {
    expect(spendExceedsIncome(40000, 9000)).toBe(true);
    expect(spendExceedsIncome(85000, 3800)).toBe(false);
    expect(spendExceedsIncome(48000, 4000)).toBe(false); // exactly equal — no nudge
    expect(spendExceedsIncome(0, 5000)).toBe(false); // no salary yet, nothing to compare
  });
});
