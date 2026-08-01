import { diffParams } from "@/lib/difficulty";
import { LETTER_CONFUSE, LETTER_NAME } from "@/data/find";
import {
  HEBREAD_BANDS,
  HEBREAD_PICTURES,
  HEBREAD_PICTURE_LETTERS,
  HEBREAD_SYLLABLE_LETTERS,
  HEBREAD_TEXT,
  HEBREAD_WORDS,
  NIKUD,
  PICTURES_BY_LETTER,
  syllableSay,
  syllableText,
  type HebPicture,
  type HebWord,
  type NikudMark,
} from "@/data/hebread";
import { rnd, shuffle } from "@/lib/random";
import type { ProviderContext, Question } from "@/lib/types";
import type { StageProvider, StageRender, StageSpeak } from "./stage";

/**
 * The Hebrew reading ladder, five stages of one pick-one question:
 *
 * 1. same first sound — hear a word, tap the picture that starts like it. No
 *    letter is on screen (knowledge/educational/sound-before-symbol.md).
 * 2. sound → letter — hear the letter's name, tap the letter.
 * 3. letter → sound — see the letter, tap a picture whose name starts with it.
 * 4. letter + nikud = one syllable, read whole rather than blended
 *    (knowledge/educational/hebrew-reading-sequence.md). Two directions: hear
 *    the syllable and pick the written form, or read it and pick the picture.
 * 5. whole two-syllable pointed word → picture.
 *
 * Supports fade on a schedule (knowledge/educational/faded-scaffold-ladder.md):
 * the cue picture is gone after stage 2, the spoken letter name after stage 2,
 * the written hint after stage 3, and stage 5 never speaks the word it asks the
 * child to read.
 */

export type HebReadMode = "sound" | "letter" | "picture" | "hearSyl" | "readSyl" | "word";

export type HebReadQuestion = Question & {
  op: "hebread";
  stage: number;
  mode: HebReadMode;
  /** Base consonant under study (stages 2–4). */
  letter?: string;
  /** Spoken-only cue word (stage 1) or example word (stage 2). */
  cueWord?: string;
  cueEmoji?: string;
  /** Written syllable (stage 4) or pointed word (stage 5). */
  text?: string;
  /** Speech spelling of the syllable (stage 4 hearSyl). */
  say?: string;
  options: string[];
  answer: string;
};

/** One nikud mark is added every this many steps, in `NIKUD` order. */
const STEPS_PER_NIKUD = 4;

type Vowel = NikudMark & { i: number };

function nikudPool(step: number): Vowel[] {
  const grown = 1 + Math.floor(Math.max(0, step) / STEPS_PER_NIKUD);
  const n = Math.max(1, Math.min(NIKUD.length, grown));
  return NIKUD.slice(0, n).map((nk, i) => ({ ...nk, i }));
}

function pick<T>(arr: readonly T[]): T {
  return arr[rnd(arr.length)];
}

/** Filter out what this run already asked; fall back to the full pool when spent. */
function fresh<T>(pool: T[], used: string[], keyOf: (item: T) => string): T[] {
  const avail = pool.filter((item) => !used.includes(keyOf(item)));
  return avail.length ? avail : pool;
}

function confusable(a: string, b: string): boolean {
  if (a === b) return false;
  return LETTER_CONFUSE.some(
    (family) => (family as readonly string[]).includes(a) && (family as readonly string[]).includes(b)
  );
}

/** Letters that are safe to show next to every letter already chosen. */
function nonConfusable(pool: string[], chosen: string[]): string[] {
  return pool.filter((l) => !chosen.includes(l) && chosen.every((c) => !confusable(l, c)));
}

function pickLetters(pool: string[], count: number, chosen: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const avail = nonConfusable(shuffle(pool), [...chosen, ...out]);
    if (!avail.length) break;
    out.push(avail[0]);
  }
  return out;
}

function keyOf(stage: number, mode: HebReadMode, answer: string): string {
  return `hebread:${stage}:${mode}:${answer}`;
}

