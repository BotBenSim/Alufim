import { diffParams, normalizeMathVisual } from "@/lib/difficulty";
import { numberOptions, rnd, shuffle } from "@/lib/random";
import type {
  DifficultyLevel,
  GameCurriculum,
  MathVisual,
  Provider,
  ProviderContext,
} from "@/lib/types";
import { t } from "@/lib/i18n";

export type MulQuestion = {
  op: "mul";
  /** Number of groups. */
  a: number;
  /** How many in each group. */
  b: number;
  answer: number;
};

/**
 * Wrong answers a child actually reaches for: the neighbouring products, not
 * answer ± 1. Mixing up 6×4 with 6×5 is the real error; 25 is not.
 */
export function productOptions(a: number, b: number): number[] {
  const answer = a * b;
  const near = [(a - 1) * b, (a + 1) * b, a * (b - 1), a * (b + 1)];
  const opts = [answer];
  for (const v of shuffle(near)) {
    if (opts.length >= 3) break;
    if (v >= 1 && !opts.includes(v)) opts.push(v);
  }
  if (opts.length < 3) {
    for (const v of numberOptions(answer, Math.max(10, answer + 4))) {
      if (opts.length >= 3) break;
      if (!opts.includes(v)) opts.push(v);
    }
  }
  return shuffle(opts);
}

export const mulProvider: Provider = {
  generate(ctx: ProviderContext): MulQuestion {
    const p = diffParams<{ minFactor: number; maxFactor: number }>(
      ctx.curriculum,
      ctx.level,
      ctx.step
    );
    const maxFactor = p.maxFactor || 5;
    const minFactor = Math.min(p.minFactor || 1, maxFactor);
    const span = maxFactor - minFactor + 1;
    let a = 1,
      b = 1,
      key = "",
      tries = 0;
    do {
      a = minFactor + rnd(span);
      b = minFactor + rnd(span);
      // Fewer, fuller groups draw better than many groups of one.
      if (a < b) [a, b] = [b, a];
      key = `mul:${a}x${b}`;
      tries++;
    } while (ctx.usedKeys.includes(key) && tries < 40);
    return { op: "mul", a, b, answer: a * b };
  },
  key(q) {
    const qq = q as MulQuestion;
    return `mul:${Math.max(qq.a, qq.b)}x${Math.min(qq.a, qq.b)}`;
  },
};

export function mulRenderMeta(
  q: MulQuestion,
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
    options: productOptions(q.a, q.b),
    digits: `${q.a} × ${q.b} = ?`,
  };
}

export function mulSpeakPrompt(q: MulQuestion, hebNum: readonly string[]): string {
  const groups = hebNum[q.a] || q.a;
  const each = hebNum[q.b] || q.b;
  return t("math.mulAsk", { groups, each });
}
