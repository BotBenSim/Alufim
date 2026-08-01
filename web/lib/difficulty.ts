import type {
  DifficultyBand,
  DifficultyLevel,
  GameCurriculum,
  GameId,
  MathVisual,
} from "./types";
import { ENGREAD_BANDS } from "@/data/engread";
import { HEBREAD_BANDS } from "@/data/hebread";
import { MUSIC_BANDS } from "@/data/music";
import { bandForStepWithCounts, blockForStep, DIFFICULTY_BLOCK_SIZE } from "./xp";

type AddBlock = { minSum: number; maxSum: number; visual: MathVisual };
type SubBlock = { minTop: number; maxMin: number; visual: MathVisual };
type FindBlock = {
  maxNum?: number;
  kinds?: string[];
  confuse?: boolean;
  qLo?: number;
  qHi?: number;
  qClose?: boolean;
};
type EngBlock = { maxLen: number };

const MATH_VISUALS: MathVisual[] = ["fullCount", "countOn", "numbers"];

/** Default visual by band index — matches legacy blockForStep >= 2 → countOn. */
export function defaultMathVisual(bandIndex: number): MathVisual {
  return bandIndex >= 2 ? "countOn" : "fullCount";
}

export function normalizeMathVisual(v: unknown, bandIndex = 0): MathVisual {
  if (typeof v === "string" && MATH_VISUALS.includes(v as MathVisual)) {
    return v as MathVisual;
  }
  return defaultMathVisual(bandIndex);
}

export function mathVisualLabel(v: MathVisual): string {
  if (v === "fullCount") return "ספירה";
  if (v === "countOn") return "מעורב";
  return "ספרות";
}

/** Factory template — deep-copied into profiles on create / migrate / reset. */
export const GAME_DIFFICULTY: Record<
  GameId,
  Partial<
    Record<DifficultyLevel, AddBlock[] | SubBlock[] | FindBlock[] | EngBlock[] | DifficultyBand[]>
  >
