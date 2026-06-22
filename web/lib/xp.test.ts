import { describe, expect, it } from "vitest";
import { formForXp, xpForCorrect } from "./xp";

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

describe("formForXp", () => {
  it("starts at form 0", () => {
    expect(formForXp(0, 4)).toBe(0);
  });

  it("advances at cumulative thresholds (70, 210, 420)", () => {
    expect(formForXp(69, 4)).toBe(0);
    expect(formForXp(70, 4)).toBe(1);
    expect(formForXp(209, 4)).toBe(1);
    expect(formForXp(210, 4)).toBe(2);
    expect(formForXp(419, 4)).toBe(2);
    expect(formForXp(420, 4)).toBe(3);
  });

  it("caps at last form index", () => {
    expect(formForXp(9999, 4)).toBe(3);
  });
});
