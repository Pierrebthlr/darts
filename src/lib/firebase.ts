import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type Firestore
} from 'firebase/firestore';
import type { GameState, MatchRecord } from './types';

const firebaseConfig = {
  apiKey: 'AIzaSyBHyjHeLJwumwHAyEV5yfqX9VTGP55PzyA',
  authDomain: 'darty-crousty-f4d80.firebaseapp.com',
  projectId: 'darty-crousty-f4d80',
  storageBucket: 'darty-crousty-f4d80.firebasestorage.app',
  messagingSenderId: '586523474406',
  appId: '1:586523474406:web:9a1d205a99631d87f1be27'
};

let db: Firestore | null = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error('Firebase indisponible', e);
}

export function isFirebaseAvailable(): boolean {
  return db !== null;
}

export async function recordMatch(g: GameState): Promise<void> {
  if (!db) return;
  const record: MatchRecord = {
    league: g.league || 'Général',
    mode: g.mode,
    cutthroat: !!g.cutthroat,
    players: g.players.map((p) => {
      const base: MatchRecord['players'][number] = { name: p.name, score: p.score, darts: p.darts || 0 };
      if (g.mode === 'cricket') base.totalMarks = p.totalMarks || 0;
      return base;
    }),
    winnerName: g.players[g.winner as number].name,
    winnerDarts: g.players[g.winner as number].darts || 0,
    winnerCheckout: g.mode === '501' && g.winnerCheckout != null ? g.winnerCheckout : null,
    throws: g.dartLog || [],
    createdAt: serverTimestamp()
  };
  try {
    await addDoc(collection(db, 'matches'), record as unknown as Record<string, unknown>);
  } catch (e) {
    console.error('recordMatch failed', e);
  }
}

export async function fetchMatches(limitCount = 300): Promise<Record<string, unknown>[]> {
  if (!db) throw new Error('Firebase indisponible (hors ligne ?)');
  const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}
