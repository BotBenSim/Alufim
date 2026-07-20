import { describe, expect, it } from "vitest";
import { formForXp, formThresholds, xpForCorrect } from "./xp";

describe("xpForCorrect", () => {
  it("returns max tier value with no mistakes on easy step 1", () => {
    expect(xpForCorrect("easy", 1, 0)).toBe(3);
  });

  it("reduces reward after mistakes", () => {
    expect(xpForCorrect("easy", 1, 1)).toBe(2);
    expect(xpForCorrect("easy", 1, 2)).toBe(1);
  });

  it("uses higher tier at later steps", () => {
    expect(xpForCorrect("easy", 9, 0)).toBe(4);
  });

  it("hard late step with mistakes still gives at least 1", () => {
    expect(xpForCorrect("hard", 20, 2)).toBe(1);
  });
});

describe("formForXp (3 living forms, no egg)", () => {
  it("starts at form 0 (baby)", () => {
    expect(formForXp(0, 3)).toBe(0);
  });

  it("advances at cumulative thresholds (50, 150)", () => {
    expect(formThresholds(3)).toEqual([0, 50, 150]);
    expect(formForXp(49, 3)).toBe(0);
    expect(formForXp(50, 3)).toBe(1);
    expect(formForXp(149, 3)).toBe(1);
    expect(formForXp(150, 3)).toBe(2);
  });

  it("caps at last form index", () => {
    expect(formForXp(9999, 3)).toBe(2);
  });
});
