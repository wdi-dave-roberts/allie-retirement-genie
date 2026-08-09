/**
 * Tiny SVG line-chart helper. Scales series into a shared viewBox and returns
 * polyline markup; colors and animation come from CSS classes, not here.
 */

export interface Series {
  /** [x, y] pairs in data space. */
  points: Array<[number, number]>;
  /** CSS class applied to the polyline. */
  className: string;
}

export interface LineChartOptions {
  series: Series[];
  width?: number;
  height?: number;
  padding?: number;
  /** Accessible description of the chart. */
  label: string;
}

export function lineChart(opts: LineChartOptions): string {
  const width = opts.width ?? 320;
  const height = opts.height ?? 200;
  const pad = opts.padding ?? 12;

  const xs = opts.series.flatMap((s) => s.points.map((p) => p[0]));
  const ys = opts.series.flatMap((s) => s.points.map((p) => p[1]));
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys, 0);
  const yMax = Math.max(...ys);
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;

  const toX = (x: number): number => pad + ((x - xMin) / xSpan) * (width - 2 * pad);
  // A flat series (e.g. $0 balance at 0% contribution) would otherwise pin to
  // the viewBox floor and read as a rendering failure — center it so a
  // flat-but-real projection looks deliberate (WHI-103).
  const flat = Math.min(...ys) === yMax;
  const toY = flat
    ? (): number => height / 2
    : (y: number): number => height - pad - ((y - yMin) / ySpan) * (height - 2 * pad);

  const lines = opts.series
    .map((s) => {
      const pts = s.points.map(([x, y]) => `${toX(x).toFixed(1)},${toY(y).toFixed(1)}`).join(" ");
      return `<polyline class="${s.className}" points="${pts}" fill="none" pathLength="1" />`;
    })
    .join("");

  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${opts.label}">${lines}</svg>`;
}
