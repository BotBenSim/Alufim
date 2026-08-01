import { describe, expect, it } from "vitest";
import {
  BAD_CHANCE,
  CATCH_BAND_BOTTOM,
  CATCH_BAND_TOP,
  CATCH_TOLERANCE,
  EASE_IN_DROPS,
  LANE_COUNT,
  isCaught,
  laneCatchEngine,
  laneCenter,
  laneFromX,
  moveToward,
  pickSpawn,
  stepLane,
  type LaneCatchState,
} from "./laneCatch";
import { CHARACTERS } from "@/data/characters";
import { MINIGAME_SKINS } from "@/data/minigames";

const lion = CHARACTERS.find((c) => c.id === "lion")!;
const skin = MINIGAME_SKINS.find((s) => s.engineId === "laneCatch")!;

/** Feeds pickSpawn a fixed roll sequence (kind, emoji, lane per call). */
function seq(rolls: number[]): () => number {
  let i = 0;
  return () => rolls[i++ % rolls.length]!;
}

function startSession() {
  return laneCatchEngine.start({ characterId: "lion", character: lion, skin });
}

describe("laneCatch lane geometry", () => {
  it("maps pointer x to lanes at the boundaries", () => {
    expect(laneFromX(0)).toBe(0);
    expect(laneFromX(0.32)).toBe(0);
    expect(laneFromX(0.34)).toBe(1);
    expect(laneFromX(0.66)).toBe(1);
    expect(laneFromX(0.67)).toBe(2);
    expect(laneFromX(0.999)).toBe(2);
  });

  it("clamps pointer x that lands outside the stage", () => {
    expect(laneFromX(-0.4)).toBe(0);
    expect(laneFromX(1)).toBe(LANE_COUNT - 1);
    expect(laneFromX(2.5)).toBe(LANE_COUNT - 1);
  });

  it("lane centres sit in the middle of each lane", () => {
    expect(laneCenter(0)).toBeCloseTo(1 / 6);
    expect(laneCenter(1)).toBeCloseTo(0.5);
    expect(laneCenter(2)).toBeCloseTo(5 / 6);
  });

  it("keyboard steps walk one lane and stop at the edges", () => {
    expect(stepLane(1, -1)).toBe(0);
    expect(stepLane(1, 1)).toBe(2);
    expect(stepLane(0, -1)).toBe(0);
    expect(stepLane(2, 1)).toBe(2);
  });

  it("moveToward eases without overshooting the target", () => {
    expect(moveToward(0, 1, 0.25)).toBe(0.25);
    expect(moveToward(0.9, 1, 0.25)).toBe(1);
    expect(moveToward(1, 0, 0.25)).toBe(0.75);
    expect(moveToward(0.5, 0.5, 0.25)).toBe(0.5);
  });
});

describe("laneCatch catch test", () => {
  const mid = laneCenter(1);
  const bandMid = (CATCH_BAND_TOP + CATCH_BAND_BOTTOM) / 2;

  it("catches when the animal is in the lane and the item is in the band", () => {
    expect(isCaught(mid, bandMid, mid)).toBe(true);
  });

  it("ignores items above and below the catch band", () => {
    expect(isCaught(mid, CATCH_BAND_TOP - 0.05, mid)).toBe(false);
    expect(isCaught(mid, CATCH_BAND_BOTTOM + 0.05, mid)).toBe(false);
  });

  it("is generous — mid-walk still counts, but a whole lane away does not", () => {
    expect(isCaught(mid, bandMid, mid - CATCH_TOLERANCE)).toBe(true);
    // Half a lane is 1/6 ≈ 0.167, comfortably inside the tolerance.
    expect(CATCH_TOLERANCE).toBeGreaterThan(0.5 / LANE_COUNT);
    expect(isCaught(mid, bandMid, laneCenter(0))).toBe(false);
    expect(isCaught(mid, bandMid, laneCenter(2))).toBe(false);
  });
});

