import type { DifficultyBand, DifficultyLevel } from "@/lib/types";

/**
 * Hebrew reading ladder. One band per stage — see
 * knowledge/educational/hebrew-reading-sequence.md (letters → nikud → syllable)
 * and knowledge/educational/track-skill-ladders.md for the stage definitions.
 */
export const HEBREAD_STAGES = [
  { stage: 1, label: "אותו צליל בהתחלה" },
  { stage: 2, label: "צליל → אות" },
  { stage: 3, label: "אות → צליל" },
  { stage: 4, label: "אות + ניקוד = הברה" },
  { stage: 5, label: "מילה שלמה" },
] as const;

/** The 8 nikud marks a beginning reader needs, introduced one at a time. */
export const NIKUD = [
  { mark: "ַ", name: "פַּתַח", sound: "a" },
  { mark: "ָ", name: "קָמַץ", sound: "a" },
  { mark: "ֵ", name: "צֵירֵי", sound: "e" },
  { mark: "ֶ", name: "סֶגּוֹל", sound: "e" },
  { mark: "ִ", name: "חִירִיק", sound: "i" },
  { mark: "ֹ", name: "חוֹלָם", sound: "o" },
  { mark: "ּו", name: "שׁוּרוּק", sound: "u" },
  { mark: "ֻ", name: "קֻבּוּץ", sound: "u" },
] as const;

function stageBands(stages: readonly number[]): DifficultyBand[] {
  return stages.map((stage) => ({ stage }));
}

export const HEBREAD_BANDS: Record<DifficultyLevel, DifficultyBand[]> = {
  easy: stageBands([1, 2, 3]),
  medium: stageBands([2, 3, 4]),
  hard: stageBands([3, 4, 5]),
};
