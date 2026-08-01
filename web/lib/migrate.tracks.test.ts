import { describe, expect, it } from "vitest";
import { GAMES, GAME_GROUPS, GAME_ORDER } from "@/data/games";
import { migrateProfile, newProfile, parseStoredState, STATE_KEY } from "./migrate";
import type { Profile } from "./types";

/**
 * A save written before the Hebrew/English/music tracks existed: four games, and
 * a hand-tuned add curriculum the parent must not lose.
 */
function legacyProfile(): Profile {
  const p = newProfile("איתן", "🙂", "boy");
  const tuned = p.games.add.curriculum;
  tuned.stepsPerBlock = 7;
  tuned.bands.easy[0] = { minSum: 3, maxSum: 5, visual: "numbers" };
  return {
    ...p,
    games: {
      find: p.games.find,
      add: { ...p.games.add, level: "hard", curriculum: tuned },
      sub: p.games.sub,
      eng: { ...p.games.eng, enabled: false },
    },
  } as unknown as Profile;
}

describe("subject groups", () => {
  // GAME_ORDER is derived from the groups, so a game left out of every group
  // would vanish from both screens *and* stop being migrated into old saves.
  it("place every game exactly once", () => {
    const grouped = GAME_GROUPS.flatMap((g) => g.games);
    expect([...grouped].sort()).toEqual(Object.keys(GAMES).sort());
    expect(new Set(grouped).size).toBe(grouped.length);
  });
});

describe("migrating a save from before the tracks shipped", () => {
  it("adds the three tracks, enabled and playable", () => {
    const p = migrateProfile(legacyProfile());
    for (const gid of ["hebread", "engread", "music"] as const) {
      expect(p.games[gid]).toBeDefined();
      expect(p.games[gid].enabled).toBe(true);
      expect(p.games[gid].level).toBe("easy");
      expect(p.games[gid].curriculum.bands.easy.length).toBeGreaterThan(0);
    }
  });

  it("covers every game the home screen can list", () => {
    const p = migrateProfile(legacyProfile());
    GAME_ORDER.forEach((gid) => expect(p.games[gid]).toBeDefined());
  });

  it("leaves the parent's existing tuning and on/off choices alone", () => {
    const p = migrateProfile(legacyProfile());
    expect(p.games.add.level).toBe("hard");
    expect(p.games.add.curriculum.stepsPerBlock).toBe(7);
    expect(p.games.add.curriculum.bands.easy[0]).toEqual({
      minSum: 3,
      maxSum: 5,
      visual: "numbers",
    });
    expect(p.games.eng.enabled).toBe(false);
  });

  it("does not add counts to a save that never had them", () => {
    const p = migrateProfile(legacyProfile());
    expect(p.games.add.curriculum.counts).toBeUndefined();
    expect(JSON.stringify(p.games.add.curriculum)).not.toContain("counts");
  });

  it("upgrades a stored alufim_state_v2 blob end to end", () => {
    const raw = JSON.stringify({
      version: 2,
      profiles: [legacyProfile()],
      lastProfileId: null,
    });
    const st = parseStoredState(raw, {});
    expect(STATE_KEY).toBe("alufim_state_v2");
    expect(st.profiles[0].games.hebread.enabled).toBe(true);
    expect(st.profiles[0].games.music.enabled).toBe(true);
  });
});
