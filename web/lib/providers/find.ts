import { diffParams } from "@/lib/difficulty";
import {
  FIND_CATS,
  FIND_LETTERS,
  FIND_PACKS,
  FIND_PHON,
  FIND_REASON,
  LETTER_CONFUSE,
  letterByGlyph,
  findCatLabel,
} from "@/data/find";
import { rnd, shuffle, pickDistinct, pickDistinctBy } from "@/lib/random";
import type { Provider, ProviderContext } from "@/lib/types";

type FindParams = {
  maxNum?: number;
  kinds?: string[];
  confuse?: boolean;
  qLo?: number;
  qHi?: number;
  qClose?: boolean;
};

export type FindQuestion = Record<string, unknown> & {
  op: "find";
  kind: string;
  answer: unknown;
};

function findGenNum(ctx: ProviderContext, p: FindParams): FindQuestion {
  const maxNum = p.maxNum || 5;
  const pool: number[] = [];
  for (let n = 1; n <= maxNum; n++) {
    if (!ctx.usedKeys.includes(`find:num:${n}`)) pool.push(n);
  }
  if (!pool.length) for (let m = 1; m <= maxNum; m++) pool.push(m);
  return { op: "find", kind: "num", answer: pool[rnd(pool.length)], maxNum };
}

function findGenCat(ctx: ProviderContext, _p: FindParams): FindQuestion {
  const cat = FIND_CATS[rnd(FIND_CATS.length)];
  const pack = FIND_PACKS[cat];
  let avail = pack.filter((it) => !ctx.usedKeys.includes(`find:cat:${it.emoji}`));
  if (!avail.length) avail = [...pack];
  const item = avail[rnd(avail.length)];
  const distractors = pickDistinctBy([...pack], 2, [item.emoji], (it) => it.emoji);
  return {
    op: "find",
    kind: "cat",
    cat,
    item,
    options: shuffle([item, ...distractors]),
    answer: item.emoji,
  };
}

function findGenLetter(ctx: ProviderContext, p: FindParams): FindQuestion {
  let avail = FIND_LETTERS.filter((x) => !ctx.usedKeys.includes(`find:let:${x.l}`));
  if (!avail.length) avail = [...FIND_LETTERS];
  const target = avail[rnd(avail.length)];
  let distractors: typeof FIND_LETTERS[number][] = [];
  if (p.confuse) {
    const sims: string[] = [];
    LETTER_CONFUSE.forEach((cl) => {
      if (cl.includes(target.l as never)) {
        cl.forEach((g) => {
          if (g !== target.l && !sims.includes(g)) sims.push(g);
        });
      }
    });
    distractors = shuffle(sims).map(letterByGlyph).filter(Boolean) as typeof distractors;
    distractors = distractors.slice(0, 2);
  }
  if (distractors.length < 2) {
    const taken = [target.l, ...distractors.map((d) => d.l)];
    distractors = distractors.concat(
      pickDistinctBy([...FIND_LETTERS], 2 - distractors.length, taken, (x) => x.l)
    );
  }
  return {
    op: "find",
    kind: "letter",
    item: target,
    options: shuffle([target, ...distractors]),
    answer: target.l,
  };
}

function findGenReason(ctx: ProviderContext, _p: FindParams): FindQuestion {
  const idx = rnd(FIND_REASON.length);
  const cat = FIND_REASON[idx];
  const ans = cat.yes[rnd(cat.yes.length)];
  const distractors = pickDistinct([...cat.no], 2, [ans]);
  return {
    op: "find",
    kind: "reason",
    idx,
    prompt: cat.q,
    options: shuffle([ans, ...distractors]),
    answer: ans,
  };
}

function findGenMore(ctx: ProviderContext, p: FindParams): FindQuestion {
  const em = ctx.countEmoji;
  const lo = p.qLo || 1;
  const hi = p.qHi || 5;
  let counts: number[];
  if (p.qClose) {
    const span = Math.max(1, hi - 2 - lo + 1);
    const start = lo + rnd(span);
    counts = [start, start + 1, start + 2];
  } else {
    const range: number[] = [];
    for (let n = lo; n <= hi; n++) range.push(n);
    counts = shuffle(range).slice(0, 3);
    while (counts.length < 3) counts.push((counts[counts.length - 1] || lo) + 1);
  }
  const answer = Math.max(...counts);
  const options = shuffle(counts.map((count) => ({ count, em })));
  return { op: "find", kind: "more", em, options, answer };
}

function findGenPhon(ctx: ProviderContext, _p: FindParams): FindQuestion {
  let avail = FIND_PHON.filter((w) => !ctx.usedKeys.includes(`find:phon:${w.emoji}`));
  if (!avail.length) avail = [...FIND_PHON];
  const target = avail[rnd(avail.length)];
  const others = FIND_PHON.filter((w) => w.l !== target.l && w.emoji !== target.emoji);
  return {
    op: "find",
    kind: "phon",
    item: target,
    options: shuffle([target, ...shuffle([...others]).slice(0, 2)]),
    answer: target.emoji,
  };
}

function findGenBigNum(ctx: ProviderContext, p: FindParams): FindQuestion {
  const hi = p.maxNum || 9;
  const lo = 1;
  let a = lo + rnd(hi - lo + 1);
  let b: number | undefined;
  if (p.qClose) {
    const d = 1 + rnd(2);
    b = a + (rnd(2) ? d : -d);
    if (b < lo) b = a + d;
    if (b > hi) b = a - d;
  }
  if (b === undefined || b === a || b < lo || b > hi) {
    do {
      b = lo + rnd(hi - lo + 1);
    } while (b === a);
  }
  return { op: "find", kind: "bignum", options: shuffle([a, b]), answer: Math.max(a, b) };
}

export const findProvider: Provider = {
  generate(ctx: ProviderContext): FindQuestion {
    const p = diffParams<FindParams>(ctx.curriculum, ctx.level, ctx.step);
    const kinds = p.kinds || ["letter", "reason", "more"];
    switch (kinds[rnd(kinds.length)]) {
      case "num":
        return findGenNum(ctx, p);
      case "cat":
        return findGenCat(ctx, p);
      case "letter":
        return findGenLetter(ctx, p);
      case "more":
        return findGenMore(ctx, p);
      case "bignum":
        return findGenBigNum(ctx, p);
      case "phon":
        return findGenPhon(ctx, p);
      default:
        return findGenReason(ctx, p);
    }
  },
  key(q) {
    const qq = q as FindQuestion;
    switch (qq.kind) {
      case "num":
        return `find:num:${qq.answer}`;
      case "cat":
        return `find:cat:${qq.answer}`;
      case "letter":
        return `find:let:${qq.answer}`;
      case "phon":
        return `find:phon:${qq.answer}`;
      case "reason":
        return `find:reason:${qq.idx}:${qq.answer}`;
      case "more":
        return `find:more:${(qq.options as { count: number }[])
          .map((o) => o.count)
          .sort((a, b) => a - b)
          .join("-")}`;
      case "bignum":
        return `find:bignum:${(qq.options as number[]).slice().sort((a, b) => a - b).join("-")}`;
      default:
        return "find:?";
    }
  },
};

export { findCatLabel, LETTER_NAME } from "@/data/find";
