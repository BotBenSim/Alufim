import { describe, expect, it } from "vitest";
import { MINIGAME_SKINS } from "@/data/minigames";
import { CHARACTERS } from "@/data/characters";
import { ACTIVE_ENGINES, MINIGAME_ENGINES } from "./index";
import type { MinigameEngineId, MinigameInput } from "./types";

const lion = CHARACTERS.find((c) => c.id === "lion")!;

const SCORING_ACTION: Record<MinigameEngineId, MinigameInput["action"]> = {
  pathDash: "jump",
  timingBounce: "hop",
  sliceSwipe: "slice",
  slingShot: "launch",
  charMaze: "step",
  cutRope: "cut",
  laneCatch: "catch",
};

function skinFor(engineId: MinigameEngineId) {
  return (
    MINIGAME_SKINS.find((s) => s.engineId === engineId && s.characterTags.includes("lion")) ??
    MINIGAME_SKINS.find((s) => s.engineId === engineId)!
  );
}

describe("minigame engines", () => {
  it("registers the seven active engines", () => {
    expect(Object.keys(MINIGAME_ENGINES).sort()).toEqual(
      [
        "charMaze",
        "cutRope",
        "laneCatch",
        "pathDash",
        "sliceSwipe",
        "slingShot",
        "timingBounce",
      ].sort()
    );
  });

  it("all registered engines are on the play beat", () => {
    expect([...ACTIVE_ENGINES].sort()).toEqual(Object.keys(MINIGAME_ENGINES).sort());
  });

  for (const id of ACTIVE_ENGINES) {
    it(`${id}: good actions reach win; misses do not`, () => {
      const engine = MINIGAME_ENGINES[id];
      const skin = skinFor(id);
      let session = engine.start({ characterId: "lion", character: lion, skin });
      expect(session.complete).toBe(false);

      const action = SCORING_ACTION[id];

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
});
