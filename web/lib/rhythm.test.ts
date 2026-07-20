import { describe, expect, it } from "vitest";
import {
  buildBeat,
  clampPlayEverySteps,
  DEFAULT_PLAY_EVERY_STEPS,
  resolveRhythm,
  rhythmFromPlayEvery,
} from "./rhythm";

describe("rhythmFromPlayEvery", () => {
  it("defaults to every 3 steps", () => {
    expect(DEFAULT_PLAY_EVERY_STEPS).toBe(3);
    const preset = resolveRhythm();
    expect(preset.beats[0]).toEqual({ every: 3, type: "play" });
  });

  it("builds beat from a numeric cadence", () => {
    const preset = rhythmFromPlayEvery(5);
    expect(preset.beats[0].every).toBe(5);
    expect(buildBeat(preset, 5)).toBe("play");
    expect(buildBeat(preset, 4)).toBe("learn");
    expect(buildBeat(preset, 10)).toBe("play");
  });

  it("clamps playEverySteps to 2–20", () => {
    expect(clampPlayEverySteps(1)).toBe(2);
    expect(clampPlayEverySteps(99)).toBe(20);
    expect(clampPlayEverySteps("x")).toBe(3);
    expect(rhythmFromPlayEvery(1).beats[0].every).toBe(2);
  });
});

describe("buildBeat", () => {
  it("returns learn when no beat matches", () => {
    const preset = rhythmFromPlayEvery(3);
    expect(buildBeat(preset, 1)).toBe("learn");
    expect(buildBeat(preset, 2)).toBe("learn");
  });

  it("returns play every N steps", () => {
    expect(buildBeat(rhythmFromPlayEvery(3), 3)).toBe("play");
    expect(buildBeat(rhythmFromPlayEvery(3), 6)).toBe("play");
    expect(buildBeat(rhythmFromPlayEvery(4), 4)).toBe("play");
    expect(buildBeat(rhythmFromPlayEvery(4), 8)).toBe("play");
  });
});