/** Stage 1 — hear a word, tap the picture that starts with the same sound. */
function genSameFirstSound(ctx: ProviderContext): HebReadQuestion {
  const pool = HEBREAD_PICTURES.filter((p) => HEBREAD_PICTURE_LETTERS.includes(p.l));
  const answer = pick(fresh(pool, ctx.usedKeys, (p) => keyOf(1, "sound", p.emoji)));
  const cue = pick(PICTURES_BY_LETTER[answer.l].filter((p) => p.emoji !== answer.emoji));

  const distractors: HebPicture[] = [];
  const taken = [answer.l];
  for (const cand of shuffle(HEBREAD_PICTURES)) {
    if (distractors.length === 2) break;
    if (taken.includes(cand.l) || cand.emoji === cue.emoji) continue;
    taken.push(cand.l);
    distractors.push(cand);
  }

  return {
    op: "hebread",
    stage: 1,
    mode: "sound",
    letter: answer.l,
    cueWord: cue.he,
    cueEmoji: cue.emoji,
    options: shuffle([answer, ...distractors]).map((p) => p.emoji),
    answer: answer.emoji,
  };
}

/** Stage 2 — hear the letter's sound, tap the letter. */
function genSoundToLetter(ctx: ProviderContext): HebReadQuestion {
  const letters = Object.keys(PICTURES_BY_LETTER);
  const letter = pick(fresh(letters, ctx.usedKeys, (l) => keyOf(2, "letter", l)));
  const cue = pick(PICTURES_BY_LETTER[letter]);
  const distractors = pickLetters(letters, 2, [letter]);

  return {
    op: "hebread",
    stage: 2,
    mode: "letter",
    letter,
    cueWord: cue.he,
    cueEmoji: cue.emoji,
    options: shuffle([letter, ...distractors]),
    answer: letter,
  };
}

/** Stage 3 — see the letter, tap a picture whose name starts with it. */
function genLetterToSound(ctx: ProviderContext): HebReadQuestion {
  const answer = pick(fresh(HEBREAD_PICTURES, ctx.usedKeys, (p) => keyOf(3, "picture", p.emoji)));
  // Distractor pictures must not start with a letter the child could mistake
  // for the one on screen, or the wrong tap teaches the wrong shape.
  const others = pickLetters(Object.keys(PICTURES_BY_LETTER), 2, [answer.l]);
  const distractors = others.map((l) => pick(PICTURES_BY_LETTER[l]));

  return {
    op: "hebread",
    stage: 3,
    mode: "picture",
    letter: answer.l,
    options: shuffle([answer, ...distractors]).map((p) => p.emoji),
    answer: answer.emoji,
  };
}

type Syllable = { letter: string; vowel: Vowel; text: string };

function syllables(vowels: Vowel[]): Syllable[] {
  const out: Syllable[] = [];
  for (const letter of HEBREAD_SYLLABLE_LETTERS) {
    for (const vowel of vowels) out.push({ letter, vowel, text: syllableText(letter, vowel) });
  }
  return out;
}

/** Stage 4a — hear one syllable, tap the written form. */
function genHearSyllable(ctx: ProviderContext, vowels: Vowel[]): HebReadQuestion {
  const pool = syllables(vowels);
  const answer = pick(fresh(pool, ctx.usedKeys, (s) => keyOf(4, "hearSyl", s.text)));

  // Two options may never read the same: patach and kamatz both say "a", so the
  // pair (letter, sound) — not the mark — is what has to be unique.
  const chosen: Syllable[] = [answer];
  for (const cand of shuffle(pool)) {
    if (chosen.length === 3) break;
    const clash = chosen.some(
      (s) =>
        (s.letter === cand.letter && s.vowel.sound === cand.vowel.sound) ||
        confusable(s.letter, cand.letter)
    );
    if (!clash) chosen.push(cand);
  }

  return {
    op: "hebread",
    stage: 4,
    mode: "hearSyl",
    letter: answer.letter,
    text: answer.text,
    say: syllableSay(answer.letter, answer.vowel),
    options: shuffle(chosen).map((s) => s.text),
    answer: answer.text,
  };
}

/** Stage 4b — read one syllable, tap the picture whose word starts with it. */
function genReadSyllable(ctx: ProviderContext, vowels: Vowel[]): HebReadQuestion {
  const taught = vowels.map((v) => v.i);
  const pool = HEBREAD_WORDS.filter(
    (w) => taught.includes(w.nik) && HEBREAD_SYLLABLE_LETTERS.includes(w.letter)
  );
  const answer = pick(fresh(pool, ctx.usedKeys, (w) => keyOf(4, "readSyl", w.emoji)));

  const chosen: HebWord[] = [answer];
  for (const cand of shuffle(pool)) {
    if (chosen.length === 3) break;
    const clash = chosen.some(
      (w) =>
        w.emoji === cand.emoji ||
        (w.letter === cand.letter && NIKUD[w.nik].sound === NIKUD[cand.nik].sound)
    );
    if (!clash) chosen.push(cand);
  }

  return {
    op: "hebread",
    stage: 4,
    mode: "readSyl",
    letter: answer.letter,
    text: answer.syl,
    options: shuffle(chosen).map((w) => w.emoji),
    answer: answer.emoji,
  };
}

