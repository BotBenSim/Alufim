import type { DifficultyBand, DifficultyLevel } from "@/lib/types";

/**
 * English reading ladder. Synthetic-phonics order (s a t p i n …), visually and
 * aurally similar letters kept out of the same set. See
 * knowledge/educational/track-skill-ladders.md.
 */
export const ENGREAD_STAGES = [
  { stage: 1, label: "same first sound" },
  { stage: 2, label: "sound → letter" },
  { stage: 3, label: "letter → sound" },
  { stage: 4, label: "blend a word" },
  { stage: 5, label: "read a word" },
] as const;

/** Standard first phase of a synthetic-phonics progression. */
export const PHONICS_ORDER = [
  "s", "a", "t", "p", "i", "n",
  "m", "d", "g", "o", "c", "k",
  "e", "u", "r", "h", "b", "f", "l",
] as const;

/** Never introduce these together — visually or aurally confusable. */
export const ENG_CONFUSE = [
  ["b", "d", "p", "q"],
  ["m", "n"],
  ["i", "e"],
  ["u", "n"],
  ["f", "t"],
] as const;

function stageBands(stages: readonly number[]): DifficultyBand[] {
  return stages.map((stage) => ({ stage }));
}

export const ENGREAD_BANDS: Record<DifficultyLevel, DifficultyBand[]> = {
  easy: stageBands([1, 2, 3]),
  medium: stageBands([2, 3, 4]),
  hard: stageBands([3, 4, 5]),
};
