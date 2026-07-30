import { writable } from 'svelte/store';
import type { GameState, Screen, Mode } from './types';

export interface LeaderboardState {
  loading: boolean;
  matches: Record<string, any>[] | null;
  error: string | null;
  selectedLeague?: string;
  h2hA?: string;
  h2hB?: string;
}

export interface AppState {
  screen: Screen;
  mode: Mode;
  names: string[];
  league: string;
  cutthroat: boolean;
  game: GameState | null;
  mult: number;
  manualMode: boolean;
  manualVal: string;
  history: GameState[];
  leaderboard: LeaderboardState | null;
  knownNames: string[];
  knownLeagues: string[];
  statsPlayer: string | null;
}

function initialState(): AppState {
  return {
    screen: 'setup',
    mode: '501',
    names: ['Joueur 1', 'Joueur 2'],
    league: '',
    cutthroat: false,
    game: null,
    mult: 1,
    manualMode: false,
    manualVal: '',
    history: [],
    leaderboard: null,
    knownNames: [],
    knownLeagues: [],
    statsPlayer: null
  };
}

export const app = writable<AppState>(initialState());

export function pushHistory(g: GameState) {
  app.update((s) => {
    const history = [...s.history, JSON.parse(JSON.stringify(g))];
    if (history.length > 200) history.shift();
    return { ...s, history };
  });
}

export function popHistory(): GameState | null {
  let popped: GameState | null = null;
  app.update((s) => {
    if (!s.history.length) return s;
    const history = [...s.history];
    popped = history.pop()!;
    return { ...s, history };
  });
  return popped;
}
