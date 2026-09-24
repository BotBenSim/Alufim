import { diffParams } from "@/lib/difficulty";
import {
  ENG_CONFUSE,
  ENGREAD_BANDS,
  engreadCopy,
  ENGREAD_CVC,
  ENGREAD_PICS,
  engSound,
  PHONICS_ORDER,
  type EngCvc,
  type EngPic,
} from "@/data/engread";
import { rnd, shuffle } from "@/lib/random";
import type { ProviderContext, Question } from "@/lib/types";
import type { StageProvider, StageRender, StageSpeak } from "./stage";

export type EngReadQuestion = Question & {
  op: "engread";
  /** 1–5, see ENGREAD_STAGES. */
  stage: number;
  /** The letter the question turns on — the onset at the word rungs. */
  letter: string;
  /** The English word the question is about: read at 3–4, spelled at 5. */
  word?: string;
  /** Shown instead of a written prompt (rung 5). */
  promptEmoji?: string;
  /** Mnemonic keyword under the prompt (rung 1). */
  hintEmoji?: string;
  /** What the English voice says, at the stages where it says anything. */
  say?: string;
  options: string[];
  answer: string;
};

const LETTERS: readonly string[] = PHONICS_ORDER;

function pick<T>(arr: readonly T[]): T {
  return arr[rnd(arr.length)];
}

/** Drop what this run has already asked; fall back to the full pool when spent. */
function fresh<T>(pool: readonly T[], ctx: ProviderContext, keyOf: (x: T) => string): T[] {
  const avail = pool.filter((x) => !ctx.usedKeys.includes(keyOf(x)));
  return avail.length ? avail : [...pool];
}

function confusablesOf(letter: string): string[] {
  const out: string[] = [];
  ENG_CONFUSE.forEach((group) => {
    if ((group as readonly string[]).includes(letter)) {
      group.forEach((g) => {
        if (g !== letter && !out.includes(g)) out.push(g);
      });
    }
  });
  return out;
}

function soundOf(letter: string): string {
  return engSound(letter)?.sound ?? letter;
}

function sayOf(letter: string): string {
  return engSound(letter)?.say ?? letter;
}

/**
 * Two letters may not appear in one question when they are confusable, or when
 * they make the same sound (`c` and `k`) — then both answers would be right.
 */
function letterClash(a: string, b: string): boolean {
  return a === b || soundOf(a) === soundOf(b) || confusablesOf(a).includes(b);
}

function letterFits(letter: string, chosen: readonly string[]): boolean {
  return !chosen.some((c) => letterClash(c, letter));
}

/**
 * Emoji options for a picture question. A distractor must make a different
 * first sound (otherwise it is a second right answer), show a picture nobody
 * else is showing, and keep clear of the other letters on the card.
 */
function pickPicDistractors(
  avoidSound: string,
  shown: readonly EngPic[],
  count: number
): EngPic[] {
  const chosen: EngPic[] = [];
  const letters = shown.map((p) => p.l);
  const taken = shown.map((p) => p.emoji);
  shuffle([...ENGREAD_PICS]).forEach((cand) => {
    if (chosen.length >= count) return;
    if (cand.sound === avoidSound) return;
    if (taken.includes(cand.emoji)) return;
    if (!letterFits(cand.l, letters)) return;
    chosen.push(cand);
    letters.push(cand.l);
    taken.push(cand.emoji);
  });
  return chosen;
}

/**
 * Word options for rungs 3–4, where the words are the prompt or the thing being
 * matched to a picture. Same-rime words come first so the child has to decode
 * the onset rather than recognise a silhouette; onsets stay clear of one
 * another's confusable families.
 */
function pickWordDistractors(target: EngCvc, count: number): EngCvc[] {
  const rime = target.en.slice(1);
  const sameRime = shuffle(
    ENGREAD_CVC.filter((w) => w.en !== target.en && w.en.slice(1) === rime)
  );
  const rest = shuffle(
    ENGREAD_CVC.filter((w) => w.en !== target.en && w.en.slice(1) !== rime)
  );
  const chosen: EngCvc[] = [];
  const onsets = [target.en[0]];
  const taken = [target.emoji];
  [...sameRime, ...rest].forEach((cand) => {
    if (chosen.length >= count) return;
    if (taken.includes(cand.emoji)) return;
    if (!letterFits(cand.en[0], onsets)) return;
    chosen.push(cand);
    onsets.push(cand.en[0]);
    taken.push(cand.emoji);
  });
  return chosen;
}

