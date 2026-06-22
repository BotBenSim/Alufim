import type { DifficultyLevel } from "./types";

export const XP_BATCH_SIZE = 8;
export const XP_TABLE: Record<DifficultyLevel, number[][]> = {
  easy: [
    [1, 2, 3],
    [1, 2, 4],
    [1, 2, 5],
  ],
  medium: [
    [1, 2, 4],
    [1, 2, 5],
    [1, 2, 6],
  ],
  hard: [
    [1, 2, 5],
    [1, 2, 6],
    [1, 2, 7],
  ],
};
export const XP_BEAT = { mission: 1, play: 3 } as const;
export const FORM_XP_STEP = 70;

export function blockForStep(stepIndex: number): number {
  return Math.floor((stepIndex - 1) / 4);
}

export function xpTier(level: DifficultyLevel, stepIndex: number): number {
  const rows = (XP_TABLE[level] || XP_TABLE.easy).length;
  return Math.min(rows - 1, Math.max(0, Math.floor((stepIndex - 1) / XP_BATCH_SIZE)));
}

export function xpForCorrect(
  level: DifficultyLevel,
  stepIndex: number,
  mistakes: number
): number {
  const row = (XP_TABLE[level] || XP_TABLE.easy)[xpTier(level, stepIndex)];
  const idx = Math.max(0, row.length - 1 - (mistakes || 0));
  return row[idx];
}

export function formThresholds(formCount: number): number[] {
  const arr = [0];
  let acc = 0;
  for (let s = 1; s < formCount; s++) {
    acc += FORM_XP_STEP * s;
    arr.push(acc);
  }
  return arr;
}

export function formForXp(totalXp: number, formCount: number): number {
  const th = formThresholds(formCount);
  let f = 0;
  for (let i = 0; i < th.length; i++) {
    if (totalXp >= th[i]) f = i;
  }
  return f;
}

export function xpBarState(totalXp: number, formCount: number) {
  const th = formThresholds(formCount);
  const f = formForXp(totalXp, formCount);
  if (f >= formCount - 1) {
    return { pct: 100, label: `בוגר! ✨ (${totalXp} XP)` };
  }
  const next = th[f + 1];
  const pct = Math.max(0, Math.min(100, Math.round((totalXp / next) * 100)));
  return { pct, label: `${totalXp} / ${next}` };
}

export function xpGainColor(amount: number): string {
  const colors = ["#4DABF7", "#38D9A9", "#94D82D", "#FFD43B", "#FF922B", "#FF6B6B", "#E03131"];
  const n = Math.max(1, amount || 1);
  return colors[Math.min(n, colors.length) - 1];
}
