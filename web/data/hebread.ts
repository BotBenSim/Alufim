import { FIND_PHON } from "@/data/find";
import type { DifficultyBand, DifficultyLevel } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * Hebrew reading ladder. One band per stage — see
 * knowledge/educational/hebrew-reading-sequence.md (letters → nikud → syllable)
 * and knowledge/educational/track-skill-ladders.md for the stage definitions.
 *
 * Every rung puts a Hebrew glyph on screen: the ladder starts at the letter, not
 * at an ear-only sound-matching game.
 */
export const HEBREAD_STAGES = [
  { stage: 1, get label() { return t("hebread.stages.1"); } },
  { stage: 2, get label() { return t("hebread.stages.2"); } },
  { stage: 3, get label() { return t("hebread.stages.3"); } },
  { stage: 4, get label() { return t("hebread.stages.4"); } },
  { stage: 5, get label() { return t("hebread.stages.5"); } },
] as const;

const DAGESH = "\u05BC";
const SHIN_DOT = "\u05C1";

/**
 * The point a letter carries before its vowel, so a generated syllable is
 * pronounceable and unambiguous: בּ/כּ/פּ are the hard sounds a beginner is
 * taught, and a bare ש does not say whether it is /ʃ/ or /s/.
 */
export const LETTER_POINT: Record<string, string> = {
  ב: DAGESH,
  כ: DAGESH,
  פ: DAGESH,
  ש: SHIN_DOT,
};

export type NikudMark = {
  /** The mark on its own, for reference. */
  mark: string;
  /** What to append after the letter to write the syllable. */
  attach: string;
  /** What to append for text-to-speech, spelled so a Hebrew voice says the vowel. */
  say: string;
  name: string;
  /** Patach/kamatz both say "a" — at this age they are one sound. */
  sound: "a" | "e" | "i" | "o" | "u";
};

/**
 * The 8 nikud marks a beginning reader needs, in introduction order. A run only
 * ever uses a prefix of this list (see `nikudPool` in the provider), so marks
 * arrive one at a time.
 */
export const NIKUD: NikudMark[] = [
  { mark: "\u05B7", attach: "\u05B7", say: "\u05B7ה", name: "פַּתַח", sound: "a" },
  { mark: "\u05B8", attach: "\u05B8", say: "\u05B8ה", name: "קָמַץ", sound: "a" },
  { mark: "\u05B5", attach: "\u05B5", say: "\u05B5ה", name: "צֵירֵי", sound: "e" },
  { mark: "\u05B6", attach: "\u05B6", say: "\u05B6ה", name: "סֶגּוֹל", sound: "e" },
  { mark: "\u05B4", attach: "\u05B4", say: "\u05B4י", name: "חִירִיק", sound: "i" },
  { mark: "\u05B9", attach: "ו\u05B9", say: "ו\u05B9", name: "חוֹלָם", sound: "o" },
  { mark: "ו\u05BC", attach: "ו\u05BC", say: "ו\u05BC", name: "שׁוּרוּק", sound: "u" },
  { mark: "\u05BB", attach: "\u05BB", say: "ו\u05BC", name: "קֻבּוּץ", sound: "u" },
];

/**
 * Letters used to build syllables at stages 3–4. Weak/silent onsets (א ע ה ו)
 * are left out — a child cannot hear the difference between אַ and עַ.
 */
export const HEBREAD_SYLLABLE_LETTERS = [
  "ב", "מ", "ש", "ל", "ת", "ס", "ד", "ג",
  "ר", "כ", "פ", "נ", "ק", "ט", "ח", "צ", "ז", "י",
];

/**
 * The written syllable a child sees: letter (+ its point) + the vowel.
 * Normalized because canonical order puts the vowel before the dagesh, and a
 * syllable has to compare equal to the same syllable written inside a word.
 */
export function syllableText(letter: string, nikud: NikudMark): string {
  return `${letter}${LETTER_POINT[letter] ?? ""}${nikud.attach}`.normalize("NFC");
}

/** The same syllable spelled so a Hebrew voice reads it as one sound. */
export function syllableSay(letter: string, nikud: NikudMark): string {
  return `${letter}${LETTER_POINT[letter] ?? ""}${nikud.say}`.normalize("NFC");
}

export type HebPicture = { he: string; emoji: string; l: string };

/**
 * Second (and third) picture per letter. `FIND_PHON` already carries one word
 * for each of the 22 letters; a letter needs several so the spoken example word
 * at stage 1 varies between questions and the child learns the letter rather
 * than one fixed word-picture pair.
 */
