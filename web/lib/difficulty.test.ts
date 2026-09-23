import { describe, expect, it } from "vitest";
import {
  clampCurriculum,
  curriculumSummary,
  defaultCurriculum,
  defaultMathVisual,
  diffParams,
  effectiveLevel,
  ensureCurriculum,
  GAME_DIFFICULTY,
  normalizeCounts,
  normalizeMathVisual,
} from "./difficulty";
import { migrateProfile, newProfile } from "./migrate";
import { addRenderMeta } from "./providers/add";
import { bandForStepWithCounts, blockForStep, DIFFICULTY_BLOCK_SIZE } from "./xp";
import type { Profile } from "./types";

describe("diffParams", () => {
  it("returns easy add block for step 1 from curriculum", () => {
    const cur = defaultCurriculum("add");
    expect(diffParams(cur, "easy", 1)).toEqual({
      minSum: 2,
      maxSum: 8,
      visual: "fullCount",
    });
  });

  it("advances add block every stepsPerBlock steps", () => {
    const cur = defaultCurriculum("add");
    expect(diffParams(cur, "easy", 5)).toEqual({
      minSum: 8,
      maxSum: 16,
      visual: "fullCount",
    });
  });

  it("uses custom stepsPerBlock from curriculum", () => {
    const cur = defaultCurriculum("add");
    cur.stepsPerBlock = 6;
    expect(diffParams(cur, "easy", 6)).toMatchObject({ minSum: 2, maxSum: 8 });
    expect(diffParams(cur, "easy", 7)).toMatchObject({ minSum: 8, maxSum: 16 });
  });

  it("uses customized maxSum on first band", () => {
    const cur = defaultCurriculum("add");
    cur.bands.easy[0] = { minSum: 2, maxSum: 8, visual: "fullCount" };
    expect(diffParams(cur, "easy", 1)).toEqual({
      minSum: 2,
      maxSum: 8,
      visual: "fullCount",
    });
    cur.bands.easy[0] = { minSum: 1, maxSum: 10, visual: "numbers" };
    expect(diffParams(cur, "easy", 1)).toEqual({
      minSum: 1,
      maxSum: 10,
      visual: "numbers",
    });
  });
});

describe("math visual per band", () => {
  it("defaults band 0–1 to fullCount and band 2+ to countOn", () => {
    expect(defaultMathVisual(0)).toBe("fullCount");
    expect(defaultMathVisual(1)).toBe("fullCount");
    expect(defaultMathVisual(2)).toBe("countOn");
  });

  it("factory easy add third band is countOn", () => {
    const cur = defaultCurriculum("add");
    expect(diffParams(cur, "easy", 9)).toMatchObject({ visual: "countOn" });
  });

  it("ensureCurriculum fills missing visual without wiping ranges", () => {
    const legacy = defaultCurriculum("add");
    delete legacy.bands.easy[0].visual;
    const ensured = ensureCurriculum("add", legacy);
    expect(ensured.bands.easy[0].visual).toBe("fullCount");
    expect(ensured.bands.easy[0].minSum).toBe(2);
  });

  it("addRenderMeta reads visual from the active band", () => {
    const cur = defaultCurriculum("add");
    cur.bands.easy[0] = { minSum: 2, maxSum: 8, visual: "numbers" };
    const meta = addRenderMeta(
      { op: "add", a: 3, b: 2, answer: 5 },
      1,
      "🍎",
      cur,
      "easy"
    );
    expect(meta.visual).toBe("numbers");
    expect(normalizeMathVisual("nope")).toBe("fullCount");
  });
});

