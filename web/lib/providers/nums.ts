import { diffParams } from "@/lib/difficulty";
import {
  hebNumber,
  LANDMARKS,
  MAX_DRAWN,
  NUMS_BANDS,
  TEN_GLYPH,
} from "@/data/nums";
import { repeatStr, rnd, shuffle } from "@/lib/random";
import type { ProviderContext, Question } from "@/lib/types";
import type { StageProvider, StageRender, StageSpeak } from "./stage";

export type NumsQuestion = Question & {
  op: "nums";
  stage: number;
  /** The number the question is about; drives the spoken prompt. */
  n: number;
  /** What the child is choosing, or that they are picking the largest of three. */
  dir?: "toNumeral" | "toQuantity" | "compare";
  answer: string;
};

/** Draw `n` as bundles of ten plus loose ones, so 34 reads as 3 tens and 4. */
export function drawAmount(n: number, emoji: string): string {
  if (n <= MAX_DRAWN) return repeatStr(emoji, n);
  return repeatStr(TEN_GLYPH, Math.floor(n / 10)) + repeatStr(emoji, n % 10);
}

/**
 * Neighbours make the child count rather than eyeball, but a distractor must
 * never be the answer and never fall outside the band.
 */
function nearNumbers(n: number, maxNum: number, howMany: number): number[] {
  const pool: number[] = [];
  for (const d of [1, 2, 3, 5, 10]) {
    for (const v of [n - d, n + d]) {
      if (v >= 1 && v <= maxNum && v !== n && !pool.includes(v)) pool.push(v);
    }
  }
  const picked = shuffle(pool).slice(0, howMany);
  // Tiny bands (maxNum 2) can run dry; pad with anything else in range.
  for (let v = 1; picked.length < howMany && v <= maxNum; v++) {
    if (v !== n && !picked.includes(v)) picked.push(v);
  }
  return picked;
}

/**
 * Exactly three distinct numbers: the answer plus two distractors, preferring
 * the teaching ones (a swapped-digit twin, the round ten) and topping up from
 * the neighbours when those collide or repeat.
 */
function threeOptions(n: number, preferred: number[], maxNum: number): number[] {
  const out: number[] = [n];
  const add = (v: number) => {
    if (v >= 1 && !out.includes(v) && out.length < 3) out.push(v);
  };
  preferred.forEach(add);
  nearNumbers(n, maxNum, 4).forEach(add);
  for (let v = 1; out.length < 3; v++) {
    if (v > maxNum + 3) break;
    add(v);
  }
  return shuffle(out);
}

function pickTarget(ctx: ProviderContext, stage: number, maxNum: number, cap: number): number {
  const hi = Math.max(1, Math.min(maxNum, cap));
  const fresh: number[] = [];
  for (let n = 1; n <= hi; n++) {
    if (!ctx.usedKeys.includes(`nums:${stage}:${n}`)) fresh.push(n);
  }
  const pool = fresh.length ? fresh : Array.from({ length: hi }, (_, i) => i + 1);
  return pool[rnd(pool.length)];
}

/**
 * Stage 1 — the most direct question in the game: hear the number, press the
 * numeral. Three digits and nothing else, so the only thing being tested is
 * whether the child knows the shape.
 */
function genRecogniseNumeral(ctx: ProviderContext, maxNum: number): NumsQuestion {
  const n = pickTarget(ctx, 1, maxNum, maxNum);
  return {
    op: "nums",
    stage: 1,
    n,
    dir: "toNumeral",
    options: threeOptions(n, [], maxNum).map(String),
    answer: String(n),
  };
}

/** Stage 2 — the one that answers "I don't know what 5 looks like". */
function genQuantityToNumeral(ctx: ProviderContext, maxNum: number): NumsQuestion {
  const em = ctx.countEmoji || "🍎";
  const n = pickTarget(ctx, 2, maxNum, MAX_DRAWN);
  return {
    op: "nums",
    stage: 2,
    n,
    dir: "toNumeral",
    prompt: drawAmount(n, em),
    options: threeOptions(n, [], maxNum).map(String),
    answer: String(n),
  };
}

/** Stage 3 — the reverse trip: the numeral is shown, the amount is chosen. */
function genNumeralToQuantity(ctx: ProviderContext, maxNum: number): NumsQuestion {
  const em = ctx.countEmoji || "🍎";
  const n = pickTarget(ctx, 3, maxNum, MAX_DRAWN);
  return {
    op: "nums",
    stage: 3,
    n,
    dir: "toQuantity",
    options: threeOptions(n, [], Math.min(maxNum, MAX_DRAWN)).map((v) => drawAmount(v, em)),
    answer: drawAmount(n, em),
  };
}

/**
 * Stage 4 — which is bigger. Three options; the answer is the largest. Small
 * bands get piles of emoji (count to decide); larger bands get numerals, so the
 * child has to read magnitude rather than count.
 */
