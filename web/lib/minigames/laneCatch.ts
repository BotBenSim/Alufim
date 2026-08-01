import type { MinigameEngine, MinigameSession } from "./types";

export type LaneCatchKind = "good" | "bad";

export type LaneCatchState = {
  score: number;
  needed: number;
  /** Edible items — catching one scores. */
  pool: string[];
  /** Obviously inedible objects — catching one is a shrug, never a penalty. */
  avoid: string[];
  lanes: number;
};

/** Three lanes: far enough to be a real choice, near enough to walk in time. */
export const LANE_COUNT = 3;
/** Seconds for an item to fall the full height of the stage. */
export const FALL_SECONDS = 2.6;
/** A faint shadow marks the lane this long before the item appears. */
export const TELEGRAPH_SECONDS = 0.55;
/** Normalized x per second — fast enough to cross, slow enough to read as walking. */
export const WALK_SPEED = 0.9;
/** Vertical band (normalized y) in which a catch can register. */
export const CATCH_BAND_TOP = 0.7;
export const CATCH_BAND_BOTTOM = 0.98;
/** Horizontal slack, wider than half a lane so "nearly there" still counts. */
export const CATCH_TOLERANCE = 0.22;
/** Opening drops are always food, so the rule is learned before it is tested. */
export const EASE_IN_DROPS = 2;
/** Share of later drops that are inedible. */
export const BAD_CHANCE = 1 / 3;

export function clampLane(lane: number, laneCount = LANE_COUNT): number {
  return Math.max(0, Math.min(laneCount - 1, Math.round(lane)));
}

export function laneCenter(lane: number, laneCount = LANE_COUNT): number {
  return (clampLane(lane, laneCount) + 0.5) / laneCount;
}

/** Which lane a pointer at normalized x belongs to; off-stage x clamps to an edge lane. */
export function laneFromX(x: number, laneCount = LANE_COUNT): number {
  return clampLane(Math.floor(x * laneCount), laneCount);
}

/** One keyboard step sideways; walls off at the edge lanes instead of wrapping. */
export function stepLane(lane: number, dir: -1 | 1, laneCount = LANE_COUNT): number {
  return clampLane(lane + dir, laneCount);
}

/** Ease a position toward a target by at most `maxStep`. */
export function moveToward(current: number, target: number, maxStep: number): number {
  const delta = target - current;
  if (Math.abs(delta) <= maxStep) return target;
  return current + Math.sign(delta) * maxStep;
}

export function isCaught(
  itemX: number,
  itemY: number,
  animalX: number,
  tolerance = CATCH_TOLERANCE
): boolean {
  if (itemY < CATCH_BAND_TOP || itemY > CATCH_BAND_BOTTOM) return false;
  return Math.abs(itemX - animalX) <= tolerance;
}

export type LaneSpawn = { lane: number; kind: LaneCatchKind; emoji: string };

export type SpawnOptions = {
  /** 0-based index of this drop within the round. */
  dropIndex: number;
  prevKind: LaneCatchKind | null;
  prevLane: number | null;
  pool: string[];
  avoid?: string[];
  laneCount?: number;
  rand?: () => number;
};

function pickIndex(length: number, roll: number): number {
  return Math.min(length - 1, Math.max(0, Math.floor(roll * length)));
}

/**
 * Decides the next drop. Consumes exactly three rolls (kind, emoji, lane) so a
 * seeded sequence stays predictable.
 */
export function pickSpawn(opts: SpawnOptions): LaneSpawn {
  const {
    dropIndex,
    prevKind,
    prevLane,
    pool,
    avoid = [],
    laneCount = LANE_COUNT,
    rand = Math.random,
  } = opts;

  const kindRoll = rand();
  const emojiRoll = rand();
  const laneRoll = rand();

  const badAllowed =
    avoid.length > 0 && dropIndex >= EASE_IN_DROPS && prevKind !== "bad";
  const kind: LaneCatchKind = badAllowed && kindRoll < BAD_CHANCE ? "bad" : "good";

  const source = kind === "bad" ? avoid : pool.length ? pool : ["🍎"];
  const emoji = source[pickIndex(source.length, emojiRoll)] ?? "🍎";

  // Never drop twice into the same lane — there is always somewhere to walk.
  const options: number[] = [];
  for (let i = 0; i < laneCount; i++) {
    if (i !== prevLane) options.push(i);
  }
  const lane = options[pickIndex(options.length, laneRoll)] ?? 0;

  return { lane, kind, emoji };
}

function asState(session: MinigameSession): LaneCatchState {
  return session.state as LaneCatchState;
}

export const laneCatchEngine: MinigameEngine = {
  id: "laneCatch",
  start(ctx) {
    const needed = ctx.skin.targetCount ?? 5;
    const pool = ctx.skin.items.length ? ctx.skin.items : ["🍎"];
    return {
      engineId: "laneCatch",
      skinId: ctx.skin.id,
      promptHe: ctx.skin.promptHe,
      state: {
        score: 0,
        needed,
        pool,
        avoid: ctx.skin.avoidItems ?? [],
        lanes: LANE_COUNT,
      } satisfies LaneCatchState,
      progress: 0,
      complete: false,
    };
  },
  applyInput(session, input) {
    if (session.complete) return session;
    // A missed snack and a mouthful of shoe are the same to the score: nothing happens.
    if (input.action !== "catch" || input.quality === "miss") return session;
    const st = asState(session);
    const score = st.score + 1;
    const complete = score >= st.needed;
    return {
      ...session,
      state: { ...st, score },
      progress: Math.min(1, score / st.needed),
      complete,
    };
  },
  isComplete(session) {
    return session.complete;
  },
};
