import { describe, expect, it } from "vitest";
import { defaultCurriculum } from "@/lib/difficulty";
import { hebNumber, MAX_DRAWN, TEN_GLYPH } from "@/data/nums";
import { drawAmount, numsProvider, type NumsQuestion } from "./nums";
import type { DifficultyLevel, GameCurriculum, ProviderContext } from "@/lib/types";

function ctx(over: Partial<ProviderContext> = {}): ProviderContext {
  return {
    curriculum: defaultCurriculum("nums"),
    level: "easy",
    step: 1,
    usedKeys: [],
    countEmoji: "🍎",
    ...over,
  } as ProviderContext;
}

/** Force one stage regardless of the default band layout. */
function atStage(stage: number, maxNum: number): GameCurriculum {
  const cur = defaultCurriculum("nums");
  for (const level of ["easy", "medium", "hard"] as DifficultyLevel[]) {
    cur.bands[level] = [{ stage, maxNum }];
  }
  return cur;
}

const STAGES = [1, 2, 3, 4, 5];

describe("numsProvider", () => {
  it("always puts the answer among the options", () => {
    for (const stage of STAGES) {
      for (const maxNum of [5, 10, 20, 100]) {
        const curriculum = atStage(stage, maxNum);
        for (let i = 0; i < 60; i++) {
          const q = numsProvider.generate(ctx({ curriculum })) as NumsQuestion;
          expect(q.options as string[]).toContain(q.answer);
        }
      }
    }
  });

  it("offers three distinct choices at every stage", () => {
    for (const stage of STAGES) {
      for (const maxNum of [5, 10, 20, 100]) {
        const curriculum = atStage(stage, maxNum);
        for (let i = 0; i < 60; i++) {
          const q = numsProvider.generate(ctx({ curriculum })) as NumsQuestion;
          const opts = q.options as string[];
          expect(opts.length).toBe(3);
          expect(new Set(opts).size).toBe(3);
        }
      }
    }
  });

  it("stays inside the band", () => {
    for (const stage of [2, 3, 4]) {
      for (const maxNum of [5, 10, 20]) {
        const curriculum = atStage(stage, maxNum);
        for (let i = 0; i < 60; i++) {
          const q = numsProvider.generate(ctx({ curriculum })) as NumsQuestion;
          expect(q.n).toBeGreaterThanOrEqual(1);
          expect(q.n).toBeLessThanOrEqual(maxNum);
        }
      }
    }
  });

  it("shows no numeral at all in stage 1", () => {
    const curriculum = atStage(1, 5);
    for (let i = 0; i < 60; i++) {
      const q = numsProvider.generate(ctx({ curriculum })) as NumsQuestion;
      const shown = [numsProvider.render(q).prompt, ...(q.options as string[])].join("");
      expect(shown).not.toMatch(/[0-9]/);
    }
  });

  it("never draws more than ten loose items in one option", () => {
    for (const stage of [1, 3]) {
      const curriculum = atStage(stage, 100);
      for (let i = 0; i < 60; i++) {
        const q = numsProvider.generate(ctx({ curriculum })) as NumsQuestion;
        for (const o of q.options as string[]) {
          expect([...o].filter((c) => c === "🍎").length).toBeLessThanOrEqual(MAX_DRAWN);
        }
      }
    }
  });

  it("does not say the answer out loud while the child is counting", () => {
    for (const stage of [2, 5]) {
      const curriculum = atStage(stage, stage === 5 ? 99 : 10);
      for (let i = 0; i < 60; i++) {
        const q = numsProvider.generate(ctx({ curriculum })) as NumsQuestion;
        if (!q.prompt) continue;
        const said = numsProvider.speak(q).he || "";
        expect(said).not.toContain(hebNumber(q.n));
        expect(said).not.toContain(String(q.n));
      }
    }
  });

  it("asks for the successor in the order questions", () => {
    const curriculum = atStage(4, 20);
    let seen = 0;
    for (let i = 0; i < 200; i++) {
      const q = numsProvider.generate(ctx({ curriculum })) as NumsQuestion;
      if (q.dir !== "next") continue;
      seen++;
      expect(q.answer).toBe(String(q.n + 1));
    }
    expect(seen).toBeGreaterThan(0);
  });

  it("teaches 100 against 10 and 1000, not against 99", () => {
    const curriculum = atStage(5, 100);
    let landmarks = 0;
    for (let i = 0; i < 200; i++) {
      const q = numsProvider.generate(ctx({ curriculum })) as NumsQuestion;
      if (q.n !== 100 && q.n !== 10) continue;
      landmarks++;
      const opts = q.options as string[];
      expect(opts).toContain(String(q.n));
      if (q.n === 100) expect(opts.sort()).toEqual(["10", "100", "1000"].sort());
    }
    expect(landmarks).toBeGreaterThan(0);
  });

  it("gives quantity choices the wrapping button and numerals the round one", () => {
    for (const stage of STAGES) {
      const curriculum = atStage(stage, 20);
      for (let i = 0; i < 40; i++) {
        const q = numsProvider.generate(ctx({ curriculum })) as NumsQuestion;
        const { variant } = numsProvider.render(q);
        expect(variant).toBe(q.dir === "toQuantity" ? "answerGroup" : "answerFind");
      }
    }
  });

  it("avoids repeating a number already asked this run", () => {
    const curriculum = atStage(2, 10);
    for (let i = 0; i < 60; i++) {
      const q = numsProvider.generate(
        ctx({ curriculum, usedKeys: ["nums:2:7"] })
      ) as NumsQuestion;
      expect(q.n).not.toBe(7);
    }
  });
});

