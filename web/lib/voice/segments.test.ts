import { describe, expect, it } from "vitest";
import { HEB_NUM } from "@/data/hebrew";
import { addSpeakPrompt } from "@/lib/providers/add";
import { subSpeakPrompt } from "@/lib/providers/sub";
import { normalizeSpoken } from "./normalize";
import { splitSpoken } from "./segments";

describe("splitSpoken", () => {
  it("splits an addition prompt at the pause before the second number", () => {
    const line = addSpeakPrompt({ a: 7, b: 5 } as never, HEB_NUM);
    expect(splitSpoken(line)).toEqual(["כמה זה שבע ועוד", "חמש?"]);
  });

  it("splits a subtraction prompt the same way", () => {
    const line = subSpeakPrompt({ a: 12, b: 3 } as never, HEB_NUM);
    expect(splitSpoken(line)).toEqual([`כמה זה ${HEB_NUM[12]} פחות`, "שלוש?"]);
  });

  it("leaves other lines whole", () => {
    expect(splitSpoken("כל הכבוד!")).toBeNull();
  });
});

describe("normalizeSpoken", () => {
  it("drops emoji and extra spaces but keeps niqqud", () => {
    expect(normalizeSpoken("🎉  כל  הכבוד! ")).toBe("כל הכבוד!");
    expect(normalizeSpoken("זָה.")).toBe("זָה.");
  });
});
