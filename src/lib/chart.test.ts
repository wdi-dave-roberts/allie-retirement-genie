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

describe("lineChart xLabels (WHI-104)", () => {
  const series = [{ points: [[32, 0], [65, 10_000]] as Array<[number, number]>, className: "c" }];

  it("renders a text marker per label, positioned on the data x-scale", () => {
    const svg = lineChart({
      series,
      label: "with markers",
      xLabels: [
        { x: 32, text: "32" },
        { x: 48.5, text: "48" },
        { x: 65, text: "65" },
      ],
    });
    const labels = svg.match(/<text[^>]*>[^<]*<\/text>/g)!;
    expect(labels).toHaveLength(3);
    expect(labels[0]).toContain('x="12.0"'); // left pad
    expect(labels[2]).toContain('x="308.0"'); // width 320 - pad
    expect(labels[1]).toContain(">48<");
    for (const l of labels) expect(l).toContain('class="curve__axis-label"');
  });

  it("cedes a bottom strip to the label row so the curve never overlaps text", () => {
    const withLabels = lineChart({ series, label: "l", xLabels: [{ x: 32, text: "32" }] });
    // Curve floor moves up from 188 (200 - pad) to 172 (label strip of 16).
    expect(withLabels).toContain(",172.0");
    expect(withLabels).not.toContain(",188.0");
  });

  it("changes nothing when no labels are passed", () => {
    const plain = lineChart({ series, label: "plain" });
    expect(plain).not.toContain("<text");
    expect(plain).toContain(",188.0"); // original floor
    expect(plain).toContain(",12.0"); // original top
  });

  it("centers a flat series within the label-adjusted plot area (WHI-103 × WHI-104)", () => {
    const svg = lineChart({
      series: [{ points: [[32, 0], [65, 0]], className: "c" }],
      label: "flat with markers",
      xLabels: [{ x: 32, text: "32" }],
    });
    for (const y of yCoords(svg)) expect(y).toBe(92); // (pad 12 + floor 172) / 2
  });
});
