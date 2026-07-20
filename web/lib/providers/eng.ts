import type { AnswerChoice, AnswerGlyph } from "@/lib/answerChoice";
import { diffParams } from "@/lib/difficulty";
import { rnd, shuffle } from "@/lib/random";
import { VOCAB, VOCAB_ORDER } from "@/data/vocab";
import type { Provider, ProviderContext } from "@/lib/types";

export type EngWord = {
  en: string;
  he: string;
  emoji: string;
  /** CSS color — rendered as a round swatch (Unicode has no pink circle). */
  swatch?: string;
};

export type EngQuestion = {
  op: "eng";
  word: EngWord;
  options: EngWord[];
  answer: string;
};

/** Stable option id — prefer swatch so pink isn’t forced onto a flower/heart emoji. */
export function engAnswerKey(w: EngWord): string {
  return w.swatch ? `swatch:${w.swatch}` : w.emoji;
}

export function engGlyph(w: EngWord): AnswerGlyph {
  return w.swatch
    ? { kind: "swatch", color: w.swatch }
    : { kind: "emoji", emoji: w.emoji };
}

export function engChoice(w: EngWord): AnswerChoice {
  return { value: engAnswerKey(w), glyph: engGlyph(w) };
}

/** Like addRenderMeta — eng presentation data for the shared question view. */
export function engRenderMeta(q: EngQuestion) {
  return {
    word: q.word.en,
    hint: "איזה אחד זה?",
    options: q.options.map(engChoice),
  };
}

export const engProvider: Provider = {
  generate(ctx: ProviderContext): EngQuestion {
    const maxLen =
      diffParams<{ maxLen: number }>(ctx.curriculum, ctx.level, ctx.step).maxLen || 99;
    let pool: EngWord[] = [];
    VOCAB_ORDER.forEach((theme) => {
      VOCAB[theme].words.forEach((w: EngWord) => {
        if (w.en.replace(/\s/g, "").length <= maxLen) pool.push(w);
      });
    });
    if (!pool.length) {
      VOCAB_ORDER.forEach((theme) => {
        pool = pool.concat(VOCAB[theme].words);
      });
    }
    let avail = pool.filter((w) => !ctx.usedKeys.includes(`eng:${w.en}`));
    if (!avail.length) avail = pool;
    const word = avail[rnd(avail.length)];
    const distractors: EngWord[] = [];
    let guard = 0;
    while (distractors.length < 2 && guard < 120) {
      guard++;
      const d = pool[rnd(pool.length)];
      if (engAnswerKey(d) === engAnswerKey(word) || distractors.includes(d)) continue;
      distractors.push(d);
    }
    const options = shuffle([word, ...distractors]);
    return { op: "eng", word, options, answer: engAnswerKey(word) };
  },
  key(q) {
    return `eng:${(q as EngQuestion).word.en}`;
  },
};