> = {
  hebread: HEBREAD_BANDS,
  engread: ENGREAD_BANDS,
  music: MUSIC_BANDS,
  add: {
    easy: [
      { minSum: 2, maxSum: 8, visual: "fullCount" },
      { minSum: 8, maxSum: 16, visual: "fullCount" },
      { minSum: 16, maxSum: 25, visual: "countOn" },
    ],
    medium: [
      { minSum: 4, maxSum: 20, visual: "fullCount" },
      { minSum: 20, maxSum: 40, visual: "countOn" },
      { minSum: 40, maxSum: 60, visual: "numbers" },
    ],
    hard: [
      { minSum: 8, maxSum: 40, visual: "countOn" },
      { minSum: 40, maxSum: 80, visual: "numbers" },
      { minSum: 80, maxSum: 120, visual: "numbers" },
    ],
  },
  sub: {
    easy: [
      { minTop: 2, maxMin: 8, visual: "fullCount" },
      { minTop: 8, maxMin: 16, visual: "fullCount" },
      { minTop: 16, maxMin: 22, visual: "countOn" },
    ],
    medium: [
      { minTop: 4, maxMin: 20, visual: "fullCount" },
      { minTop: 20, maxMin: 40, visual: "countOn" },
      { minTop: 40, maxMin: 60, visual: "numbers" },
    ],
    hard: [
      { minTop: 8, maxMin: 40, visual: "countOn" },
      { minTop: 40, maxMin: 80, visual: "numbers" },
      { minTop: 80, maxMin: 120, visual: "numbers" },
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

const LEVELS: DifficultyLevel[] = ["easy", "medium", "hard"];

/** Max questions a parent may assign to one band. */
export const MAX_BAND_COUNT = 99;

function bandSlots(bands: Record<DifficultyLevel, DifficultyBand[]>): number {
  return LEVELS.reduce((max, level) => Math.max(max, bands[level]?.length || 0), 0);
}

/**
 * Clean a parent-edited `counts` array. Returns `undefined` when there is nothing
 * usable — no array, or every band set to 0 — so the caller falls back to the
 * uniform `stepsPerBlock` ramp and a run can never end up with zero questions.
 */
export function normalizeCounts(counts: unknown, slots: number): number[] | undefined {
  if (!Array.isArray(counts) || slots <= 0) return undefined;
  const out: number[] = [];
  for (let i = 0; i < slots; i++) {
    const n = Number(counts[i]);
    out.push(Number.isFinite(n) ? Math.max(0, Math.min(MAX_BAND_COUNT, Math.floor(n))) : 0);
  }
  return out.some((n) => n > 0) ? out : undefined;
}

function withDefaultVisuals(
  gameId: GameId,
  rows: DifficultyBand[]
): DifficultyBand[] {
  if (gameId !== "add" && gameId !== "sub") return rows;
  return rows.map((band, i) => ({
    ...band,
    visual: normalizeMathVisual(band.visual, i),
  }));
}

function cloneBands(
  gameId: GameId,
  rows: AddBlock[] | SubBlock[] | FindBlock[] | EngBlock[] | DifficultyBand[] | undefined
): DifficultyBand[] {
  const cloned = JSON.parse(JSON.stringify(rows ?? [{}])) as DifficultyBand[];
  return withDefaultVisuals(gameId, cloned);
}

/** Deep-copy factory defaults into a new GameCurriculum for one game. */
export function defaultCurriculum(gameId: GameId): GameCurriculum {
  const factory = GAME_DIFFICULTY[gameId] || {};
  const bands = {} as Record<DifficultyLevel, DifficultyBand[]>;
  for (const level of LEVELS) {
    bands[level] = cloneBands(gameId, factory[level] || factory.easy);
  }
  return {
    stepsPerBlock: DIFFICULTY_BLOCK_SIZE,
    bands,
  };
}

/**
 * Ensure a curriculum is complete. Missing pieces are filled from the factory;
 * existing customized bands are kept (visual filled if missing).
 */
export function ensureCurriculum(
  gameId: GameId,
  existing?: GameCurriculum | null
): GameCurriculum {
  const defaults = defaultCurriculum(gameId);
  if (!existing) return defaults;

  const stepsRaw = Number(existing.stepsPerBlock);
  const stepsPerBlock =
    Number.isFinite(stepsRaw) && stepsRaw >= 1
      ? Math.min(20, Math.floor(stepsRaw))
      : defaults.stepsPerBlock;

  const bands = { ...defaults.bands };
  for (const level of LEVELS) {
    const rows = existing.bands?.[level];
    if (Array.isArray(rows) && rows.length > 0) {
      bands[level] = withDefaultVisuals(
        gameId,
        JSON.parse(JSON.stringify(rows)) as DifficultyBand[]
      );
    }
  }

  const counts = normalizeCounts(existing.counts, bandSlots(bands));
  return counts ? { stepsPerBlock, counts, bands } : { stepsPerBlock, bands };
}

/** Read band params from a profile-owned curriculum. */
export function diffParams<T = Record<string, unknown>>(
  curriculum: GameCurriculum,
  level: DifficultyLevel,
  stepIndex: number
): T {
  const rows = (curriculum.bands[level] || curriculum.bands.easy || [{}]) as T[];
  const b = curriculum.counts?.length
    ? bandForStepWithCounts(stepIndex, curriculum.counts)
    : blockForStep(stepIndex, curriculum.stepsPerBlock);
  const i = Math.max(0, Math.min(b, rows.length - 1));
  return rows[i] ?? ({} as T);
}

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

/** Clamp curriculum fields after UI edit. */
export function clampCurriculum(gameId: GameId, curriculum: GameCurriculum): GameCurriculum {
  const ensured = ensureCurriculum(gameId, curriculum);
  const stepsPerBlock = Math.max(1, Math.min(20, Math.floor(ensured.stepsPerBlock) || 1));
  const bands = { ...ensured.bands };

  for (const level of LEVELS) {
    bands[level] = bands[level].map((band, i) => clampBand(gameId, band, i));
  }

  const counts = normalizeCounts(ensured.counts, bandSlots(bands));
  return counts ? { stepsPerBlock, counts, bands } : { stepsPerBlock, bands };
}

function clampBand(
  gameId: GameId,
  band: DifficultyBand,
  bandIndex: number
): DifficultyBand {
  const next = { ...band };
  const clampNum = (v: unknown, lo: number, hi: number, fallback: number) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(lo, Math.min(hi, Math.floor(n)));
  };

  if (gameId === "add") {
    let minSum = clampNum(next.minSum, 2, 200, 2);
    let maxSum = clampNum(next.maxSum, 2, 200, 8);
    // Never swap — that thrashes the other bound while typing. Nudge max up.
    if (maxSum <= minSum) maxSum = Math.min(200, minSum + 1);
    if (maxSum <= minSum) minSum = Math.max(2, maxSum - 1);
    return {
      ...next,
      minSum,
      maxSum,
      visual: normalizeMathVisual(next.visual, bandIndex),
    };
  }
  if (gameId === "sub") {
    let minTop = clampNum(next.minTop, 2, 200, 2);
    let maxMin = clampNum(next.maxMin, 2, 200, 8);
    if (maxMin <= minTop) maxMin = Math.min(200, minTop + 1);
    if (maxMin <= minTop) minTop = Math.max(2, maxMin - 1);
    return {
      ...next,
      minTop,
      maxMin,
      visual: normalizeMathVisual(next.visual, bandIndex),
    };
  }
  if (gameId === "find") {
    let qLo = next.qLo != null ? clampNum(next.qLo, 1, 20, 1) : next.qLo;
    let qHi = next.qHi != null ? clampNum(next.qHi, 1, 20, 4) : next.qHi;
    if (qLo != null && qHi != null && qHi <= qLo) {
      qHi = Math.min(20, qLo + 1);
      if (qHi <= qLo) qLo = Math.max(1, qHi - 1);
    }
    return {
      ...next,
      maxNum: clampNum(next.maxNum, 1, 100, 5),
      qLo,
      qHi,
    };
  }
  if (gameId === "eng") {
    return { ...next, maxLen: clampNum(next.maxLen, 1, 64, 8) };
  }
  return next;
}

/** Human-readable preview of the first band for the settings UI. */
export function curriculumSummary(
  gameId: GameId,
  curriculum: GameCurriculum,
  level: DifficultyLevel
): string {
  const band = curriculum.bands[level]?.[0] ?? {};
  if (gameId === "add") {
    const vis = mathVisualLabel(normalizeMathVisual(band.visual, 0));
    return `התחלה: סכום ${band.minSum ?? "?"}–${band.maxSum ?? "?"} · ${vis}`;
  }
  if (gameId === "sub") {
    const vis = mathVisualLabel(normalizeMathVisual(band.visual, 0));
    return `התחלה: מספרים ${band.minTop ?? "?"}–${band.maxMin ?? "?"} · ${vis}`;
  }
  if (gameId === "find") {
    return `התחלה: עד ${band.maxNum ?? "?"}`;
  }
  if (gameId === "eng") {
    return `התחלה: עד ${band.maxLen ?? "?"} אותיות`;
  }
  if (band.stage) {
    return `התחלה: שלב ${band.stage}`;
  }
  return "התחלה";
}

/** Short equal-length labels for PillControl. */
export const MATH_VISUAL_OPTIONS: { value: MathVisual; label: string }[] = [
  { value: "fullCount", label: "ספירה" },
  { value: "countOn", label: "מעורב" },
  { value: "numbers", label: "ספרות" },
];
