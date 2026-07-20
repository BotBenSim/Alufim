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

  it("prefers skins tagged for the character", () => {
    const skin = pickMinigameSkin("lion");
    expect(skin.characterTags.includes("lion")).toBe(true);
  });

  it("can filter an explicit engine for tests", () => {
    const skin = pickMinigameSkin("shark", "slingShot");
    expect(skin.engineId).toBe("slingShot");
    expect(MINIGAME_SKINS.some((s) => s.id === skin.id)).toBe(true);
  });

  it("avoids immediate skin repeats when alternatives exist", () => {
    const first = pickMinigameSkin("lion", "sliceSwipe");
    const second = pickMinigameSkin("lion", "sliceSwipe");
    const lionSlice = MINIGAME_SKINS.filter(
      (s) => s.engineId === "sliceSwipe" && s.characterTags.includes("lion")
    );
    if (lionSlice.length > 1) {
      expect(second.id).not.toBe(first.id);
    } else {
      expect(second.id).toBe(first.id);
    }
  });
});
