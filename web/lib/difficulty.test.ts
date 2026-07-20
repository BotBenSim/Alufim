import { describe, expect, it } from "vitest";
import { diffParams, effectiveLevel } from "./difficulty";

describe("diffParams", () => {
  it("returns easy add block for step 1", () => {
    expect(diffParams("add", "easy", 1)).toEqual({ minSum: 2, maxSum: 8 });
  });

  it("advances add block every 4 steps", () => {
    expect(diffParams("add", "easy", 5)).toEqual({ minSum: 8, maxSum: 16 });
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
