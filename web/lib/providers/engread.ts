import { diffParams } from "@/lib/difficulty";
import { ENG_CONFUSE, ENGREAD_BANDS, PHONICS_ORDER } from "@/data/engread";
import { rnd, shuffle } from "@/lib/random";
import type { ProviderContext, Question } from "@/lib/types";
import type { StageProvider, StageRender, StageSpeak } from "./stage";

export type EngReadQuestion = Question & {
  op: "engread";
  stage: number;
  letter: string;
  answer: string;
};

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

/**
 * Stage 2 only so far — hear a letter sound, pick the letter. Distractors avoid
 * the confusable families in ENG_CONFUSE. Stages 1, 3, 4 and 5 are still to come;
 * see knowledge/educational/track-skill-ladders.md.
 */
function genSoundToLetter(ctx: ProviderContext): EngReadQuestion {
  const letters = [...PHONICS_ORDER];
  let pool = letters.filter((l) => !ctx.usedKeys.includes(`engread:2:${l}`));
  if (!pool.length) pool = letters;
  const target = pool[rnd(pool.length)];
  const banned = [target, ...confusablesOf(target)];
  const distractors = shuffle(letters.filter((l) => !banned.includes(l))).slice(0, 2);
  return {
    op: "engread",
    stage: 2,
    letter: target,
    options: shuffle([target, ...distractors]),
    answer: target,
  };
}

export const engreadProvider: StageProvider = {
  bands: ENGREAD_BANDS,

  generate(ctx: ProviderContext): EngReadQuestion {
    const p = diffParams<{ stage?: number }>(ctx.curriculum, ctx.level, ctx.step);
    switch (p.stage ?? 2) {
      default:
        return genSoundToLetter(ctx);
    }
  },

  key(q) {
    const qq = q as EngReadQuestion;
    return `engread:${qq.stage}:${qq.answer}`;
  },

  render(q: Question): StageRender {
    const qq = q as EngReadQuestion;
    return {
      prompt: "איזו אות שמעתם?",
      hint: "👆",
      options: qq.options as string[],
      variant: "answerFind",
    };
  },

  speak(q: Question): StageSpeak {
    const qq = q as EngReadQuestion;
    return { en: qq.letter };
  },
};
