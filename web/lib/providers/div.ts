import { diffParams, normalizeMathVisual } from "@/lib/difficulty";
import { numberOptions, rnd } from "@/lib/random";
import type {
  DifficultyLevel,
  GameCurriculum,
  MathVisual,
  Provider,
  ProviderContext,
} from "@/lib/types";

export type DivQuestion = {
  op: "div";
  /** Total to share out. Always divisor × answer, so it divides exactly. */
  a: number;
  /** Number of shares. */
  b: number;
  answer: number;
};

export const divProvider: Provider = {
  generate(ctx: ProviderContext): DivQuestion {
    const p = diffParams<{ maxDivisor: number; maxQuotient: number }>(
      ctx.curriculum,
      ctx.level,
      ctx.step
    );
    // Sharing between one is not sharing, so the divisor starts at 2.
    const maxDivisor = Math.max(2, p.maxDivisor || 3);
    const maxQuotient = Math.max(1, p.maxQuotient || 5);
    let b = 2,
      answer = 1,
      key = "",
      tries = 0;
    do {
      b = 2 + rnd(maxDivisor - 1);
      answer = 1 + rnd(maxQuotient);
      key = `div:${b * answer}/${b}`;
      tries++;
    } while (ctx.usedKeys.includes(key) && tries < 40);
    return { op: "div", a: b * answer, b, answer };
  },
  key(q) {
    const qq = q as DivQuestion;
    return `div:${qq.a}/${qq.b}`;
  },
};

export function divRenderMeta(
  q: DivQuestion,
  step: number,
  countEmoji: string,
  curriculum: GameCurriculum,
  level: DifficultyLevel
) {
  const p = diffParams<{ visual?: MathVisual }>(curriculum, level, step);
  const visual = normalizeMathVisual(p.visual);
  return {
    visual,
    countEmoji,
    options: numberOptions(q.answer, Math.max(10, q.a)),
    digits: `${q.a} ÷ ${q.b} = ?`,
  };
}

export function divSpeakPrompt(q: DivQuestion, hebNum: readonly string[]): string {
  const total = hebNum[q.a] || q.a;
  const shares = hebNum[q.b] || q.b;
  return `מחלקים ${total} שווה בשווה ל־${shares} חברים. כמה מקבל כל אחד?`;
}
