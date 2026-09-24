import { t } from "@/lib/i18n";
import type { DifficultyBand, DifficultyLevel } from "@/lib/types";

/**
 * English reading ladder. Synthetic-phonics order (s a t p i n …), visually and
 * aurally similar letters kept out of the same set. See
 * knowledge/educational/track-skill-ladders.md.
 *
 * The ladder starts at sound → letter, not at an ear-only rung: a letter is on
 * screen from the very first question. Sound-before-symbol still holds — the
 * child hears the phoneme and the letter is only its label — but
 * knowledge/educational/sound-before-symbol.md warns against letting "sound
 * first" become "sound only", and an opening band with no letter in it read to
 * a parent as a game that never got to the reading.
 *
 * Emoji match `data/vocab.ts` wherever the two games name the same thing, so a
 * child meets one picture per word across the whole app.
 */
export const ENGREAD_STAGES = [
  { stage: 1, get label() { return t("engread.stages.1"); } },
  { stage: 2, get label() { return t("engread.stages.2"); } },
  { stage: 3, get label() { return t("engread.stages.3"); } },
  { stage: 4, get label() { return t("engread.stages.4"); } },
  { stage: 5, get label() { return t("engread.stages.5"); } },
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

export const ENG_VOWELS = ["a", "e", "i", "o", "u"] as const;

/**
 * Two-letter graphemes that do not say their letters. None of them belong in
 * this phase, so a word containing one is not decodable yet however familiar
 * its individual letters look.
 */
export const ENG_DIGRAPHS = [
  "sh", "ch", "th", "ck", "ng", "qu", "ph", "wh",
  "ai", "ay", "ea", "ee", "oa", "oo", "ou", "ow", "oi", "oy", "ie", "igh",
  "ar", "or", "er", "ir", "ur",
] as const;

export type EngSound = {
  /** Grapheme as printed on a card — lowercase, the form phonics teaches first. */
  l: string;
  /** Phoneme id. `c` and `k` share `k`, so they never share an option set. */
  sound: string;
  /**
   * TTS-friendly spelling of the *phoneme*, never the letter name: "sss", not
   * "ess". Continuants are stretched, stops carry the smallest schwa that a
   * speech engine will pronounce at all. These are approximations — the
   * authority on a sound is the keyword picture, not the synthesizer.
   */
  say: string;
};

export const ENG_SOUNDS: readonly EngSound[] = [
  { l: "s", sound: "s", say: "sss" },
  { l: "a", sound: "a", say: "aah" },
  { l: "t", sound: "t", say: "tuh" },
  { l: "p", sound: "p", say: "puh" },
  { l: "i", sound: "i", say: "ih" },
  { l: "n", sound: "n", say: "nnn" },
  { l: "m", sound: "m", say: "mmm" },
  { l: "d", sound: "d", say: "duh" },
  { l: "g", sound: "g", say: "guh" },
  { l: "o", sound: "o", say: "aw" },
  { l: "c", sound: "k", say: "kuh" },
  { l: "k", sound: "k", say: "kuh" },
  { l: "e", sound: "e", say: "eh" },
  { l: "u", sound: "u", say: "uh" },
  { l: "r", sound: "r", say: "rrr" },
  { l: "h", sound: "h", say: "huh" },
  { l: "b", sound: "b", say: "buh" },
  { l: "f", sound: "f", say: "fff" },
  { l: "l", sound: "l", say: "lll" },
];

export type EngPic = {
  en: string;
  he: string;
  emoji: string;
  /** First grapheme of the English word. */
  l: string;
  /** First phoneme — what rung 2 actually compares. */
  sound: string;
};

/**
 * Keyword pictures, at least one per letter in PHONICS_ORDER. Every word starts
 * with the plain sound of its first letter — no digraphs, no soft `c`/`g`, no
 * long vowels — because rungs 1–2 turn on exactly that sound.
 */
export const ENGREAD_PICS: readonly EngPic[] = [
  { en: "sun", he: "שמש", emoji: "☀️", l: "s", sound: "s" },
  { en: "sock", he: "גרב", emoji: "🧦", l: "s", sound: "s" },
  { en: "soap", he: "סבון", emoji: "🧼", l: "s", sound: "s" },
  { en: "snake", he: "נחש", emoji: "🐍", l: "s", sound: "s" },

  { en: "apple", he: "תפוח", emoji: "🍎", l: "a", sound: "a" },
  { en: "ant", he: "נמלה", emoji: "🐜", l: "a", sound: "a" },
  { en: "alligator", he: "תנין", emoji: "🐊", l: "a", sound: "a" },

  { en: "tree", he: "עץ", emoji: "🌳", l: "t", sound: "t" },
  { en: "tiger", he: "נמר", emoji: "🐯", l: "t", sound: "t" },
  { en: "turtle", he: "צב", emoji: "🐢", l: "t", sound: "t" },

  { en: "pizza", he: "פיצה", emoji: "🍕", l: "p", sound: "p" },
  { en: "pig", he: "חזיר", emoji: "🐷", l: "p", sound: "p" },
  { en: "pen", he: "עט", emoji: "🖊️", l: "p", sound: "p" },
  { en: "pants", he: "מכנסיים", emoji: "👖", l: "p", sound: "p" },

  { en: "igloo", he: "איגלו", emoji: "🛖", l: "i", sound: "i" },
  { en: "iguana", he: "איגואנה", emoji: "🦎", l: "i", sound: "i" },

  { en: "nose", he: "אף", emoji: "👃", l: "n", sound: "n" },
  { en: "nut", he: "אגוז", emoji: "🥜", l: "n", sound: "n" },
  { en: "net", he: "רשת", emoji: "🥅", l: "n", sound: "n" },

  { en: "moon", he: "ירח", emoji: "🌙", l: "m", sound: "m" },
  { en: "milk", he: "חלב", emoji: "🥛", l: "m", sound: "m" },
  { en: "mouse", he: "עכבר", emoji: "🐭", l: "m", sound: "m" },
  { en: "monkey", he: "קוף", emoji: "🐵", l: "m", sound: "m" },

  { en: "dog", he: "כלב", emoji: "🐶", l: "d", sound: "d" },
  { en: "door", he: "דלת", emoji: "🚪", l: "d", sound: "d" },
  { en: "duck", he: "ברווז", emoji: "🦆", l: "d", sound: "d" },

  { en: "goat", he: "עז", emoji: "🐐", l: "g", sound: "g" },
  { en: "gift", he: "מתנה", emoji: "🎁", l: "g", sound: "g" },
  { en: "grapes", he: "ענבים", emoji: "🍇", l: "g", sound: "g" },
  { en: "guitar", he: "גיטרה", emoji: "🎸", l: "g", sound: "g" },

  { en: "octopus", he: "תמנון", emoji: "🐙", l: "o", sound: "o" },
  { en: "orange", he: "תפוז", emoji: "🍊", l: "o", sound: "o" },
  { en: "otter", he: "לוטרה", emoji: "🦦", l: "o", sound: "o" },

  { en: "cat", he: "חתול", emoji: "🐱", l: "c", sound: "k" },
  { en: "cow", he: "פרה", emoji: "🐮", l: "c", sound: "k" },
  { en: "cup", he: "כוס", emoji: "🥤", l: "c", sound: "k" },
  { en: "carrot", he: "גזר", emoji: "🥕", l: "c", sound: "k" },

  { en: "key", he: "מפתח", emoji: "🔑", l: "k", sound: "k" },
  { en: "kite", he: "עפיפון", emoji: "🪁", l: "k", sound: "k" },
  { en: "king", he: "מלך", emoji: "🤴", l: "k", sound: "k" },

  { en: "egg", he: "ביצה", emoji: "🥚", l: "e", sound: "e" },
  { en: "elephant", he: "פיל", emoji: "🐘", l: "e", sound: "e" },
  { en: "envelope", he: "מעטפה", emoji: "✉️", l: "e", sound: "e" },

  { en: "umbrella", he: "מטרייה", emoji: "☂️", l: "u", sound: "u" },
  { en: "up", he: "למעלה", emoji: "⬆️", l: "u", sound: "u" },

  { en: "rain", he: "גשם", emoji: "🌧️", l: "r", sound: "r" },
  { en: "rock", he: "סלע", emoji: "🪨", l: "r", sound: "r" },
  { en: "rabbit", he: "ארנב", emoji: "🐰", l: "r", sound: "r" },
  { en: "ring", he: "טבעת", emoji: "💍", l: "r", sound: "r" },

  { en: "hat", he: "כובע", emoji: "🧢", l: "h", sound: "h" },
  { en: "hand", he: "יד", emoji: "✋", l: "h", sound: "h" },
  { en: "house", he: "בית", emoji: "🏠", l: "h", sound: "h" },
  { en: "horse", he: "סוס", emoji: "🐴", l: "h", sound: "h" },

  { en: "ball", he: "כדור", emoji: "⚽", l: "b", sound: "b" },
  { en: "book", he: "ספר", emoji: "📖", l: "b", sound: "b" },
  { en: "bear", he: "דוב", emoji: "🐻", l: "b", sound: "b" },
  { en: "banana", he: "בננה", emoji: "🍌", l: "b", sound: "b" },

  { en: "fish", he: "דג", emoji: "🐟", l: "f", sound: "f" },
  { en: "fire", he: "אש", emoji: "🔥", l: "f", sound: "f" },
  { en: "fork", he: "מזלג", emoji: "🍴", l: "f", sound: "f" },
  { en: "flower", he: "פרח", emoji: "🌷", l: "f", sound: "f" },

  { en: "lion", he: "אריה", emoji: "🦁", l: "l", sound: "l" },
  { en: "leaf", he: "עלה", emoji: "🍃", l: "l", sound: "l" },
  { en: "lemon", he: "לימון", emoji: "🍋", l: "l", sound: "l" },
  { en: "lamp", he: "מנורה", emoji: "💡", l: "l", sound: "l" },
];

export type EngCvc = { en: string; he: string; emoji: string };

/**
 * Decodable CVC words for rungs 3–5: three letters, all of them from
 * PHONICS_ORDER, every grapheme saying its plain sound. No digraphs, no silent
 * letters, no irregular spellings — a child who knows the letters can read
 * every word here without being told it.
 *
 * The rime families (-at, -an, -en, -og, -ug, …) are deliberate: they let a
 * question offer near-miss distractors, so the child has to decode the onset
 * instead of recognising a shape. The same-onset near misses (cat/can,
 * pan/pin, bag/bug, net/nut) do the mirror job at rung 5, where the child picks
 * a spelling and must therefore read past the first letter.
 */
export const ENGREAD_CVC: readonly EngCvc[] = [
  { en: "cat", he: "חתול", emoji: "🐱" },
  { en: "hat", he: "כובע", emoji: "🧢" },
  { en: "bat", he: "עטלף", emoji: "🦇" },
  { en: "rat", he: "חולדה", emoji: "🐀" },

  { en: "can", he: "פחית", emoji: "🥫" },
  { en: "man", he: "איש", emoji: "👨" },
  { en: "pan", he: "מחבת", emoji: "🍳" },

  { en: "map", he: "מפה", emoji: "🗺️" },
  { en: "bag", he: "תיק", emoji: "🎒" },
  { en: "ram", he: "איל", emoji: "🐏" },

  { en: "hen", he: "תרנגולת", emoji: "🐔" },
  { en: "pen", he: "עט", emoji: "🖊️" },
  { en: "ten", he: "עשר", emoji: "🔟" },

  { en: "leg", he: "רגל", emoji: "🦵" },
  { en: "net", he: "רשת", emoji: "🥅" },
  { en: "bed", he: "מיטה", emoji: "🛏️" },

  { en: "pig", he: "חזיר", emoji: "🐷" },
  { en: "pin", he: "סיכה", emoji: "📌" },
  { en: "kid", he: "ילד", emoji: "🧒" },

  { en: "dog", he: "כלב", emoji: "🐶" },
  { en: "log", he: "בול עץ", emoji: "🪵" },
  { en: "pot", he: "סיר", emoji: "🍲" },

  { en: "sun", he: "שמש", emoji: "☀️" },
  { en: "run", he: "לרוץ", emoji: "🏃" },

  { en: "mug", he: "ספל", emoji: "☕" },
  { en: "bug", he: "חרק", emoji: "🐛" },
  { en: "hug", he: "חיבוק", emoji: "🤗" },

  { en: "bus", he: "אוטובוס", emoji: "🚌" },
  { en: "nut", he: "אגוז", emoji: "🥜" },
  { en: "hut", he: "בקתה", emoji: "🛖" },
  { en: "cup", he: "כוס", emoji: "🥤" },
  { en: "tub", he: "אמבטיה", emoji: "🛁" },
];

/**
 * Hebrew chrome, one row per rung — the UI speaks Hebrew, the content is
 * English. Support thins as the rung rises
 * (knowledge/educational/faded-scaffold-ladder.md):
 *
 * | rung | on screen | spoken |
 * | --- | --- | --- |
 * | 1 | Hebrew question + mnemonic picture, three letters | Hebrew question + the phoneme |
 * | 2 | the letter + short Hebrew hint, three pictures | Hebrew hint only — the sound is the child's job |
 * | 3 | the split word + a pointer, three words | short Hebrew cue + the two parts |
 * | 4 | the word, nothing else, three pictures | short Hebrew cue; the word is never spoken first |
 * | 5 | one picture + short Hebrew cue, three spellings | short Hebrew cue only; no word is ever said |
 */
export function engreadCopy(stage: number): { prompt?: string; hint?: string; he?: string } {
  switch (stage) {
    case 1:
      return { prompt: t("engread.whichLetter"), he: t("engread.whichLetter") };
    case 2:
      return { hint: t("engread.whichPicture"), he: t("engread.whichPicture") };
    case 3:
      return { hint: "👆", he: t("engread.blend") };
    case 4:
      return { he: t("engread.readWord") };
    case 5:
      return { hint: t("engread.whichWord"), he: t("engread.whichWord") };
    default:
      return {};
  }
}

export function engSound(letter: string): EngSound | undefined {
  return ENG_SOUNDS.find((s) => s.l === letter);
}

/** True when every grapheme in the word has already been introduced. */
export function isDecodable(word: string): boolean {
  const letters = PHONICS_ORDER as readonly string[];
  if (!word.length || ![...word].every((c) => letters.includes(c))) return false;
  if (ENG_DIGRAPHS.some((d) => word.includes(d))) return false;
  if (/(.)\1/.test(word)) return false; // a doubled letter is one grapheme ("egg")
  return !(word.length > 2 && word.endsWith("e")); // silent e ("cake")
}

export function isCvc(word: string): boolean {
  if (word.length !== 3) return false;
  const v = ENG_VOWELS as readonly string[];
  return !v.includes(word[0]) && v.includes(word[1]) && !v.includes(word[2]);
}

function stageBands(stages: readonly number[]): DifficultyBand[] {
  return stages.map((stage) => ({ stage }));
}

/**
 * A saved profile keeps only the stage number, so shifting the content down one
 * rung moves a returning player down one rung with it. That is the intended
 * outcome — every old stage still exists, one number lower — and it needs no
 * migration (knowledge/technical/state-persistence.md).
 */
export const ENGREAD_BANDS: Record<DifficultyLevel, DifficultyBand[]> = {
  easy: stageBands([1, 2, 3]),
  medium: stageBands([2, 3, 4]),
  hard: stageBands([3, 4, 5]),
};
