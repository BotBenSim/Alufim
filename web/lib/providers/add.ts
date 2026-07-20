import { diffParams } from "@/lib/difficulty";
import { blockForStep } from "@/lib/xp";
import { rnd, numberOptions } from "@/lib/random";
import type { Provider, ProviderContext } from "@/lib/types";

export type AddQuestion = {
  op: "add";
  a: number;
  b: number;
  answer: number;
};

export const addProvider: Provider = {
  generate(ctx: ProviderContext): AddQuestion {
    const p = diffParams<{ minSum: number; maxSum: number }>("add", ctx.level, ctx.step);
    const maxSum = p.maxSum || 10;
    const minSum = Math.min(p.minSum || 2, maxSum);
    let a = 1,
      b = 1,
      key = "",
      tries = 0;
    do {
      const sum = minSum + rnd(maxSum - minSum + 1);
      a = 1 + rnd(sum - 1);
      b = sum - a;
      if (a < b) [a, b] = [b, a];
      key = `add:${a}+${b}`;
      tries++;
    } while (ctx.usedKeys.includes(key) && tries < 40);
    return { op: "add", a, b, answer: a + b };
  },
  key(q) {
    const qq = q as AddQuestion;
    return `add:${Math.max(qq.a, qq.b)}+${Math.min(qq.a, qq.b)}`;
  },
};

export function addRenderMeta(q: AddQuestion, step: number, countEmoji: string) {
  const countOn = blockForStep(step) >= 2;
  return {
    countOn,
    countEmoji,
    options: numberOptions(q.answer, Math.max(10, q.answer + 4)),
    digits: `${q.a} + ${q.b} = ?`,
  };
}

export function addSpeakPrompt(q: AddQuestion, hebNum: readonly string[]): string {
  return `כמה זה ${hebNum[q.a] || q.a} ועוד ${hebNum[q.b] || q.b}?`;
}
