import { diffParams } from "@/lib/difficulty";
import { FIND_PHON, LETTER_NAME } from "@/data/find";
import { HEBREAD_BANDS } from "@/data/hebread";
import { rnd, shuffle } from "@/lib/random";
import type { ProviderContext, Question } from "@/lib/types";
import type { StageProvider, StageRender, StageSpeak } from "./stage";

export type HebReadQuestion = Question & {
  op: "hebread";
  stage: number;
  letter: string;
  answer: string;
};

/**
 * Stage 1 only so far — hear a word, pick the picture that starts with the same
 * sound. Stages 2–5 (sound→letter, letter→sound, letter+nikud, whole word) are
 * the rest of the ladder in knowledge/educational/hebrew-reading-sequence.md.
 */
function genSameFirstSound(ctx: ProviderContext): HebReadQuestion {
  let pool = FIND_PHON.filter((w) => !ctx.usedKeys.includes(`hebread:1:${w.emoji}`));
  if (!pool.length) pool = [...FIND_PHON];
  const target = pool[rnd(pool.length)];
  const others = shuffle(FIND_PHON.filter((w) => w.l !== target.l)).slice(0, 2);
  return {
    op: "hebread",
    stage: 1,
    letter: target.l,
    word: target.he,
    options: shuffle([target, ...others]).map((w) => w.emoji),
    answer: target.emoji,
  };
}

export const hebreadProvider: StageProvider = {
  bands: HEBREAD_BANDS,

  generate(ctx: ProviderContext): HebReadQuestion {
    const p = diffParams<{ stage?: number }>(ctx.curriculum, ctx.level, ctx.step);
    switch (p.stage ?? 1) {
      default:
        return genSameFirstSound(ctx);
    }
  },

  key(q) {
    const qq = q as HebReadQuestion;
    return `hebread:${qq.stage}:${qq.answer}`;
  },

  render(q: Question): StageRender {
    const qq = q as HebReadQuestion;
    return {
      prompt: `מה מתחיל כמו ${qq.word}?`,
      hint: "איזה מתחיל באותו צליל?",
      options: qq.options as string[],
      variant: "answerEng",
    };
  },

  speak(q: Question): StageSpeak {
    const qq = q as HebReadQuestion;
    const name = LETTER_NAME[qq.letter] || qq.letter;
    return { he: `${qq.word}. מה מתחיל באות ${name}?` };
  },
};
