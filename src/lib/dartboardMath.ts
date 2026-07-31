export const DARTBOARD_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

export const BOARD_GEOMETRY = {
  cx: 175,
  cy: 175,
  rBullIn: 10,
  rBullOut: 22,
  rSingleA: 85,
  rTriple: 100,
  rSingleB: 130,
  rDouble: 145
};

export function polarPoint(cx: number, cy: number, r: number, angle: number): [number, number] {
  return [cx + r * Math.sin(angle), cy - r * Math.cos(angle)];
}

export function annularSectorPath(cx: number, cy: number, rInner: number, rOuter: number, a0: number, a1: number): string {
  const [x1, y1] = polarPoint(cx, cy, rOuter, a0);
  const [x2, y2] = polarPoint(cx, cy, rOuter, a1);
  const [x3, y3] = polarPoint(cx, cy, rInner, a1);
  const [x4, y4] = polarPoint(cx, cy, rInner, a0);
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x1.toFixed(2)},${y1.toFixed(2)} A ${rOuter},${rOuter} 0 ${largeArc} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L ${x3.toFixed(2)},${y3.toFixed(2)} A ${rInner},${rInner} 0 ${largeArc} 0 ${x4.toFixed(2)},${y4.toFixed(2)} Z`;
}

export function heatColor(count: number, maxCount: number): string {
  if (!count) return '#1f2937';
  const t = Math.min(1, count / maxCount);
  const stops: [number, number, number][] = [
    [59, 130, 246],
    [251, 191, 36],
    [239, 68, 68]
  ];
  const seg = t < 0.5 ? 0 : 1;
  const localT = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const c0 = stops[seg];
  const c1 = stops[seg + 1];
  const r = Math.round(c0[0] + (c1[0] - c0[0]) * localT);
  const g = Math.round(c0[1] + (c1[1] - c0[1]) * localT);
  const b = Math.round(c0[2] + (c1[2] - c0[2]) * localT);
  return `rgb(${r},${g},${b})`;
}

export interface HeatBand {
  d: string;
  fill: string;
  val: number;
  mult: number;
  count: number;
}

export interface HeatLabel {
  x: number;
  y: number;
  text: string;
}

export interface HeatboardData {
  bands: HeatBand[];
  labels: HeatLabel[];
  outerBullFill: string;
  innerBullFill: string;
  outerBullCount: number;
  innerBullCount: number;
  cx: number;
  cy: number;
  rBullIn: number;
  rBullOut: number;
  total: number;
}

export function buildHeatboardData(throwsList: { val: number; mult: number }[]): HeatboardData {
  const counts: Record<string, number> = {};
  let maxCount = 0;
  throwsList.forEach((t) => {
    if (!t.val) return;
    const key = `${t.val}:${t.mult}`;
    counts[key] = (counts[key] || 0) + 1;
    if (counts[key] > maxCount) maxCount = counts[key];
  });

  const { cx, cy, rBullIn, rBullOut, rSingleA, rTriple, rSingleB, rDouble } = BOARD_GEOMETRY;
  const anglePer = (2 * Math.PI) / 20;
  const bands: HeatBand[] = [];
  const labels: HeatLabel[] = [];

  DARTBOARD_ORDER.forEach((num, i) => {
    const a0 = i * anglePer - anglePer / 2;
    const a1 = a0 + anglePer;
    const ringDefs: [number, number, number][] = [
      [rBullOut, rSingleA, 1],
      [rSingleA, rTriple, 3],
      [rTriple, rSingleB, 1],
      [rSingleB, rDouble, 2]
    ];
    ringDefs.forEach(([rIn, rOut, mult]) => {
      const cnt = counts[`${num}:${mult}`] || 0;
      bands.push({ d: annularSectorPath(cx, cy, rIn, rOut, a0, a1), fill: heatColor(cnt, maxCount), val: num, mult, count: cnt });
    });
    const [lx, ly] = polarPoint(cx, cy, rDouble + 12, (a0 + a1) / 2);
    labels.push({ x: lx, y: ly, text: String(num) });
  });

  return {
    bands,
    labels,
    outerBullFill: heatColor(counts['25:1'] || 0, maxCount),
    innerBullFill: heatColor(counts['25:2'] || 0, maxCount),
    outerBullCount: counts['25:1'] || 0,
    innerBullCount: counts['25:2'] || 0,
    cx,
    cy,
    rBullIn,
    rBullOut,
    total: throwsList.reduce((n, t) => n + (t.val ? 1 : 0), 0)
  };
}

export interface TargetBand {
  d: string;
  fill: string;
  val: number;
  mult: number;
}

export interface TargetData {
  bands: TargetBand[];
  labels: HeatLabel[];
  outerBullFill: string;
  innerBullFill: string;
  cx: number;
  cy: number;
  rBullIn: number;
  rBullOut: number;
}

const SECTOR_DARK = '#1f2937';
const SECTOR_LIGHT = '#374151';
const RING_RED = '#b91c1c';
const RING_GREEN = '#15803d';

export function buildTargetZones(): TargetData {
  const { cx, cy, rBullIn, rBullOut, rSingleA, rTriple, rSingleB, rDouble } = BOARD_GEOMETRY;
  const anglePer = (2 * Math.PI) / 20;
  const bands: TargetBand[] = [];
  const labels: HeatLabel[] = [];

  DARTBOARD_ORDER.forEach((num, i) => {
    const a0 = i * anglePer - anglePer / 2;
    const a1 = a0 + anglePer;
    const alt = i % 2 === 0;
    const singleFill = alt ? SECTOR_DARK : SECTOR_LIGHT;
    const ringFill = alt ? RING_RED : RING_GREEN;
    const ringDefs: [number, number, number, string][] = [
      [rBullOut, rSingleA, 1, singleFill],
      [rSingleA, rTriple, 3, ringFill],
      [rTriple, rSingleB, 1, singleFill],
      [rSingleB, rDouble, 2, ringFill]
    ];
    ringDefs.forEach(([rIn, rOut, mult, fill]) => {
      bands.push({ d: annularSectorPath(cx, cy, rIn, rOut, a0, a1), fill, val: num, mult });
    });
    const [lx, ly] = polarPoint(cx, cy, rDouble + 12, (a0 + a1) / 2);
    labels.push({ x: lx, y: ly, text: String(num) });
  });

  return {
    bands,
    labels,
    outerBullFill: RING_GREEN,
    innerBullFill: RING_RED,
    cx,
    cy,
    rBullIn,
    rBullOut
  };
}
