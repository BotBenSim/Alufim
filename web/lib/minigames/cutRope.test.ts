import { describe, expect, it } from "vitest";
import {
  candyFromAngle,
  cutRopeEngine,
  pickRopeLayout,
  stepPendulum,
  swipeCutsRope,
  swingPivot,
} from "./cutRope";
import { CHARACTERS } from "@/data/characters";
import { MINIGAME_SKINS } from "@/data/minigames";

const lion = CHARACTERS.find((c) => c.id === "lion")!;
const skin = MINIGAME_SKINS.find((s) => s.engineId === "cutRope")!;

describe("cutRope helpers", () => {
  it("candy hangs below the pivot at angle 0", () => {
    const pivot = { x: 0.5, y: 0.1 };
    const c = candyFromAngle(pivot, 0.3, 0);
    expect(c.x).toBeCloseTo(0.5, 5);
    expect(c.y).toBeCloseTo(0.4, 5);
  });

  it("pendulum moves when started at an angle", () => {
    const a0 = -0.8;
    const next = stepPendulum(a0, 0, 0.35, 0.05);
    expect(next.angle).not.toBeCloseTo(a0, 3);
  });

  it("layouts have a swing pivot and start angle", () => {
    for (let i = 0; i < 4; i++) {
      const layout = pickRopeLayout(i);
      const pivot = swingPivot(layout.pegs);
      expect(pivot.y).toBeLessThan(0.2);
      expect(Math.abs(layout.startAngle)).toBeGreaterThan(0.3);
    }
  });

  it("swipeCutsRope detects a crossing slash", () => {
    const a = { x: 0.5, y: 0.1 };
    const b = { x: 0.5, y: 0.4 };
    expect(swipeCutsRope({ x: 0.3, y: 0.25 }, { x: 0.7, y: 0.25 }, a, b)).toBe(true);
    expect(swipeCutsRope({ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.1 }, a, b)).toBe(false);
  });
});

describe("cutRopeEngine", () => {
  it("scores feeds; misses do not complete", () => {
    let session = cutRopeEngine.start({
      characterId: "lion",
      character: lion,
      skin,
    });
    session = cutRopeEngine.applyInput(session, {
      type: "action",
      action: "cut",
      quality: "miss",
    });
    expect(session.progress).toBe(0);
    const needed = (session.state as { needed: number }).needed;
    for (let i = 0; i < needed; i++) {
      session = cutRopeEngine.applyInput(session, {
        type: "action",
        action: "cut",
        quality: "good",
      });
    }
    expect(session.complete).toBe(true);
  });
});