describe("the ladder a child actually walks", () => {
  function stagesOverARun(level: DifficultyLevel): number[] {
    const curriculum = defaultCurriculum("nums");
    const seen: number[] = [];
    const perBand = curriculum.stepsPerBlock ?? 6;
    for (let step = 1; step <= perBand * 3; step++) {
      const q = numsProvider.generate(ctx({ curriculum, level, step })) as NumsQuestion;
      if (seen[seen.length - 1] !== q.stage) seen.push(q.stage);
    }
    return seen;
  }

  it("starts easy at matching quantities and never shows a numeral first", () => {
    expect(stagesOverARun("easy")[0]).toBe(1);
  });

  it("climbs one rung per band, and hard reaches tens and hundreds", () => {
    expect(stagesOverARun("easy")).toEqual([1, 2, 3]);
    expect(stagesOverARun("medium")).toEqual([2, 3, 4]);
    expect(stagesOverARun("hard")).toEqual([3, 4, 5]);
  });
});

describe("drawAmount", () => {
  it("draws small amounts one by one", () => {
    expect(drawAmount(3, "🍎")).toBe("🍎🍎🍎");
    expect(drawAmount(10, "🍎")).toBe("🍎".repeat(10));
  });

  it("bundles tens above ten so 34 is three tens and four", () => {
    const drawn = drawAmount(34, "🍎");
    expect([...drawn].filter((c) => c === TEN_GLYPH).length).toBe(3);
    expect([...drawn].filter((c) => c === "🍎").length).toBe(4);
  });

  it("draws a round hundred as ten tens", () => {
    expect([...drawAmount(100, "🍎")].filter((c) => c === TEN_GLYPH).length).toBe(10);
  });
});

describe("hebNumber", () => {
  it("reads the numbers a child meets", () => {
    expect(hebNumber(5)).toBe("חמש");
    expect(hebNumber(10)).toBe("עשר");
    expect(hebNumber(20)).toBe("עשרים");
    expect(hebNumber(100)).toBe("מאה");
  });

  it("composes tens past the table", () => {
    expect(hebNumber(40)).toBe("ארבעים");
    expect(hebNumber(42)).toBe("ארבעים ושתיים");
    expect(hebNumber(91)).toBe("תשעים ואחת");
  });
});
