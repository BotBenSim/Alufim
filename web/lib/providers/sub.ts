import { diffParams } from "@/lib/difficulty";
import { rnd, numberOptions } from "@/lib/random";
import type { Provider, ProviderContext } from "@/lib/types";

export type SubQuestion = {
  op: "sub";
  a: number;
  b: number;
  answer: number;
};

export const subProvider: Provider = {
  generate(ctx: ProviderContext): SubQuestion {
    const p = diffParams<{ minTop: number; maxMin: number }>("sub", ctx.level, ctx.step);
    const maxMin = p.maxMin || 10;
    const minTop = Math.min(p.minTop || 2, maxMin);
    let a = 2,
      b = 1,
      key = "",
      tries = 0;
    do {
      a = minTop + rnd(maxMin - minTop + 1);
      b = 1 + rnd(a - 1);
      key = `sub:${a}-${b}`;
      tries++;
    } while (ctx.usedKeys.includes(key) && tries < 40);
    return { op: "sub", a, b, answer: a - b };
  },
  key(q) {
    const qq = q as SubQuestion;
    return `sub:${qq.a}-${qq.b}`;
  },
};

export function subRenderMeta(q: SubQuestion) {
  return {
    countEmoji: "⭐",
    options: numberOptions(q.answer, Math.max(10, q.a)),
    digits: `${q.a} − ${q.b} = ?`,
  };
}

export function subSpeakPrompt(q: SubQuestion, hebNum: readonly string[]): string {
  return `כמה זה ${hebNum[q.a] || q.a} פחות ${hebNum[q.b] || q.b}?`;
}