describe("per-band counts", () => {
  it("walks bands by count instead of the uniform ramp", () => {
    const cur = { ...defaultCurriculum("add"), counts: [2, 3, 1] };
    // 2 of band 0, then 3 of band 1, then 1 of band 2
    expect(diffParams(cur, "easy", 1)).toEqual(cur.bands.easy[0]);
    expect(diffParams(cur, "easy", 2)).toEqual(cur.bands.easy[0]);
    expect(diffParams(cur, "easy", 3)).toEqual(cur.bands.easy[1]);
    expect(diffParams(cur, "easy", 5)).toEqual(cur.bands.easy[1]);
    expect(diffParams(cur, "easy", 6)).toEqual(cur.bands.easy[2]);
  });

  it("stays on the last band with questions once counts run out", () => {
    const cur = { ...defaultCurriculum("add"), counts: [1, 2, 0] };
    expect(diffParams(cur, "easy", 4)).toEqual(cur.bands.easy[1]);
    expect(diffParams(cur, "easy", 40)).toEqual(cur.bands.easy[1]);
  });

  it("skips bands set to 0", () => {
    expect(bandForStepWithCounts(1, [0, 0, 5])).toBe(2);
    expect(bandForStepWithCounts(1, [0, 3, 5])).toBe(1);
    expect(bandForStepWithCounts(4, [0, 3, 5])).toBe(2);
  });

  it("falls back to the uniform ramp when counts are absent or all zero", () => {
    const base = defaultCurriculum("add");
    expect(ensureCurriculum("add", { ...base, counts: [0, 0, 0] }).counts).toBeUndefined();
    expect(ensureCurriculum("add", base).counts).toBeUndefined();
    const cur = { ...base, counts: [0, 0, 0] } as typeof base;
    // step 5 is band 1 under the default stepsPerBlock of 4
    expect(diffParams(ensureCurriculum("add", cur), "easy", 5)).toEqual(base.bands.easy[1]);
  });

  it("clamps, pads and truncates counts to the number of bands", () => {
    const slots = defaultCurriculum("add").bands.easy.length;
    expect(normalizeCounts([5], slots)).toEqual([5, 0, 0]);
    expect(normalizeCounts([1, 2, 3, 4, 5], slots)).toEqual([1, 2, 3]);
    expect(normalizeCounts([-4, 1e6, "x"], slots)).toEqual([0, 99, 0]);
    expect(normalizeCounts("nope", slots)).toBeUndefined();
  });

  it("survives a clamp round-trip", () => {
    const cur = { ...defaultCurriculum("add"), counts: [10, 10, 10] };
    expect(clampCurriculum("add", cur).counts).toEqual([10, 10, 10]);
  });
});

describe("blockForStep", () => {
  it("defaults to DIFFICULTY_BLOCK_SIZE", () => {
    expect(DIFFICULTY_BLOCK_SIZE).toBe(4);
    expect(blockForStep(1)).toBe(0);
    expect(blockForStep(5)).toBe(1);
  });

  it("respects custom stepsPerBlock", () => {
    expect(blockForStep(6, 6)).toBe(0);
    expect(blockForStep(7, 6)).toBe(1);
  });
});

describe("defaultCurriculum / ensureCurriculum", () => {
  it("deep-copies factory bands so mutations do not leak", () => {
    const a = defaultCurriculum("add");
    const b = defaultCurriculum("add");
    a.bands.easy[0] = { minSum: 1, maxSum: 3, visual: "numbers" };
    expect(b.bands.easy[0]).toEqual(GAME_DIFFICULTY.add.easy![0]);
    expect(GAME_DIFFICULTY.add.easy![0]).toEqual({
      minSum: 2,
      maxSum: 8,
      visual: "fullCount",
    });
  });

  it("fills missing curriculum from factory", () => {
    const filled = ensureCurriculum("add", null);
    expect(filled.stepsPerBlock).toBe(4);
    expect(filled.bands.easy[0]).toEqual({
      minSum: 2,
      maxSum: 8,
      visual: "fullCount",
    });
  });

  it("keeps customized bands when ensuring", () => {
    const custom = defaultCurriculum("add");
    custom.stepsPerBlock = 6;
    custom.bands.easy[0] = { minSum: 2, maxSum: 8, visual: "countOn" };
    const ensured = ensureCurriculum("add", custom);
    expect(ensured.stepsPerBlock).toBe(6);
    expect(ensured.bands.easy[0]).toEqual({
      minSum: 2,
      maxSum: 8,
      visual: "countOn",
    });
  });
});

