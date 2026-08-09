import { describe, expect, it } from "vitest";
import { lineChart } from "./chart";

function yCoords(svg: string): number[] {
  const points = svg.match(/points="([^"]+)"/)![1]!;
  return points.split(" ").map((pair) => Number(pair.split(",")[1]));
}

describe("lineChart", () => {
  it("scales a growing series between the padded top and bottom", () => {
    const svg = lineChart({
      series: [{ points: [[32, 0], [48, 5000], [65, 10_000]], className: "c" }],
      label: "growth",
    });
    const ys = yCoords(svg);
    expect(ys[0]).toBe(188); // height 200 - pad 12: zero sits on the floor
    expect(ys[2]).toBe(12); // max sits at the padded top
    expect(ys[1]).toBeGreaterThan(12);
    expect(ys[1]).toBeLessThan(188);
  });

  it("centers an all-zero series instead of pinning it to the floor (WHI-103)", () => {
    const svg = lineChart({
      series: [{ points: [[32, 0], [48, 0], [65, 0]], className: "c" }],
      label: "flat zero",
    });
    for (const y of yCoords(svg)) expect(y).toBe(100);
  });

  it("centers a flat nonzero series too", () => {
    const svg = lineChart({
      series: [{ points: [[32, 1800], [65, 1800]], className: "c" }],
      label: "flat",
    });
    for (const y of yCoords(svg)) expect(y).toBe(100);
  });

  it("keeps mixed-series charts (one flat line, one growing) on the shared scale", () => {
    const svg = lineChart({
      series: [
        { points: [[32, 0], [65, 0]], className: "later" },
        { points: [[32, 0], [65, 8000]], className: "now" },
      ],
      label: "mixed",
    });
    const [flatLine, growingLine] = svg.match(/points="[^"]+"/g)!;
    expect(flatLine).toContain(",188.0"); // zero belongs on the floor when a real scale exists
    expect(growingLine).toContain(",12.0"); // and the growing line still reaches the top
  });
});
