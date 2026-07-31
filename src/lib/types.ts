export type Mode = '501' | 'cricket';
export type Screen = 'setup' | 'game' | 'leaderboard' | 'playerstats';

export interface Throw {
  mult: number;
  val: number;
  pts: number;
}

export interface DartLogEntry {
  name: string;
  mult: number;
  val: number;
}

export interface Player {
  name: string;
  score: number;
  darts: number;
  marks?: Record<number, number>;
  totalMarks?: number;
}

export interface LastTurn {
  name: string;
  throws: Throw[];
  pts: number;
  scoreAfter: number;
  busted: boolean;
}

export interface GameState {
  mode: Mode;
  league: string;
  cutthroat: boolean;
  players: Player[];
  cur: number;
  round: number;
  throws: Throw[];
  dartLog: DartLogEntry[];
  phase: 'game' | 'won';
  winner: number | null;
  winnerCheckout?: number | null;
  lastTurn: LastTurn | null;
}

export interface MatchPlayer {
  name: string;
  score: number;
  darts: number;
  totalMarks?: number;
}

export interface MatchRecord {
  league: string;
  mode: Mode;
  cutthroat: boolean;
  players: MatchPlayer[];
  winnerName: string;
  winnerDarts: number;
  winnerCheckout: number | null;
  throws: DartLogEntry[];
  createdAt: unknown;
}

export interface ToastState {
  id: number;
  label: string;
  kind: 'bull' | '180';
  val: number;
}
