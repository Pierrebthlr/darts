import { writable, type Writable } from 'svelte/store';
import type { ToastState } from './types';
import { burstConfetti, screenShake } from './effects';

export const toast: Writable<ToastState | null> = writable(null);

let toastId = 0;

export function triggerCelebration(
  label: string,
  kind: 'bull' | '180',
  val: number,
  cx: number | undefined,
  cy: number | undefined,
  power: number,
  vibration: number | number[],
  duration = 850
) {
  const id = ++toastId;
  toast.set({ id, label, kind, val });
  setTimeout(() => {
    toast.update((t) => (t && t.id === id ? null : t));
  }, duration);
  burstConfetti(cx, cy, power);
  screenShake(power > 1.3 ? 500 : 300);
  if (navigator.vibrate) navigator.vibrate(vibration);
}

export function triggerBullEffect(mult: number, cx: number | undefined, cy: number | undefined) {
  triggerCelebration(
    mult === 2 ? '🎯 Double Bull !' : '🎯 Bull !',
    'bull',
    25,
    cx,
    cy,
    mult === 2 ? 1.6 : 1,
    mult === 2 ? [25, 30, 55] : 25
  );
}

export function trigger180Effect(cx: number | undefined, cy: number | undefined) {
  triggerCelebration('🔥 180 !', '180', 20, cx, cy, 2.4, [30, 40, 30, 40, 90], 1100);
}
