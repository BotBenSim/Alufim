import { describe, expect, it } from "vitest";
import { defaultMinigameConfig } from "@/data/minigameMeta";
import { migrateProfile, newProfile } from "./migrate";
import type { Profile } from "./types";

describe("profile minigames migration", () => {
  it("new profiles include default minigame toggles", () => {
    const p = newProfile("טסט", "🙂");
    expect(p.playEverySteps).toBe(3);
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
    expect(next.playEverySteps).toBe(3);
    expect(next.characters.lion.totalXp).toBe(10);
    expect(next.gender).toBe("boy");
  });

  it("migrateProfile infers girl gender for Ellie/Nova presets", () => {
    const ellie = {
      id: "p1",
      name: "אלי",
      avatar: "🙂",
      games: {
        find: { enabled: true, level: "easy" },
        add: { enabled: true, level: "easy" },
        sub: { enabled: true, level: "easy" },
        eng: { enabled: true, level: "easy" },
      },
      characters: { lion: { form: 0, totalXp: 0 } },
      activeCharacterId: "lion",
    } as unknown as Profile;

    expect(migrateProfile(ellie).gender).toBe("girl");
  });

  it("newProfile stores explicit gender", () => {
    expect(newProfile("אלי", "🙂", "girl").gender).toBe("girl");
    expect(newProfile("איתן", "🙂", "boy").gender).toBe("boy");
  });

  it("migrateProfile keeps customized playEverySteps", () => {
    const p = newProfile("טסט", "🙂");
    p.playEverySteps = 6;
    expect(migrateProfile(p).playEverySteps).toBe(6);
  });
});
