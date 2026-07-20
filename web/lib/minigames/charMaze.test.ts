import { describe, expect, it } from "vitest";
import {
  canStep,
  dirToAdjacent,
  neighbor,
  pickLayout,
  swipeToDir,
  charMazeEngine,
} from "./charMaze";
import { CHARACTERS } from "@/data/characters";
import { MINIGAME_SKINS } from "@/data/minigames";

const lion = CHARACTERS.find((c) => c.id === "lion")!;
const skin = MINIGAME_SKINS.find((s) => s.engineId === "charMaze")!;

describe("charMaze helpers", () => {
  it("layouts have clear start and exit path cells", () => {
    for (let i = 0; i < 3; i++) {
      const layout = pickLayout(i);
      const [sr, sc] = layout.start;
      const [er, ec] = layout.exit;
      expect(canStep(layout.grid, sr, sc)).toBe(true);
      expect(canStep(layout.grid, er, ec)).toBe(true);
    }
  });

  it("neighbor + walls block steps", () => {
    const layout = pickLayout(0);
    const [r, c] = layout.start;
    const [ur, uc] = neighbor(r, c, "up");
    expect(canStep(layout.grid, ur, uc)).toBe(false);
  });

  it("swipeToDir picks dominant axis", () => {
    expect(swipeToDir(40, 5)).toBe("right");
    expect(swipeToDir(-40, 5)).toBe("left");
    expect(swipeToDir(5, 40)).toBe("down");
    expect(swipeToDir(5, -40)).toBe("up");
    expect(swipeToDir(5, 5)).toBeNull();
  });

  it("dirToAdjacent only allows one orthogonal step", () => {
    expect(dirToAdjacent(2, 2, 2, 3)).toBe("right");
    expect(dirToAdjacent(2, 2, 1, 2)).toBe("up");
    expect(dirToAdjacent(2, 2, 2, 4)).toBeNull();
    expect(dirToAdjacent(2, 2, 3, 3)).toBeNull();
  });
});

describe("charMazeEngine", () => {
  it("scores exit reaches; wall misses do not complete", () => {
    let session = charMazeEngine.start({
      characterId: "lion",
      character: lion,
      skin,
    });
    session = charMazeEngine.applyInput(session, {
      type: "action",
      action: "step",
      quality: "miss",
    });
    expect(session.progress).toBe(0);
    const needed = (session.state as { needed: number }).needed;
    for (let i = 0; i < needed; i++) {
      session = charMazeEngine.applyInput(session, {
        type: "action",
        action: "step",
        quality: "good",
      });
    }
    expect(session.complete).toBe(true);
  });
});
