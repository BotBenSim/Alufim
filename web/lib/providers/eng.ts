import { diffParams } from "@/lib/difficulty";
import { rnd, shuffle } from "@/lib/random";
import { VOCAB, VOCAB_ORDER } from "@/data/vocab";
import type { Provider, ProviderContext } from "@/lib/types";

export type EngWord = { en: string; he: string; emoji: string };

export type EngQuestion = {
  op: "eng";
  word: EngWord;
  options: EngWord[];
  answer: string;
};

export const engProvider: Provider = {
  generate(ctx: ProviderContext): EngQuestion {
    const maxLen = diffParams<{ maxLen: number }>("eng", ctx.level, ctx.step).maxLen || 99;
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
      if (d.emoji === word.emoji || distractors.includes(d)) continue;
      distractors.push(d);
    }
    const options = shuffle([word, ...distractors]);
    return { op: "eng", word, options, answer: word.emoji };
  },
  key(q) {
    return `eng:${(q as EngQuestion).word.en}`;
  },
};
