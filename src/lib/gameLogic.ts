import type { GameState, Player, Throw } from './types';

export const CRICKET_NUMS = [15, 16, 17, 18, 19, 20, 25];
export const ALL_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25];
export const MARKS = ['', '／', '✕', '⊗'];
export const MULT_COLOR: Record<number, string> = { 1: '#374151', 2: '#1d4ed8', 3: '#b91c1c' };
export const MULT_LABEL: Record<number, string> = { 1: 'Simple', 2: 'Double', 3: 'Triple' };

export function init501(names: string[], league: string): GameState {
  return {
    mode: '501',
    league: league || 'Général',
    cutthroat: false,
    players: names.map((n) => ({ name: n, score: 501, darts: 0 })),
    cur: 0,
    round: 1,
    throws: [],
    dartLog: [],
    phase: 'game',
    winner: null
  };
}

export function initCricket(names: string[], cutthroat: boolean, league: string): GameState {
  return {
    mode: 'cricket',
    league: league || 'Général',
    cutthroat: !!cutthroat,
    players: names.map((n) => {
      const marks: Record<number, number> = {};
      CRICKET_NUMS.forEach((x) => (marks[x] = 0));
      return { name: n, score: 0, marks, darts: 0, totalMarks: 0 };
    }),
    cur: 0,
    round: 1,
    throws: [],
    dartLog: [],
    phase: 'game',
    winner: null
  };
}

export function advanceTurn(g: GameState): GameState {
  const cur = (g.cur + 1) % g.players.length;
  return { ...g, cur, round: cur === 0 ? g.round + 1 : g.round, throws: [] };
}

export interface ThrowResult {
  next: GameState;
  bullHit: boolean;
  scored180: boolean;
  matchWon: boolean;
}

export function applyThrow(g: GameState, mult: number, val: number): ThrowResult {
  const bullHit = val === 25;
  const dartLog = [...g.dartLog, { name: g.players[g.cur].name, mult, val }];

  if (g.mode === '501') {
    const pts = mult * val;
    const p = g.players[g.cur];
    const ts: Throw[] = [...g.throws, { mult, val, pts }];
    const scored180 = ts.length === 3 && ts.reduce((s, t) => s + t.pts, 0) === 180;
    const left = p.score - pts;
    const bust = left < 0 || left === 1;
    const win = left === 0 && mult === 2;
    const players: Player[] = g.players.map((pl, i) =>
      i !== g.cur ? pl : { ...pl, score: bust ? pl.score : pl.score - pts, darts: (pl.darts || 0) + 1 }
    );

    if (win) {
      const next = { ...g, players, phase: 'won' as const, winner: g.cur, throws: ts, dartLog, winnerCheckout: p.score };
      return { next, bullHit, scored180, matchWon: true };
    }
    const merged = { ...g, players, throws: ts, dartLog };
    const next = bust || ts.length === 3 ? advanceTurn(merged) : merged;
    return { next, bullHit, scored180, matchWon: false };
  }

  // cricket
  const ts: Throw[] = [...g.throws, { mult, val, pts: 0 }];
  const players: Player[] = g.players.map((p) => ({ ...p, marks: { ...p.marks } }));

  if (CRICKET_NUMS.indexOf(val) >= 0) {
    const hits = mult;
    const cur = players[g.cur].marks![val] || 0;
    const newM = Math.min(3, cur + hits);
    const over = Math.max(0, cur + hits - 3);
    const opsClosed = g.players.filter((_, i) => i !== g.cur).every((p) => (p.marks![val] || 0) >= 3);
    const pts = over > 0 && !opsClosed ? over * val : 0;
    players[g.cur].marks![val] = newM;
    players[g.cur].totalMarks = (players[g.cur].totalMarks || 0) + hits;
    if (g.cutthroat) {
      players.forEach((p, i) => {
        if (i !== g.cur && (p.marks![val] || 0) < 3) p.score += pts;
      });
    } else {
      players[g.cur].score += pts;
    }
    ts[ts.length - 1].pts = pts;
    const me = players[g.cur];
    const allClosed = CRICKET_NUMS.every((n) => (me.marks![n] || 0) >= 3);
    const leads = g.cutthroat
      ? players.every((p) => p.score >= me.score)
      : players.every((p) => p.score <= me.score);
    players[g.cur].darts = (players[g.cur].darts || 0) + 1;

    if (allClosed && leads) {
      const next = { ...g, players, phase: 'won' as const, winner: g.cur, throws: ts, dartLog };
      return { next, bullHit, scored180: false, matchWon: true };
    }
  } else {
    players[g.cur].darts = (players[g.cur].darts || 0) + 1;
  }

  const merged = { ...g, players, throws: ts, dartLog };
  const next = ts.length === 3 ? advanceTurn(merged) : merged;
  return { next, bullHit, scored180: false, matchWon: false };
}

export function applyManualScore(g: GameState, pts: number): ThrowResult {
  const p = g.players[g.cur];
  const left = p.score - pts;
  const bust = left < 0 || left === 1;
  const win = left === 0;
  const scored180 = pts === 180;
  const players: Player[] = g.players.map((pl, i) =>
    i !== g.cur ? pl : { ...pl, score: bust ? pl.score : left, darts: (pl.darts || 0) + 3 }
  );

  if (win) {
    const next = { ...g, players, phase: 'won' as const, winner: g.cur, throws: [], winnerCheckout: p.score };
    return { next, bullHit: false, scored180, matchWon: true };
  }
  return { next: advanceTurn({ ...g, players, throws: [] }), bullHit: false, scored180, matchWon: false };
}