describe("laneCatch spawn rules", () => {
  const pool = ["🍖", "🥩"];
  const avoid = ["🥾", "🪨"];

  it("eases the child in — the opening drops are always food", () => {
    for (let dropIndex = 0; dropIndex < EASE_IN_DROPS; dropIndex++) {
      const spawn = pickSpawn({
        dropIndex,
        prevKind: null,
        prevLane: null,
        pool,
        avoid,
        // A roll of 0 would pick "bad" if bad were allowed at all.
        rand: seq([0]),
      });
      expect(spawn.kind).toBe("good");
    }
  });

  it("drops inedible objects once the ease-in is over", () => {
    const spawn = pickSpawn({
      dropIndex: EASE_IN_DROPS,
      prevKind: "good",
      prevLane: null,
      pool,
      avoid,
      rand: seq([0]),
    });
    expect(spawn.kind).toBe("bad");
    expect(avoid).toContain(spawn.emoji);
  });

  it("never drops two inedible objects in a row", () => {
    const spawn = pickSpawn({
      dropIndex: 9,
      prevKind: "bad",
      prevLane: null,
      pool,
      avoid,
      rand: seq([0]),
    });
    expect(spawn.kind).toBe("good");
    expect(pool).toContain(spawn.emoji);
  });

  it("stays edible above the bad-item chance, and when the skin has no avoid list", () => {
    const roll = BAD_CHANCE + 0.01;
    expect(
      pickSpawn({ dropIndex: 9, prevKind: "good", prevLane: null, pool, avoid, rand: seq([roll]) })
        .kind
    ).toBe("good");
    expect(
      pickSpawn({ dropIndex: 9, prevKind: "good", prevLane: null, pool, avoid: [], rand: seq([0]) })
        .kind
    ).toBe("good");
  });

  it("never repeats the previous lane, so there is always somewhere to walk", () => {
    for (let prevLane = 0; prevLane < LANE_COUNT; prevLane++) {
      for (const laneRoll of [0, 0.5, 0.99]) {
        const spawn = pickSpawn({
          dropIndex: 0,
          prevKind: null,
          prevLane,
          pool,
          avoid,
          rand: seq([0.9, 0, laneRoll]),
        });
        expect(spawn.lane).not.toBe(prevLane);
        expect(spawn.lane).toBeGreaterThanOrEqual(0);
        expect(spawn.lane).toBeLessThan(LANE_COUNT);
      }
    }
  });

  it("only ever emits real lanes and emoji from the skin", () => {
    for (let i = 0; i < 60; i++) {
      const spawn = pickSpawn({ dropIndex: i, prevKind: null, prevLane: null, pool, avoid });
      expect(spawn.lane).toBeGreaterThanOrEqual(0);
      expect(spawn.lane).toBeLessThan(LANE_COUNT);
      expect(spawn.kind === "bad" ? avoid : pool).toContain(spawn.emoji);
    }
  });
});

describe("laneCatchEngine", () => {
  it("starts from the skin: good pool, avoid list, and target count", () => {
    const session = startSession();
    const st = session.state as LaneCatchState;
    expect(session.engineId).toBe("laneCatch");
    expect(session.complete).toBe(false);
    expect(st.score).toBe(0);
    expect(st.needed).toBe(skin.targetCount);
    expect(st.pool).toEqual(skin.items);
    expect(st.avoid).toEqual(skin.avoidItems);
    expect(st.lanes).toBe(LANE_COUNT);
  });

  it("catching an inedible object never costs score or ends the round", () => {
    let session = startSession();
    session = laneCatchEngine.applyInput(session, {
      type: "action",
      action: "catch",
      quality: "good",
      targetId: "🍖",
    });
    expect((session.state as LaneCatchState).score).toBe(1);

    for (let i = 0; i < 10; i++) {
      session = laneCatchEngine.applyInput(session, {
        type: "action",
        action: "catch",
        quality: "miss",
        targetId: "🥾",
      });
    }
    expect((session.state as LaneCatchState).score).toBe(1);
    expect(session.progress).toBeGreaterThan(0);
    expect(session.complete).toBe(false);
  });

  it("a missed snack costs nothing either", () => {
    let session = startSession();
    session = laneCatchEngine.applyInput(session, {
      type: "action",
      action: "catch",
      quality: "miss",
      targetId: "🍖",
    });
    expect((session.state as LaneCatchState).score).toBe(0);
    expect(session.progress).toBe(0);
    expect(session.complete).toBe(false);
  });

  it("ignores other engines' actions", () => {
    const session = startSession();
    const after = laneCatchEngine.applyInput(session, {
      type: "action",
      action: "slice",
      quality: "good",
    });
    expect(after).toBe(session);
  });

  it("wins after targetCount good catches and then stops changing", () => {
    let session = startSession();
    const needed = (session.state as LaneCatchState).needed;
    for (let i = 0; i < needed; i++) {
      expect(session.complete).toBe(false);
      session = laneCatchEngine.applyInput(session, {
        type: "action",
        action: "catch",
        quality: "good",
        targetId: "🍖",
      });
    }
    expect(laneCatchEngine.isComplete(session)).toBe(true);
    expect(session.progress).toBe(1);

    const after = laneCatchEngine.applyInput(session, {
      type: "action",
      action: "catch",
      quality: "good",
      targetId: "🍖",
    });
    expect(after).toBe(session);
    expect((after.state as LaneCatchState).score).toBe(needed);
  });
});
