import { describe, expect, it } from "vitest";
import { MINIGAME_SKINS } from "@/data/minigames";
import { CHARACTERS } from "@/data/characters";
import { ACTIVE_ENGINES, MINIGAME_ENGINES } from "./index";
import type { MinigameEngineId } from "./types";

const lion = CHARACTERS.find((c) => c.id === "lion")!;

function skinFor(engineId: MinigameEngineId) {
  return (
    MINIGAME_SKINS.find((s) => s.engineId === engineId && s.characterTags.includes("lion")) ??
    MINIGAME_SKINS.find((s) => s.engineId === engineId)!
  );
}

describe("minigame engines", () => {
  it("registers all six engines", () => {
    expect(Object.keys(MINIGAME_ENGINES).sort()).toEqual(
      ["catch", "meterBurst", "pathDash", "sliceSwipe", "tapCollect", "timingBounce"].sort()
    );
  });

  it("active play-beat engines are city roofs + dino + ninja", () => {
    expect([...ACTIVE_ENGINES].sort()).toEqual(
      ["pathDash", "sliceSwipe", "timingBounce"].sort()
    );
  });

  for (const id of ACTIVE_ENGINES) {
    it(`${id}: good actions reach win; misses do not`, () => {
      const engine = MINIGAME_ENGINES[id];
      const skin = skinFor(id);
      let session = engine.start({ characterId: "lion", character: lion, skin });
      expect(session.complete).toBe(false);

      const action =
        id === "pathDash"
          ? ("jump" as const)
          : id === "timingBounce"
            ? ("hop" as const)
            : ("slice" as const);

      session = engine.applyInput(session, {
        type: "action",
        action,
        quality: "miss",
      });
      expect(session.complete).toBe(false);
      expect(session.progress).toBe(0);

      const needed = (session.state as { needed: number }).needed;
      for (let i = 0; i < needed; i++) {
        session = engine.applyInput(session, {
          type: "action",
          action,
          quality: "good",
          targetId: "🍎",
        });
      }
      expect(engine.isComplete(session)).toBe(true);
      expect(session.progress).toBe(1);
    });
  }

  it("stub meterBurst still completes via taps", () => {
    const engine = MINIGAME_ENGINES.meterBurst;
    const skin = skinFor("meterBurst");
    let session = engine.start({ characterId: "lion", character: lion, skin });
    const needed = (session.state as { needed: number }).needed;
    for (let i = 0; i < needed; i++) {
      session = engine.applyInput(session, { type: "tap" });
    }
    expect(session.complete).toBe(true);
  });
});