describe("clampCurriculum", () => {
  it("nudges max up when inverted (does not swap bounds) and clamps steps", () => {
    const cur = defaultCurriculum("add");
    cur.stepsPerBlock = 99;
    cur.bands.easy[0] = { minSum: 20, maxSum: 5 };
    const clamped = clampCurriculum("add", cur);
    expect(clamped.stepsPerBlock).toBe(20);
    expect(clamped.bands.easy[0]).toEqual({
      minSum: 20,
      maxSum: 21,
      visual: "fullCount",
    });
  });

  it("keeps a valid add range unchanged", () => {
    const cur = defaultCurriculum("add");
    cur.bands.easy[0] = { minSum: 4, maxSum: 10, visual: "fullCount" };
    const clamped = clampCurriculum("add", cur);
    expect(clamped.bands.easy[0]).toEqual({
      minSum: 4,
      maxSum: 10,
      visual: "fullCount",
    });
  });
});

describe("curriculumSummary", () => {
  it("summarizes first add band", () => {
    const cur = defaultCurriculum("add");
    cur.stepsPerBlock = 6;
    expect(curriculumSummary("add", cur, "easy")).toContain("סכום 2–8");
    expect(curriculumSummary("add", cur, "easy")).toContain("ספירה");
  });
});

describe("profile curriculum copy-on-create / migrate", () => {
  it("newProfile copies factory curriculum into each game", () => {
    const p = newProfile("טסט", "🦄");
    expect(p.games.add.curriculum).toEqual(defaultCurriculum("add"));
    expect(p.games.sub.curriculum.stepsPerBlock).toBe(4);
    p.games.add.curriculum.bands.easy[0] = {
      minSum: 1,
      maxSum: 4,
      visual: "numbers",
    };
    expect(defaultCurriculum("add").bands.easy[0]).toEqual({
      minSum: 2,
      maxSum: 8,
      visual: "fullCount",
    });
  });

  it("migrateProfile fills missing curriculum without wiping customizations", () => {
    const legacy = {
      id: "p1",
      name: "ישן",
      avatar: "🙂",
      games: {
        add: { enabled: true, level: "easy" },
        sub: { enabled: true, level: "easy" },
        find: { enabled: true, level: "easy" },
        eng: { enabled: false, level: "easy" },
      },
      characters: {},
      activeCharacterId: null,
    } as unknown as Profile;

    const migrated = migrateProfile(legacy);
    expect(migrated.games.add.curriculum.bands.easy[0]).toEqual({
      minSum: 2,
      maxSum: 8,
      visual: "fullCount",
    });

    migrated.games.add.curriculum.stepsPerBlock = 6;
    migrated.games.add.curriculum.bands.easy[0] = {
      minSum: 2,
      maxSum: 8,
      visual: "countOn",
    };
    const again = migrateProfile(migrated);
    expect(again.games.add.curriculum.stepsPerBlock).toBe(6);
    expect(again.games.add.curriculum.bands.easy[0]).toEqual({
      minSum: 2,
      maxSum: 8,
      visual: "countOn",
    });
  });

  it("reset via defaultCurriculum re-copies factory", () => {
    const p = newProfile("טסט", "🦄");
    p.games.add.curriculum.stepsPerBlock = 6;
    p.games.add.curriculum.bands.easy[0] = {
      minSum: 1,
      maxSum: 4,
      visual: "numbers",
    };
    p.games.add.curriculum = defaultCurriculum("add");
    expect(p.games.add.curriculum).toEqual(defaultCurriculum("add"));
  });
});

describe("effectiveLevel", () => {
  it("keeps base level with no history", () => {
    expect(effectiveLevel("medium", [])).toBe("medium");
  });

  it("drops one level after two wrong attempts", () => {
    const recent = [
      { hadWrongAttempt: true },
      { hadWrongAttempt: true },
    ];
    expect(effectiveLevel("hard", recent)).toBe("medium");
    expect(effectiveLevel("easy", recent)).toBe("easy");
  });
});
