import type { Solfa } from "@/lib/audio/musicTones";
import type { DifficultyBand, DifficultyLevel } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * Music ladder — sound before symbol. See
 * knowledge/educational/sound-before-symbol.md and
 * backlog/music-ear-and-chords-game.md for the full design (horizontal keyboard
 * that grows 5 → 7 → 12 keys; chords taught as movable shapes).
 *
 * Content only. Frequencies are never written down here beyond the seed keys —
 * `lib/audio/musicTones.ts` derives them, so a new key is a parameter.
 */
/**
 * Chords first. A parent opening the game for a child who "wants to learn chords"
 * should meet a chord on the first question, not after a run of single notes.
 */
export const MUSIC_STAGES = [
  { stage: 1, get label() { return t("music.stages.1"); } },
  { stage: 2, get label() { return t("music.stages.2"); } },
  { stage: 3, get label() { return t("music.stages.3"); } },
  { stage: 4, get label() { return t("music.stages.4"); } },
  { stage: 5, get label() { return t("music.stages.5"); } },
] as const;

/** Kodály's pentatonic core — no combination of these can sound wrong (Orff). */
export const PENTATONIC_SOLFA: readonly Solfa[] = ["do", "re", "mi", "sol", "la"];

/** The seven-key set: fa and ti arrive, and with them dissonance. */
export const DIATONIC_SOLFA: readonly Solfa[] = [
  "do",
  "re",
  "mi",
  "fa",
  "sol",
  "la",
  "ti",
];

/** Movable-do names as an Israeli child will hear them. */
export const SOLFA_HE: Record<Solfa, string> = {
  do: "דו",
  re: "רה",
  mi: "מי",
  fa: "פה",
  sol: "סול",
  la: "לה",
  ti: "סי",
};

/**
 * Stand-in for the keyboard until the real key surface exists: one bar per key,
 * rising with pitch. The slot of each key is fixed, so when fa and ti arrive the
 * other keys do not move — the spatial map is never relearned.
 */
export const SOLFA_KEY_GLYPH: Record<Solfa, string> = {
  do: "▁",
  re: "▂",
  mi: "▃",
  fa: "▄",
  sol: "▅",
  la: "▆",
  ti: "▇",
};

/**
 * Answer labels. Kept as data so the tests and the provider agree on them.
 * "Happy / sad", never מז'ור/מינור — the feeling comes years before the word.
 */
export const MUSIC_HAPPY = "😄";
export const MUSIC_SAD = "😢";

/**
 * The three chords the ear meets first: the I, IV and V triads, named by the
 * scale degree they sit on. Degrees, not chord letters — the same three shapes
 * are דו/פה/סול in every key, so the child learns one map instead of twelve.
 */
export const MUSIC_CHORD_DEGREES: readonly Solfa[] = ["do", "fa", "sol"];

/**
 * Seed keys, as semitones from concert A. Every question is transposed to one of
 * them: the solfège name is the child's stable identifier, the pitch is not.
 */
export const MUSIC_TONICS = [
  { id: "C", he: "דו", fromA4: -9 },
  { id: "D", he: "רה", fromA4: -7 },
  { id: "F", he: "פה", fromA4: -4 },
  { id: "G", he: "סול", fromA4: -2 },
] as const;

export type MusicPhrase = { id: string; solfa: readonly Solfa[] };

/**
 * Phrase bank in Kodály order — sol–mi first, then la, then the rest of the
 * pentatonic, and only at the end phrases that need fa or ti. Every phrase uses
 * notes the child has already met at that band (a "decodable text" for the ear).
 */
export const MUSIC_PHRASES: readonly MusicPhrase[] = [
  { id: "sm", solfa: ["sol", "mi"] },
  { id: "ms", solfa: ["mi", "sol"] },
  { id: "ls", solfa: ["la", "sol"] },
  { id: "sl", solfa: ["sol", "la"] },
  { id: "dm", solfa: ["do", "mi"] },
  { id: "md", solfa: ["mi", "do"] },
  { id: "rd", solfa: ["re", "do"] },
  { id: "sms", solfa: ["sol", "mi", "sol"] },
  { id: "msm", solfa: ["mi", "sol", "mi"] },
  { id: "sls", solfa: ["sol", "la", "sol"] },
  { id: "lsm", solfa: ["la", "sol", "mi"] },
  { id: "mrd", solfa: ["mi", "re", "do"] },
  { id: "drm", solfa: ["do", "re", "mi"] },
  { id: "smd", solfa: ["sol", "mi", "do"] },
  { id: "smsm", solfa: ["sol", "mi", "sol", "mi"] },
  { id: "msls", solfa: ["mi", "sol", "la", "sol"] },
  { id: "drms", solfa: ["do", "re", "mi", "sol"] },
  { id: "slsm", solfa: ["sol", "la", "sol", "mi"] },
  { id: "lsmr", solfa: ["la", "sol", "mi", "re"] },
  { id: "dmsl", solfa: ["do", "mi", "sol", "la"] },
  { id: "sfm", solfa: ["sol", "fa", "mi"] },
  { id: "mfs", solfa: ["mi", "fa", "sol"] },
  { id: "ltl", solfa: ["la", "ti", "la"] },
  { id: "drmf", solfa: ["do", "re", "mi", "fa"] },
  { id: "ltls", solfa: ["la", "ti", "la", "sol"] },
];

/**
 * Per-band params. `stage` picks the rung, `notes` the size of the key set,
 * `len` the phrase length, and `hint` whether the supporting scaffold is still
 * there — every support has a band where it disappears
 * (knowledge/educational/faded-scaffold-ladder.md), which is why `hint` is only
 * ever true in a level's first band.
 */
export type MusicBand = {
  stage: number;
  /** 5 = pentatonic, 7 = diatonic. */
  notes?: number;
  /** Phrase length at stage 4. Length is the knob, never speed. */
  len?: number;
  /** Stage 1: label happy/sad. Stages 3/4/5: play do first as a reference. */
  hint?: boolean;
};

/**
 * Easy opens on a chord and stays on chords for two bands, so a child who never
 * leaves the default level still learns the two chord feelings and then the
 * three chord names. Single notes and phrases come after.
 */
export const MUSIC_BANDS: Record<DifficultyLevel, DifficultyBand[]> = {
  easy: [
    { stage: 1, notes: 5, hint: true },
    { stage: 2, notes: 5 },
    { stage: 3, notes: 5 },
  ],
  medium: [
    { stage: 2, notes: 5, hint: true },
    { stage: 3, notes: 5, hint: true },
    { stage: 4, notes: 5 },
  ],
  hard: [
    { stage: 3, notes: 7, hint: true },
    { stage: 4, notes: 7 },
    { stage: 5, notes: 7, len: 3 },
  ],
};