const HEBREAD_EXTRA_PICTURES: HebPicture[] = [
  { he: "אוטובוס", emoji: "🚌", l: "א" },
  { he: "אווז", emoji: "🦆", l: "א" },
  { he: "בננה", emoji: "🍌", l: "ב" },
  { he: "בלון", emoji: "🎈", l: "ב" },
  { he: "גזר", emoji: "🥕", l: "ג" },
  { he: "גיטרה", emoji: "🎸", l: "ג" },
  { he: "דלת", emoji: "🚪", l: "ד" },
  { he: "דבורה", emoji: "🐝", l: "ד" },
  { he: "הליקופטר", emoji: "🚁", l: "ה" },
  { he: "וופל", emoji: "🧇", l: "ו" },
  { he: "זית", emoji: "🫒", l: "ז" },
  { he: "חלב", emoji: "🥛", l: "ח" },
  { he: "חציל", emoji: "🍆", l: "ח" },
  { he: "טלפון", emoji: "☎️", l: "ט" },
  { he: "טווס", emoji: "🦚", l: "ט" },
  { he: "ירח", emoji: "🌙", l: "י" },
  { he: "יונה", emoji: "🕊️", l: "י" },
  { he: "כדור", emoji: "⚽", l: "כ" },
  { he: "כוכב", emoji: "⭐", l: "כ" },
  { he: "לימון", emoji: "🍋", l: "ל" },
  { he: "ליצן", emoji: "🤡", l: "ל" },
  { he: "מטריה", emoji: "☂️", l: "מ" },
  { he: "מפתח", emoji: "🔑", l: "מ" },
  { he: "נעל", emoji: "👟", l: "נ" },
  { he: "נר", emoji: "🕯️", l: "נ" },
  { he: "סירה", emoji: "⛵", l: "ס" },
  { he: "סבתא", emoji: "👵", l: "ס" },
  { he: "עוגה", emoji: "🎂", l: "ע" },
  { he: "עין", emoji: "👁️", l: "ע" },
  { he: "פרפר", emoji: "🦋", l: "פ" },
  { he: "פרח", emoji: "🌸", l: "פ" },
  { he: "צפרדע", emoji: "🐸", l: "צ" },
  { he: "ציפור", emoji: "🐦", l: "צ" },
  { he: "קשת", emoji: "🌈", l: "ק" },
  { he: "קוביה", emoji: "🎲", l: "ק" },
  { he: "רגל", emoji: "🦶", l: "ר" },
  { he: "רדיו", emoji: "📻", l: "ר" },
  { he: "שעון", emoji: "⌚", l: "ש" },
  { he: "שמלה", emoji: "👗", l: "ש" },
  { he: "תות", emoji: "🍓", l: "ת" },
  { he: "תפוז", emoji: "🍊", l: "ת" },
];

/** Every picture word, keyed by the letter its name starts with. */
export const HEBREAD_PICTURES: HebPicture[] = [
  ...FIND_PHON.map((w) => ({ he: w.he, emoji: w.emoji, l: w.l })),
  ...HEBREAD_EXTRA_PICTURES,
];

export const PICTURES_BY_LETTER: Record<string, HebPicture[]> = HEBREAD_PICTURES.reduce(
  (acc, p) => {
    (acc[p.l] ||= []).push(p);
    return acc;
  },
  {} as Record<string, HebPicture[]>
);

export type HebWord = {
  /** Pointed form, shown to the child. */
  he: string;
  /** Unpointed form, for text-to-speech. */
  plain: string;
  emoji: string;
  /** First syllable as written in this word. */
  syl: string;
  /** Consonant the word opens with. */
  letter: string;
  /** Index into `NIKUD` of the first syllable's vowel. */
  nik: number;
  /** Both syllables open (CV-CV). Open-syllable words come first. */
  open: boolean;
};

/**
 * Two-syllable pointed words for stages 4–5. Open-syllable words (סַבָּא) are
 * flagged so a run can start with them before closed syllables arrive.
 * Stage 4 reads only their first syllable; stage 5 reads the whole word.
 */
