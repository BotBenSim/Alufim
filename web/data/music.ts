import type { DifficultyBand, DifficultyLevel } from "@/lib/types";

/**
 * Music ladder — sound before symbol. See
 * knowledge/educational/sound-before-symbol.md and
 * backlog/music-ear-and-chords-game.md for the full design (horizontal keyboard
 * that grows 5 → 7 → 12 keys; chords taught as movable shapes).
 */
export const MUSIC_STAGES = [
  { stage: 1, label: "גבוה או נמוך" },
  { stage: 2, label: "איזה צליל שמעתם" },
  { stage: 3, label: "שם הצליל" },
  { stage: 4, label: "חזרו על הלחן" },
  { stage: 5, label: "שמח או עצוב" },
] as const;

/** Pentatonic first band — no combination can sound wrong (Orff). */
export const PENTATONIC = [
  { name: "דו", solfa: "do", freq: 261.63 },
  { name: "רה", solfa: "re", freq: 293.66 },
  { name: "מי", solfa: "mi", freq: 329.63 },
  { name: "סול", solfa: "sol", freq: 392.0 },
  { name: "לה", solfa: "la", freq: 440.0 },
] as const;

/** Added at band 2 — seven keys, seven chords, dissonance now possible. */
export const DIATONIC_EXTRA = [
  { name: "פה", solfa: "fa", freq: 349.23 },
  { name: "סי", solfa: "ti", freq: 493.88 },
] as const;

function stageBands(stages: readonly number[]): DifficultyBand[] {
  return stages.map((stage) => ({ stage }));
}

export const MUSIC_BANDS: Record<DifficultyLevel, DifficultyBand[]> = {
  easy: stageBands([1, 2, 3]),
  medium: stageBands([2, 3, 4]),
  hard: stageBands([3, 4, 5]),
};
