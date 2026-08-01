import { HEB_NUM } from "@/data/hebrew";
import type { DifficultyBand, DifficultyLevel } from "@/lib/types";

/**
 * Numbers ladder — the numeral is on screen from the very first question. Rung 1
 * is the most direct question there is: hear "חמש", press 5. Only once the shape
 * is known do we tie it to an amount in both directions, then to order, then to
 * tens-and-ones.
 */
export const NUMS_STAGES = [
  { stage: 1, label: "זיהוי ספרה" },
  { stage: 2, label: "כמות → ספרה" },
  { stage: 3, label: "ספרה → כמות" },
  { stage: 4, label: "סדר המספרים" },
  { stage: 5, label: "עשרות ומאות" },
] as const;

/** A bundle of ten, so 30 is three things rather than thirty things. */
export const TEN_GLYPH = "🔟";

/** How many loose items we are willing to draw in one option button. */
export const MAX_DRAWN = 10;

const TENS_HE = [
  "",
  "עשר",
  "עשרים",
  "שלושים",
  "ארבעים",
  "חמישים",
  "שישים",
  "שבעים",
  "שמונים",
  "תשעים",
];

/** Hebrew for a number. HEB_NUM stops at 30, so tens are composed past that. */
export function hebNumber(n: number): string {
  if (n < 0 || !Number.isInteger(n)) return String(n);
  if (n <= 30) return HEB_NUM[n] ?? String(n);
  if (n === 100) return "מאה";
  if (n > 100) return String(n);
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (!TENS_HE[tens]) return String(n);
  return ones === 0 ? TENS_HE[tens] : `${TENS_HE[tens]} ו${HEB_NUM[ones]}`;
}

/** Round numbers get their own attention: 10 and 100 are shapes, not amounts. */
export const LANDMARKS = [10, 100] as const;

export const NUMS_BANDS: Record<DifficultyLevel, DifficultyBand[]> = {
  easy: [
    { stage: 1, maxNum: 5 },
    { stage: 2, maxNum: 5 },
    { stage: 3, maxNum: 10 },
  ],
  medium: [
    { stage: 2, maxNum: 10 },
    { stage: 3, maxNum: 20 },
    { stage: 4, maxNum: 20 },
  ],
  hard: [
    { stage: 3, maxNum: 20 },
    { stage: 4, maxNum: 100 },
    { stage: 5, maxNum: 100 },
  ],
};
