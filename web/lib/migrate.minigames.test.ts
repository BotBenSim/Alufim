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
    expect(p.minigames.meterBurst.enabled).toBe(false);
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