/** Index of the one letter two same-length words differ at, or -1 if not exactly one. */
function diffSlot(a: string, b: string): number {
  if (a.length !== b.length) return -1;
  let at = -1;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue;
    if (at >= 0) return -1;
    at = i;
  }
  return at;
}

/**
 * True when no slot of a set of written words puts two clashing letters against
 * each other. Letters only compete where they actually differ: `pan`/`pin` ask
 * the child to tell `a` from `i` and ask nothing of the `p` and the `n` they
 * share, so the confusable rule applies slot by slot rather than word by word.
 */
function spellingSetFits(words: readonly string[]): boolean {
  const len = Math.max(...words.map((w) => w.length));
  for (let i = 0; i < len; i++) {
    const slot = [...new Set(words.map((w) => w[i]).filter(Boolean))];
    for (let a = 0; a < slot.length; a++) {
      for (let b = a + 1; b < slot.length; b++) {
        if (letterClash(slot[a], slot[b])) return false;
      }
    }
  }
  return true;
}

/**
 * Written-word options for rung 5. Near misses come first, and among those the
 * ones that differ somewhere other than the first letter (`cat`/`can`,
 * `pan`/`pin`), so a child who reads the onset and stops cannot get through.
 * Twenty-one of the 32 words have such a neighbour and six have an onset-only
 * one; the remaining five (`bed`, `kid`, `pot`, `cup`, `tub`) fall back to any
 * other decodable word, so no word is dropped for want of a neighbour.
 */
function pickSpellingDistractors(target: EngCvc, count: number): EngCvc[] {
  const rank = (w: EngCvc) => {
    const at = diffSlot(target.en, w.en);
    if (at > 0) return 0; // differs in the vowel or the final letter
    if (at === 0) return 1; // differs in the onset only
    return 2;
  };
  // Stable sort keeps the shuffle inside each rank, so the set varies run to run.
  const pool = shuffle(ENGREAD_CVC.filter((w) => w.en !== target.en)).sort(
    (a, b) => rank(a) - rank(b)
  );
  const chosen: EngCvc[] = [];
  pool.forEach((cand) => {
    if (chosen.length >= count) return;
    if (!spellingSetFits([target.en, ...chosen.map((w) => w.en), cand.en])) return;
    chosen.push(cand);
  });
  return chosen;
}

/**
 * Rung 1 — hear a letter sound (the phoneme, never the letter name), pick the
 * letter. The ladder opens here so that a letter is on screen from the first
 * question; the sound still comes first within the question itself
 * (knowledge/educational/sound-before-symbol.md).
 */
function genSoundToLetter(ctx: ProviderContext): EngReadQuestion {
  const target = pick(fresh(LETTERS, ctx, (l) => `engread:1:${l}`));
  const chosen = [target];
  shuffle([...LETTERS]).forEach((l) => {
    if (chosen.length >= 3) return;
    if (!letterFits(l, chosen)) return;
    chosen.push(l);
  });
  const keywords = ENGREAD_PICS.filter((p) => p.l === target);
  return {
    op: "engread",
    stage: 1,
    letter: target,
    hintEmoji: keywords.length ? pick(keywords).emoji : undefined,
    say: sayOf(target),
    options: shuffle(chosen),
    answer: target,
  };
}

/**
 * Rung 2 — see a letter, pick the picture whose English name starts with it.
 * The sound is not played: turning the symbol back into a sound is the skill.
 */
function genLetterToSound(ctx: ProviderContext): EngReadQuestion {
  const withPics = LETTERS.filter((l) => ENGREAD_PICS.some((p) => p.l === l));
  const target = pick(fresh(withPics, ctx, (l) => `engread:2:${l}`));
  const answer = pick(ENGREAD_PICS.filter((p) => p.l === target));
  const options = [answer, ...pickPicDistractors(soundOf(target), [answer], 2)];
  return {
    op: "engread",
    stage: 2,
    letter: target,
    options: shuffle(options.map((p) => p.emoji)),
    answer: answer.emoji,
  };
}

