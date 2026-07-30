export interface DartOption {
  mult: number;
  val: number;
  pts: number;
}

export const DART_OPTIONS: DartOption[] = (() => {
  const opts: DartOption[] = [];
  for (let v = 1; v <= 20; v++) {
    opts.push({ mult: 1, val: v, pts: v });
    opts.push({ mult: 2, val: v, pts: 2 * v });
    opts.push({ mult: 3, val: v, pts: 3 * v });
  }
  opts.push({ mult: 1, val: 25, pts: 25 });
  opts.push({ mult: 2, val: 25, pts: 50 });
  opts.sort((a, b) => b.pts - a.pts);
  return opts;
})();

export const DOUBLE_OPTIONS = DART_OPTIONS.filter((d) => d.mult === 2);

export function findCheckoutExact(score: number, darts: number): DartOption[] | null {
  if (darts === 1) {
    for (const d of DOUBLE_OPTIONS) if (d.pts === score) return [d];
    return null;
  }
  for (const d of DART_OPTIONS) {
    const rem = score - d.pts;
    if (rem < 0 || rem === 1) continue;
    const sub = findCheckoutExact(rem, darts - 1);
    if (sub) return [d, ...sub];
  }
  return null;
}

export function findCheckout(score: number, maxDarts: number): DartOption[] | null {
  for (let k = 1; k <= maxDarts; k++) {
    const seq = findCheckoutExact(score, k);
    if (seq) return seq;
  }
  return null;
}

export function formatDart(d: DartOption): string {
  if (d.val === 25) return d.mult === 2 ? 'D-Bull' : 'Bull';
  return (d.mult === 3 ? 'T' : d.mult === 2 ? 'D' : 'S') + d.val;
}
