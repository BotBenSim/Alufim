import { diffParams } from "@/lib/difficulty";
import {
  ENG_CONFUSE,
  ENGREAD_BANDS,
  ENGREAD_COPY,
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
  /** The letter the question turns on — the onset at stages 4–5. */
  letter: string;
  /** The English word the question is about: spoken at 1, read at 4–5. */
  word?: string;
  /** Shown instead of a written prompt (stage 1). */
  promptEmoji?: string;
  /** Mnemonic keyword under the prompt (stage 2). */
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

function picsWithSound(sound: string): EngPic[] {
  return ENGREAD_PICS.filter((p) => p.sound === sound);
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
 * Word options for stages 4–5. Same-rime words come first so the child has to
 * decode the onset rather than recognise a silhouette; onsets stay clear of one
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

/**
 * Stage 1 — hear an English word, pick the picture that starts with the same
 * sound. No letters anywhere: the child is matching phonemes, not symbols
 * (knowledge/educational/sound-before-symbol.md).
 */
function genSameFirstSound(ctx: ProviderContext): EngReadQuestion {
  // A word can only be the target if some other picture shares its first sound.
  const targets = ENGREAD_PICS.filter((p) => picsWithSound(p.sound).length > 1);
  const target = pick(fresh(targets, ctx, (p) => `engread:1:${p.en}`));
  const answer = pick(picsWithSound(target.sound).filter((p) => p.en !== target.en));
  const options = [answer, ...pickPicDistractors(target.sound, [target, answer], 2)];
  return {
    op: "engread",
    stage: 1,
    letter: target.l,
    word: target.en,
    promptEmoji: target.emoji,
    say: target.en,
    options: shuffle(options.map((p) => p.emoji)),
    answer: answer.emoji,
  };
}

/** Stage 2 — hear a letter sound (the phoneme, never the letter name), pick the letter. */
function genSoundToLetter(ctx: ProviderContext): EngReadQuestion {
  const target = pick(fresh(LETTERS, ctx, (l) => `engread:2:${l}`));
  const chosen = [target];
  shuffle([...LETTERS]).forEach((l) => {
    if (chosen.length >= 3) return;
    if (!letterFits(l, chosen)) return;
    chosen.push(l);
  });
  const keywords = ENGREAD_PICS.filter((p) => p.l === target);
  return {
    op: "engread",
    stage: 2,
    letter: target,
    hintEmoji: keywords.length ? pick(keywords).emoji : undefined,
    say: sayOf(target),
    options: shuffle(chosen),
    answer: target,
  };
}

/**
 * Stage 3 — see a letter, pick the picture whose English name starts with it.
 * The sound is not played: turning the symbol back into a sound is the skill.
 */
function genLetterToSound(ctx: ProviderContext): EngReadQuestion {
  const withPics = LETTERS.filter((l) => ENGREAD_PICS.some((p) => p.l === l));
  const target = pick(fresh(withPics, ctx, (l) => `engread:3:${l}`));
  const answer = pick(ENGREAD_PICS.filter((p) => p.l === target));
  const options = [answer, ...pickPicDistractors(soundOf(target), [answer], 2)];
  return {
    op: "engread",
    stage: 3,
    letter: target,
    options: shuffle(options.map((p) => p.emoji)),
    answer: answer.emoji,
  };
}

/**
 * Stage 4 — body-coda blending: the word arrives split as `s`+`at`, and the
 * child picks the whole word. Two parts, not three, because onset–rime is what
 * beginning readers can hold in mind.
 */
function genBlend(ctx: ProviderContext): EngReadQuestion {
  const target = pick(fresh(ENGREAD_CVC, ctx, (w) => `engread:4:${w.en}`));
  const onset = target.en[0];
  const rime = target.en.slice(1);
  const options = [target, ...pickWordDistractors(target, 2)];
  return {
    op: "engread",
    stage: 4,
    letter: onset,
    word: target.en,
    say: `${sayOf(onset)}, ${rime}`,
    options: shuffle(options.map((w) => w.en)),
    answer: target.en,
  };
}

/**
 * Stage 5 — a decodable word is shown and nothing is spoken in English. This is
 * the rung where the child reads instead of listening, so the audio scaffold of
 * stages 1–4 is gone (knowledge/educational/faded-scaffold-ladder.md).
 */
function genReadWord(ctx: ProviderContext): EngReadQuestion {
  const target = pick(fresh(ENGREAD_CVC, ctx, (w) => `engread:5:${w.en}`));
  const options = [target, ...pickWordDistractors(target, 2)];
  return {
    op: "engread",
    stage: 5,
    letter: target.en[0],
    word: target.en,
    options: shuffle(options.map((w) => w.emoji)),
    answer: target.emoji,
  };
}

export const engreadProvider: StageProvider = {
  bands: ENGREAD_BANDS,

  generate(ctx: ProviderContext): EngReadQuestion {
    const p = diffParams<{ stage?: number }>(ctx.curriculum, ctx.level, ctx.step);
    switch (p.stage ?? 2) {
      case 1:
        return genSameFirstSound(ctx);
      case 3:
        return genLetterToSound(ctx);
      case 4:
        return genBlend(ctx);
      case 5:
        return genReadWord(ctx);
      default:
        return genSoundToLetter(ctx);
    }
  },

  key(q) {
    const qq = q as EngReadQuestion;
    // Stage 1 repeats a spoken word, 4–5 repeat a written word, 2–3 a letter.
    return `engread:${qq.stage}:${qq.word ?? qq.letter}`;
  },

  render(q: Question): StageRender {
    const qq = q as EngReadQuestion;
    const copy = ENGREAD_COPY[qq.stage] ?? {};
    const options = qq.options;
    switch (qq.stage) {
      case 1:
        return {
          prompt: qq.promptEmoji ?? "",
          hint: copy.hint,
          options,
          variant: "answerEng",
        };
      case 3:
        return { prompt: qq.letter, hint: copy.hint, options, variant: "answerEng" };
      case 4:
        return {
          prompt: `${qq.letter}-${(qq.word ?? "").slice(1)}`,
          hint: copy.hint,
          options,
          variant: "answerFind",
        };
      case 5:
        return { prompt: qq.word ?? "", hint: copy.hint, options, variant: "answerEng" };
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
    return { he: ENGREAD_COPY[qq.stage]?.he, en: qq.say };
  },
};
