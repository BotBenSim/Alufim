import { describe, expect, it } from "vitest";
import { buildBeat, RHYTHM_PRESETS } from "./rhythm";

describe("buildBeat", () => {
  it("returns learn when no beat matches", () => {
    expect(buildBeat(RHYTHM_PRESETS.every3, 1)).toBe("learn");
    expect(buildBeat(RHYTHM_PRESETS.every3, 2)).toBe("learn");
  });

  it("returns play every 3 steps for every3 preset", () => {
    expect(buildBeat(RHYTHM_PRESETS.every3, 3)).toBe("play");
    expect(buildBeat(RHYTHM_PRESETS.every3, 6)).toBe("play");
  });

  it("returns play every 4 steps for every4 preset", () => {
    expect(buildBeat(RHYTHM_PRESETS.every4, 4)).toBe("play");
    expect(buildBeat(RHYTHM_PRESETS.every4, 8)).toBe("play");
  });
});
