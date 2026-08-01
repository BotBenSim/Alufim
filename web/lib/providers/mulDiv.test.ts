import { describe, expect, it } from "vitest";
import { defaultCurriculum, diffParams } from "@/lib/difficulty";
import { divProvider, divRenderMeta, type DivQuestion } from "./div";
import { mulProvider, mulRenderMeta, productOptions, type MulQuestion } from "./mul";
import type { DifficultyLevel, GameCurriculum, ProviderContext } from "@/lib/types";

function ctx(over: Partial<ProviderContext> & { curriculum: GameCurriculum }): ProviderContext {
  return {
    level: "easy",
    step: 1,
    usedKeys: [],
    ...over,
  } as ProviderContext;
}

const LEVELS: DifficultyLevel[] = ["easy", "medium", "hard"];

describe("mulProvider", () => {
  it("keeps factors inside the band and answers correctly", () => {
    const curriculum = defaultCurriculum("mul");
    for (const level of LEVELS) {
      for (let step = 1; step <= 12; step++) {
        const p = diffParams<{ minFactor: number; maxFactor: number }>(
          curriculum,
          level,
          step
        );
        for (let i = 0; i < 40; i++) {
          const q = mulProvider.generate(ctx({ curriculum, level, step })) as MulQuestion;
          expect(q.a).toBeGreaterThanOrEqual(p.minFactor);
          expect(q.a).toBeLessThanOrEqual(p.maxFactor);
          expect(q.b).toBeGreaterThanOrEqual(p.minFactor);
          expect(q.b).toBeLessThanOrEqual(p.maxFactor);
          expect(q.answer).toBe(q.a * q.b);
        }
      }
    }
  });

  it("puts the larger factor first so there are few, full groups", () => {
    const curriculum = defaultCurriculum("mul");
    for (let i = 0; i < 100; i++) {
      const q = mulProvider.generate(ctx({ curriculum, level: "hard", step: 9 })) as MulQuestion;
      expect(q.a).toBeGreaterThanOrEqual(q.b);
    }
  });

  it("treats a×b and b×a as the same question for no-repeat", () => {
    expect(mulProvider.key({ op: "mul", a: 3, b: 4, answer: 12 } as unknown as MulQuestion)).toBe(
      mulProvider.key({ op: "mul", a: 4, b: 3, answer: 12 } as unknown as MulQuestion)
    );
  });

  it("avoids a key already used in the run", () => {
    const curriculum = defaultCurriculum("mul");
    // One blocked pair out of six: 40 retries make a collision astronomically
    // unlikely. Blocking almost the whole pool would make this test flaky
    // instead, since the generator gives up after 40 tries by design.
    const used = ["mul:3x3"];
    for (let i = 0; i < 60; i++) {
      const q = mulProvider.generate(ctx({ curriculum, usedKeys: used })) as MulQuestion;
      expect(mulProvider.key(q)).not.toBe("mul:3x3");
    }
  });

  it("offers near-miss products, not answer ± 1", () => {
    const opts = productOptions(6, 4);
    expect(opts).toContain(24);
    expect(opts.length).toBe(3);
    expect(new Set(opts).size).toBe(3);
    for (const o of opts) {
      if (o === 24) continue;
      expect([18, 30, 20, 28]).toContain(o);
    }
  });

  it("never offers a zero or negative option", () => {
    for (let a = 1; a <= 12; a++) {
      for (let b = 1; b <= 12; b++) {
        for (const o of productOptions(a, b)) expect(o).toBeGreaterThan(0);
      }
    }
  });

  it("renders the answer among the choices", () => {
    const curriculum = defaultCurriculum("mul");
    for (let i = 0; i < 60; i++) {
      const q = mulProvider.generate(ctx({ curriculum })) as MulQuestion;
      const meta = mulRenderMeta(q, 1, "🍎", curriculum, "easy");
      expect(meta.options).toContain(q.answer);
      expect(meta.digits).toBe(`${q.a} × ${q.b} = ?`);
    }
  });
});

describe("divProvider", () => {
  it("always divides exactly, with no remainder", () => {
    const curriculum = defaultCurriculum("div");
    for (const level of LEVELS) {
      for (let step = 1; step <= 12; step++) {
        for (let i = 0; i < 40; i++) {
          const q = divProvider.generate(ctx({ curriculum, level, step })) as DivQuestion;
          expect(q.a % q.b).toBe(0);
          expect(q.answer).toBe(q.a / q.b);
          expect(Number.isInteger(q.answer)).toBe(true);
        }
      }
    }
  });

  it("never shares between fewer than two, and stays inside the band", () => {
    const curriculum = defaultCurriculum("div");
    for (const level of LEVELS) {
      for (let step = 1; step <= 12; step++) {
        const p = diffParams<{ maxDivisor: number; maxQuotient: number }>(
          curriculum,
          level,
          step
        );
        for (let i = 0; i < 40; i++) {
          const q = divProvider.generate(ctx({ curriculum, level, step })) as DivQuestion;
          expect(q.b).toBeGreaterThanOrEqual(2);
          expect(q.b).toBeLessThanOrEqual(p.maxDivisor);
          expect(q.answer).toBeGreaterThanOrEqual(1);
          expect(q.answer).toBeLessThanOrEqual(p.maxQuotient);
        }
      }
    }
  });

  it("renders the answer among the choices", () => {
    const curriculum = defaultCurriculum("div");
    for (let i = 0; i < 60; i++) {
      const q = divProvider.generate(ctx({ curriculum })) as DivQuestion;
      const meta = divRenderMeta(q, 1, "🍎", curriculum, "easy");
      expect(meta.options).toContain(q.answer);
      expect(meta.digits).toBe(`${q.a} ÷ ${q.b} = ?`);
    }
  });
});

describe("math visuals", () => {
  it("start as counting and end as digits on every level", () => {
    for (const gid of ["mul", "div"] as const) {
      const cur = defaultCurriculum(gid);
      for (const level of LEVELS) {
        const bands = cur.bands[level];
        expect(bands[0].visual).toBeDefined();
        expect(bands[bands.length - 1].visual).toBeDefined();
      }
      expect(cur.bands.easy[0].visual).toBe("fullCount");
      expect(cur.bands.hard[cur.bands.hard.length - 1].visual).toBe("numbers");
    }
  });
});
