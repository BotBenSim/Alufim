import { describe, expect, it } from "vitest";
import { defaultCurriculum } from "@/lib/difficulty";
import { findProvider, type FindQuestion } from "@/lib/providers/find";
import type { ProviderContext } from "@/lib/types";

function ctx(overrides: Partial<ProviderContext> = {}): ProviderContext {
  return {
    gameId: "find",
    level: "easy",
    step: 20,
    usedKeys: [],
    recent: [],
    countEmoji: "🦁",
    curriculum: defaultCurriculum("find"),
    ...overrides,
  };
}

describe("findProvider num", () => {
  it("always includes answer choices for find-the-number", () => {
    const curriculum = defaultCurriculum("find");
    curriculum.bands.easy = [{ maxNum: 15, kinds: ["num"] }];
    const q = findProvider.generate(ctx({ curriculum, step: 0 })) as FindQuestion;
    expect(q.kind).toBe("num");
    const opts = q.options as number[];
    expect(opts.length).toBeGreaterThanOrEqual(3);
    expect(opts.map(String)).toContain(String(q.answer));
  });
});