/**
 * Rung 3 — body-coda blending: the word arrives split as `s`+`at`, and the
 * child picks the whole word. Two parts, not three, because onset–rime is what
 * beginning readers can hold in mind.
 */
function genBlend(ctx: ProviderContext): EngReadQuestion {
  const target = pick(fresh(ENGREAD_CVC, ctx, (w) => `engread:3:${w.en}`));
  const onset = target.en[0];
  const rime = target.en.slice(1);
  const options = [target, ...pickWordDistractors(target, 2)];
  return {
    op: "engread",
    stage: 3,
    letter: onset,
    word: target.en,
    say: `${sayOf(onset)}, ${rime}`,
    options: shuffle(options.map((w) => w.en)),
    answer: target.en,
  };
}

/**
 * Rung 4 — a decodable word is shown and nothing is spoken in English. This is
 * the rung where the child reads instead of listening, so the audio scaffold of
 * the rungs below is gone (knowledge/educational/faded-scaffold-ladder.md).
 */
function genReadWord(ctx: ProviderContext): EngReadQuestion {
  const target = pick(fresh(ENGREAD_CVC, ctx, (w) => `engread:4:${w.en}`));
  const options = [target, ...pickWordDistractors(target, 2)];
  return {
    op: "engread",
    stage: 4,
    letter: target.en[0],
    word: target.en,
    options: shuffle(options.map((w) => w.emoji)),
    answer: target.emoji,
  };
}

/**
 * Rung 5 — the picture is given and the child picks its spelling: rung 4 run
 * backwards, and the first rung that asks which letters a word is made of
 * rather than what a word says. The options are near misses wherever the data
 * has them, so recognising the first letter is not enough.
 */
function genWriteWord(ctx: ProviderContext): EngReadQuestion {
  const target = pick(fresh(ENGREAD_CVC, ctx, (w) => `engread:5:${w.en}`));
  const options = [target, ...pickSpellingDistractors(target, 2)];
  return {
    op: "engread",
    stage: 5,
    letter: target.en[0],
    word: target.en,
    promptEmoji: target.emoji,
    options: shuffle(options.map((w) => w.en)),
    answer: target.en,
  };
}

export const engreadProvider: StageProvider = {
  bands: ENGREAD_BANDS,

  generate(ctx: ProviderContext): EngReadQuestion {
    const p = diffParams<{ stage?: number }>(ctx.curriculum, ctx.level, ctx.step);
    switch (p.stage ?? 1) {
      case 2:
        return genLetterToSound(ctx);
      case 3:
        return genBlend(ctx);
      case 4:
        return genReadWord(ctx);
      case 5:
        return genWriteWord(ctx);
      default:
        return genSoundToLetter(ctx);
    }
  },

  key(q) {
    const qq = q as EngReadQuestion;
    // Rungs 3–5 repeat a word, rungs 1–2 a letter.
    return `engread:${qq.stage}:${qq.word ?? qq.letter}`;
  },

  render(q: Question): StageRender {
    const qq = q as EngReadQuestion;
    const copy = engreadCopy(qq.stage);
    const options = qq.options;
    switch (qq.stage) {
      case 2:
        return { prompt: qq.letter, hint: copy.hint, options, variant: "answerEng" };
      case 3:
        return {
          prompt: `${qq.letter}-${(qq.word ?? "").slice(1)}`,
          hint: copy.hint,
          options,
          variant: "answerFind",
        };
      case 4:
        return { prompt: qq.word ?? "", hint: copy.hint, options, variant: "answerEng" };
      case 5:
        return {
          prompt: qq.promptEmoji ?? "",
          hint: copy.hint,
          options,
          variant: "answerFind",
        };
      default:
        return {
          prompt: copy.prompt ?? "",
          hint: qq.hintEmoji,
          options,
          variant: "answerFind",
        };
    }
  },

  speak(q: Question): StageSpeak {
    const qq = q as EngReadQuestion;
    return { he: engreadCopy(qq.stage).he, en: qq.say };
  },
};