function genCompare(ctx: ProviderContext, maxNum: number): NumsQuestion {
  const em = ctx.countEmoji || "🍎";
  const asQuantity = maxNum <= MAX_DRAWN && rnd(2) === 0;
  const hi = Math.max(3, asQuantity ? Math.min(maxNum, MAX_DRAWN) : maxNum);
  const anchor = pickTarget(ctx, 4, hi, hi);
  const nums = threeOptions(anchor, [], hi);
  const answer = Math.max(...nums);
  return {
    op: "nums",
    stage: 4,
    n: answer,
    dir: "compare",
    options: asQuantity
      ? nums.map((v) => drawAmount(v, em))
      : nums.map(String),
    answer: asQuantity ? drawAmount(answer, em) : String(answer),
  };
}

/**
 * Stage 5 — tens and hundreds. Half the questions are the landmarks themselves
 * (is 100 the one with two zeros?), since telling 10 from 100 from 1000 is a
 * different skill from counting.
 */
function genTensAndHundreds(ctx: ProviderContext, maxNum: number): NumsQuestion {
  const em = ctx.countEmoji || "🍎";
  if (maxNum >= 100 && rnd(2) === 0) {
    // A landmark is told apart by its shape, so the rivals are the other
    // powers of ten — 99 would teach nothing here.
    const n = LANDMARKS[rnd(LANDMARKS.length)];
    const others = n === 100 ? [10, 1000] : [1, 100];
    return {
      op: "nums",
      stage: 5,
      n,
      dir: "toNumeral",
      options: shuffle([n, ...others]).map(String),
      answer: String(n),
    };
  }
  // Two-digit: show the tens-and-ones picture, pick the numeral. The swapped
  // twin (34 vs 43) is the distractor that makes place value the deciding factor.
  const hi = Math.max(11, Math.min(maxNum, 99));
  const n = 11 + rnd(hi - 10);
  const swapped = (n % 10) * 10 + Math.floor(n / 10);
  return {
    op: "nums",
    stage: 5,
    n,
    dir: "toNumeral",
    prompt: drawAmount(n, em),
    options: threeOptions(n, [swapped, Math.floor(n / 10) * 10], maxNum).map(String),
    answer: String(n),
  };
}

export const numsProvider: StageProvider = {
  bands: NUMS_BANDS,

  generate(ctx: ProviderContext): NumsQuestion {
    const p = diffParams<{ stage?: number; maxNum?: number }>(
      ctx.curriculum,
      ctx.level,
      ctx.step
    );
    const maxNum = Math.max(2, p.maxNum || 5);
    switch (p.stage ?? 1) {
      case 2:
        return genQuantityToNumeral(ctx, maxNum);
      case 3:
        return genNumeralToQuantity(ctx, maxNum);
      case 4:
        return genCompare(ctx, maxNum);
      case 5:
        return genTensAndHundreds(ctx, maxNum);
      default:
        return genRecogniseNumeral(ctx, maxNum);
    }
  },

  key(q) {
    const qq = q as NumsQuestion;
    return `nums:${qq.stage}:${qq.n}`;
  },

  render(q: Question): StageRender {
    const qq = q as NumsQuestion;
    if (qq.stage === 1) {
      // The number is only spoken; printing it would make the choice a match.
      return {
        prompt: "👂",
        hint: "איזה מספר שמעתם?",
        options: qq.options as string[],
        variant: "answerFind",
      };
    }
    if (qq.dir === "compare") {
      const asQuantity = !/^\d+$/.test(qq.answer);
      return {
        prompt: asQuantity ? "איזו קבוצה גדולה יותר?" : "איזה מספר גדול יותר?",
        hint: "👆",
        options: qq.options as string[],
        variant: asQuantity ? "answerGroup" : "answerFind",
      };
    }
    const toNumeral = qq.dir !== "toQuantity";
    return {
      prompt: (qq.prompt as string) || String(qq.n),
      hint: qq.stage === 2 || qq.stage === 5 ? "כמה יש?" : "👆",
      options: qq.options as string[],
      variant: toNumeral ? "answerFind" : "answerGroup",
    };
  },

  speak(q: Question): StageSpeak {
    const qq = q as NumsQuestion;
    if (qq.dir === "compare") {
      return {
        he: /^\d+$/.test(qq.answer)
          ? "איזה מספר גדול יותר?"
          : "איזו קבוצה גדולה יותר?",
      };
    }
    if (qq.dir === "toQuantity") return { he: `מצאו ${hebNumber(qq.n)}` };
    // Counting stages must not read the answer out loud.
    if (qq.stage === 2 || (qq.stage === 5 && qq.prompt)) return { he: "כמה יש?" };
    return { he: `לחצו על ${hebNumber(qq.n)}` };
  },
};
