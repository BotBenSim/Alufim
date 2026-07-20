import type { DifficultyLevel, GameId } from "./types";
import { blockForStep } from "./xp";

type AddBlock = { minSum: number; maxSum: number };
type SubBlock = { minTop: number; maxMin: number };
type FindBlock = {
  maxNum?: number;
  kinds?: string[];
  confuse?: boolean;
  qLo?: number;
  qHi?: number;
  qClose?: boolean;
};
type EngBlock = { maxLen: number };

export const GAME_DIFFICULTY: Record<
  GameId,
  Partial<Record<DifficultyLevel, AddBlock[] | SubBlock[] | FindBlock[] | EngBlock[]>>
> = {
  add: {
    easy: [
      { minSum: 2, maxSum: 8 },
      { minSum: 8, maxSum: 16 },
      { minSum: 16, maxSum: 25 },
    ],
    medium: [
      { minSum: 4, maxSum: 20 },
      { minSum: 20, maxSum: 40 },
      { minSum: 40, maxSum: 60 },
    ],
    hard: [
      { minSum: 8, maxSum: 40 },
      { minSum: 40, maxSum: 80 },
      { minSum: 80, maxSum: 120 },
    ],
  },
  sub: {
    easy: [
      { minTop: 2, maxMin: 8 },
      { minTop: 8, maxMin: 16 },
      { minTop: 16, maxMin: 22 },
    ],
    medium: [
      { minTop: 4, maxMin: 20 },
      { minTop: 20, maxMin: 40 },
      { minTop: 40, maxMin: 60 },
    ],
    hard: [
      { minTop: 8, maxMin: 40 },
      { minTop: 40, maxMin: 80 },
      { minTop: 80, maxMin: 120 },
    ],
  },
  find: {
    easy: [
      {
        maxNum: 5,
        kinds: ["bignum", "letter", "reason", "more"],
        confuse: false,
        qLo: 1,
        qHi: 4,
        qClose: false,
      },
      {
        maxNum: 15,
        kinds: ["bignum", "letter", "reason", "more", "phon", "num"],
        confuse: false,
        qLo: 2,
        qHi: 6,
        qClose: false,
      },
    ],
    medium: [
      {
        maxNum: 10,
        kinds: ["bignum", "letter", "reason", "more", "phon"],
        confuse: false,
        qLo: 2,
        qHi: 6,
        qClose: false,
      },
      {
        maxNum: 25,
        kinds: ["bignum", "letter", "reason", "more", "phon", "num"],
        confuse: true,
        qLo: 3,
        qHi: 8,
        qClose: true,
      },
    ],
    hard: [
      {
        maxNum: 20,
        kinds: ["bignum", "letter", "reason", "more", "phon"],
        confuse: true,
        qLo: 3,
        qHi: 8,
        qClose: true,
      },
      {
        maxNum: 50,
        kinds: ["bignum", "letter", "reason", "more", "phon"],
        confuse: true,
        qLo: 4,
        qHi: 9,
        qClose: true,
      },
    ],
  },
  eng: {
    easy: [{ maxLen: 8 }],
    medium: [{ maxLen: 16 }],
    hard: [{ maxLen: 32 }],
  },
};

export function diffParams<T = Record<string, unknown>>(
  gameId: GameId,
  level: DifficultyLevel,
  stepIndex: number
): T {
  const byLevel = GAME_DIFFICULTY[gameId] || {};
  const rows = (byLevel[level] || byLevel.easy || [{}]) as T[];
  const b = blockForStep(stepIndex);
  return rows[Math.min(b, rows.length - 1)] ?? ({} as T);
}

const LEVELS: DifficultyLevel[] = ["easy", "medium", "hard"];

export function effectiveLevel(
  baseLevel: DifficultyLevel,
  recent: { hadWrongAttempt: boolean }[]
): DifficultyLevel {
  let i = LEVELS.indexOf(baseLevel);
  if (i < 0) i = 0;
  const last2 = recent.slice(-2);
  if (last2.length === 2) {
    const failures = last2.filter((q) => q.hadWrongAttempt).length;
    if (failures === 2) i = Math.max(0, i - 1);
  }
  return LEVELS[i];
}

export function levelLabel(l: DifficultyLevel): string {
  return l === "hard" ? "קשה" : l === "medium" ? "בינוני" : "קל";
}