export const HEBREAD_WORDS: HebWord[] = [
  { he: "סַבָּא", plain: "סבא", emoji: "👴", syl: "סַ", letter: "ס", nik: 0, open: true },
  { he: "אַבָּא", plain: "אבא", emoji: "👨", syl: "אַ", letter: "א", nik: 0, open: true },
  { he: "פָּרָה", plain: "פרה", emoji: "🐮", syl: "פָּ", letter: "פ", nik: 1, open: true },
  { he: "מוֹרָה", plain: "מורה", emoji: "👩‍🏫", syl: "מוֹ", letter: "מ", nik: 5, open: true },
  { he: "עוּגָה", plain: "עוגה", emoji: "🎂", syl: "עוּ", letter: "ע", nik: 6, open: true },
  { he: "מִטָּה", plain: "מיטה", emoji: "🛏️", syl: "מִ", letter: "מ", nik: 4, open: true },
  { he: "חַלָּה", plain: "חלה", emoji: "🥖", syl: "חַ", letter: "ח", nik: 0, open: true },
  { he: "סִירָה", plain: "סירה", emoji: "⛵", syl: "סִ", letter: "ס", nik: 4, open: true },
  { he: "פִּיצָה", plain: "פיצה", emoji: "🍕", syl: "פִּ", letter: "פ", nik: 4, open: true },
  { he: "בֻּבָּה", plain: "בובה", emoji: "🧸", syl: "בֻּ", letter: "ב", nik: 7, open: true },
  { he: "כִּסֵּא", plain: "כיסא", emoji: "🪑", syl: "כִּ", letter: "כ", nik: 4, open: true },
  { he: "תֻּכִּי", plain: "תוכי", emoji: "🦜", syl: "תֻּ", letter: "ת", nik: 7, open: true },
  { he: "בַּיִת", plain: "בית", emoji: "🏠", syl: "בַּ", letter: "ב", nik: 0, open: false },
  { he: "כֶּלֶב", plain: "כלב", emoji: "🐶", syl: "כֶּ", letter: "כ", nik: 3, open: false },
  { he: "שֶׁמֶשׁ", plain: "שמש", emoji: "☀️", syl: "שֶׁ", letter: "ש", nik: 3, open: false },
  { he: "דֶּלֶת", plain: "דלת", emoji: "🚪", syl: "דֶּ", letter: "ד", nik: 3, open: false },
  { he: "פֶּרַח", plain: "פרח", emoji: "🌸", syl: "פֶּ", letter: "פ", nik: 3, open: false },
  { he: "נַעַל", plain: "נעל", emoji: "👟", syl: "נַ", letter: "נ", nik: 0, open: false },
  { he: "כַּדּוּר", plain: "כדור", emoji: "⚽", syl: "כַּ", letter: "כ", nik: 0, open: false },
  { he: "חָתוּל", plain: "חתול", emoji: "🐱", syl: "חָ", letter: "ח", nik: 1, open: false },
  { he: "צִפּוֹר", plain: "ציפור", emoji: "🐦", syl: "צִ", letter: "צ", nik: 4, open: false },
  { he: "לִימוֹן", plain: "לימון", emoji: "🍋", syl: "לִ", letter: "ל", nik: 4, open: false },
  { he: "בַּלוֹן", plain: "בלון", emoji: "🎈", syl: "בַּ", letter: "ב", nik: 0, open: false },
  { he: "יֶלֶד", plain: "ילד", emoji: "👦", syl: "יֶ", letter: "י", nik: 3, open: false },
  { he: "מַיִם", plain: "מים", emoji: "💧", syl: "מַ", letter: "מ", nik: 0, open: false },
  { he: "תַּפּוּז", plain: "תפוז", emoji: "🍊", syl: "תַּ", letter: "ת", nik: 0, open: false },
  { he: "מָטוֹס", plain: "מטוס", emoji: "✈️", syl: "מָ", letter: "מ", nik: 1, open: false },
  { he: "כּוֹבַע", plain: "כובע", emoji: "🧢", syl: "כּוֹ", letter: "כ", nik: 5, open: false },
  { he: "יָרֵחַ", plain: "ירח", emoji: "🌙", syl: "יָ", letter: "י", nik: 1, open: false },
  { he: "אַרְנָב", plain: "ארנב", emoji: "🐰", syl: "אַ", letter: "א", nik: 0, open: false },
  { he: "סַבְתָּא", plain: "סבתא", emoji: "👵", syl: "סַ", letter: "ס", nik: 0, open: false },
  { he: "יַלְדָּה", plain: "ילדה", emoji: "👧", syl: "יַ", letter: "י", nik: 0, open: false },
];

/** Child-facing lines. Hints exist at stages 1–2 and are gone by 3–5. */
export const HEBREAD_TEXT = {
  letterHint: (word: string) => t("hebread.letterHint", { word }),
  get pictureHint() {
    return t("hebread.pictureHint");
  },
  get heardPrompt() {
    return t("hebread.heardPrompt");
  },
  letterSay: (name: string, word: string) => t("hebread.letterSay", { name, word }),
  get pictureSay() {
    return t("hebread.pictureSay");
  },
  hearSylSay: (syl: string) => t("hebread.hearSylSay", { syl }),
  get readSylSay() {
    return t("hebread.readSylSay");
  },
  get wordSay() {
    return t("hebread.wordSay");
  },
};

function stageBands(stages: readonly number[]): DifficultyBand[] {
  return stages.map((stage) => ({ stage }));
}

export const HEBREAD_BANDS: Record<DifficultyLevel, DifficultyBand[]> = {
  easy: stageBands([1, 2, 3]),
  medium: stageBands([2, 3, 4]),
  hard: stageBands([3, 4, 5]),
};
