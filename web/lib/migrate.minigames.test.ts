import { describe, expect, it } from "vitest";
import { defaultMinigameConfig } from "@/data/minigameMeta";
import { migrateProfile, newProfile } from "./migrate";
import type { Profile } from "./types";

describe("profile minigames migration", () => {
  it("new profiles include default minigame toggles", () => {
    const p = newProfile("טסט", "🙂");
    expect(p.minigames.pathDash.enabled).toBe(true);
    expect(p.minigames.timingBounce.enabled).toBe(true);
    expect(p.minigames.sliceSwipe.enabled).toBe(true);
    expect(p.minigames.slingShot.enabled).toBe(true);
    expect(p.minigames.charMaze.enabled).toBe(true);
    expect(p.minigames.cutRope.enabled).toBe(true);
    expect(Object.keys(p.minigames).sort()).toEqual(
      [
        "charMaze",
        "cutRope",
        "pathDash",
        "sliceSwipe",
        "slingShot",
        "timingBounce",
      ].sort()
    );
  });

  it("migrateProfile drops removed stub minigame ids", () => {
    const legacy = {
      id: "p1",
      name: "ישן",
      avatar: "🙂",
      games: {
        find: { enabled: true, level: "easy" },
        add: { enabled: true, level: "easy" },
        sub: { enabled: true, level: "easy" },
        eng: { enabled: false, level: "easy" },
      },
      minigames: {
        ...defaultMinigameConfig(),
        // stale keys from older builds
        meterBurst: { enabled: true },
        tapCollect: { enabled: true },
        catch: { enabled: false },
      },
      characters: { lion: { form: 0, totalXp: 0 } },
      activeCharacterId: "lion",
    } as unknown as Profile;

    const next = migrateProfile(legacy);
    expect(next.minigames).toEqual(defaultMinigameConfig());
    expect(
      "meterBurst" in next.minigames ||
        "tapCollect" in next.minigames ||
        "catch" in next.minigames
    ).toBe(false);
  });

  it("migrateProfile adds minigames to old saves without wiping games", () => {
    const legacy = {
      id: "p1",
      name: "ישן",
      avatar: "🙂",
      games: {
        find: { enabled: true, level: "easy" },
        add: { enabled: true, level: "medium" },
        sub: { enabled: true, level: "easy" },
        eng: { enabled: false, level: "easy" },
      },
      characters: { lion: { form: 0, totalXp: 10 } },
      activeCharacterId: "lion",
    } as unknown as Profile;

    const next = migrateProfile(legacy);
    expect(next.games.add.level).toBe("medium");
    expect(next.minigames).toEqual(defaultMinigameConfig());
    expect(next.characters.lion.totalXp).toBe(10);
  });
});
