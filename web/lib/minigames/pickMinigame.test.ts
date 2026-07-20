import { beforeEach, describe, expect, it } from "vitest";
import { MINIGAME_SKINS } from "@/data/minigames";
import { ACTIVE_ENGINES } from "./types";
import { pickMinigameSkin, resetMinigameRecent } from "./pickMinigame";

describe("pickMinigameSkin", () => {
  beforeEach(() => resetMinigameRecent());

  it("only picks from ACTIVE_ENGINES by default", () => {
    for (let i = 0; i < 20; i++) {
      const skin = pickMinigameSkin("lion");
      expect(ACTIVE_ENGINES.includes(skin.engineId)).toBe(true);
    }
  });

  it("respects an enabled-engines allowlist from settings", () => {
    for (let i = 0; i < 15; i++) {
      const skin = pickMinigameSkin("lion", null, ["sliceSwipe"]);
      expect(skin.engineId).toBe("sliceSwipe");
    }
  });

  it("prefers skins tagged for the character when the engine has one", () => {
    const skin = pickMinigameSkin("lion", "sliceSwipe");
    expect(skin.characterTags.includes("lion")).toBe(true);
  });

  it("can filter an explicit engine for tests", () => {
    const skin = pickMinigameSkin("shark", "slingShot");
    expect(skin.engineId).toBe("slingShot");
    expect(MINIGAME_SKINS.some((s) => s.id === skin.id)).toBe(true);
  });

  it("spreads engines evenly for dragon (not stuck on slingShot)", () => {
    const enabled = ["pathDash", "timingBounce", "sliceSwipe", "slingShot"] as const;
    const counts: Record<string, number> = {};
    for (let i = 0; i < 80; i++) {
      const skin = pickMinigameSkin("dragon", null, enabled);
      counts[skin.engineId] = (counts[skin.engineId] || 0) + 1;
    }
    // Every enabled engine should appear; none should dominate (~>50%).
    for (const id of enabled) {
      expect(counts[id] ?? 0).toBeGreaterThan(5);
      expect(counts[id] ?? 0).toBeLessThan(40);
    }
  });

  it("avoids repeating the same engine when alternatives exist", () => {
    const enabled = ["pathDash", "timingBounce", "sliceSwipe", "slingShot"] as const;
    const first = pickMinigameSkin("dragon", null, enabled);
    const second = pickMinigameSkin("dragon", null, enabled);
    const third = pickMinigameSkin("dragon", null, enabled);
    // With 4 engines and recent-limit 2, three in a row should not all match.
    const ids = [first.engineId, second.engineId, third.engineId];
    expect(new Set(ids).size).toBeGreaterThan(1);
  });
});