/** Stage 5 — read a whole pointed word, tap the picture it names. */
function genWord(ctx: ProviderContext): HebReadQuestion {
  // Open syllables (סַבָּא) before closed ones; closed words join once a run is
  // past its first block.
  const open = HEBREAD_WORDS.filter((w) => w.open);
  const pool = ctx.step >= STEPS_PER_NIKUD * 2 ? HEBREAD_WORDS : open;
  const answer = pick(fresh(pool, ctx.usedKeys, (w) => keyOf(5, "word", w.emoji)));

  const chosen: HebWord[] = [answer];
  for (const cand of shuffle(HEBREAD_WORDS)) {
    if (chosen.length === 3) break;
    const clash = chosen.some((w) => w.emoji === cand.emoji || w.syl === cand.syl);
    if (!clash) chosen.push(cand);
  }

  return {
    op: "hebread",
    stage: 5,
    mode: "word",
    letter: answer.letter,
    text: answer.he,
    cueWord: answer.plain,
    options: shuffle(chosen).map((w) => w.emoji),
    answer: answer.emoji,
  };
}

export const hebreadProvider: StageProvider = {
  bands: HEBREAD_BANDS,

  generate(ctx: ProviderContext): HebReadQuestion {
    const p = diffParams<{ stage?: number }>(ctx.curriculum, ctx.level, ctx.step);
    const stage = Math.max(1, Math.min(5, Number(p.stage) || 1));
    switch (stage) {
      case 2:
        return genSoundToLetter(ctx);
      case 3:
        return genLetterToSound(ctx);
      case 4: {
        const vowels = nikudPool(ctx.step);
        return rnd(2) ? genHearSyllable(ctx, vowels) : genReadSyllable(ctx, vowels);
      }
      case 5:
        return genWord(ctx);
      default:
        return genSameFirstSound(ctx);
    }
  },

  key(q) {
    const qq = q as HebReadQuestion;
    return keyOf(qq.stage, qq.mode, qq.answer);
  },

  render(q: Question): StageRender {
    const qq = q as HebReadQuestion;
    const options = qq.options;
    switch (qq.mode) {
      case "letter":
        return {
          prompt: qq.cueEmoji ?? "",
          hint: HEBREAD_TEXT.letterHint(qq.cueWord ?? ""),
          options,
          variant: "answerFind",
        };
      case "picture":
        return {
          prompt: qq.letter ?? "",
          hint: HEBREAD_TEXT.pictureHint,
          options,
          variant: "answerEng",
        };
      case "hearSyl":
        return { prompt: HEBREAD_TEXT.heardPrompt, options, variant: "answerFind" };
      case "readSyl":
        return { prompt: qq.text ?? "", options, variant: "answerEng" };
      case "word":
        return { prompt: qq.text ?? "", options, variant: "answerEng" };
      default:
        return {
          prompt: qq.cueEmoji ?? "",
          hint: HEBREAD_TEXT.sameSoundHint,
          options,
          variant: "answerEng",
        };
    }
  },

  speak(q: Question): StageSpeak {
    const qq = q as HebReadQuestion;
    switch (qq.mode) {
      case "letter": {
        const name = LETTER_NAME[qq.letter ?? ""] || qq.letter || "";
        return { he: HEBREAD_TEXT.letterSay(name, qq.cueWord ?? "") };
      }
      case "picture":
        // The letter is on screen; naming it would answer the question.
        return { he: HEBREAD_TEXT.pictureSay };
      case "hearSyl":
        return { he: HEBREAD_TEXT.hearSylSay(qq.say ?? "") };
      case "readSyl":
        return { he: HEBREAD_TEXT.readSylSay };
      case "word":
        // Never read the word aloud — reading it is the task.
        return { he: HEBREAD_TEXT.wordSay };
      default:
        return { he: HEBREAD_TEXT.sameSoundSay(qq.cueWord ?? "") };
    }
  },
};
