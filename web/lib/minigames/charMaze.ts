import type { MinigameEngine, MinigameSession } from "./types";

export type MazeDir = "up" | "down" | "left" | "right";

/** 0 = path, 1 = wall */
export type MazeGrid = readonly (readonly number[])[];

export type CharMazeState = {
  score: number;
  needed: number;
  /** Exit marker emoji (skin.items[0]) */
  exitEmoji: string;
  lastQuality: "good" | "miss" | null;
};

export type MazeLayout = {
  grid: MazeGrid;
  start: [number, number];
  exit: [number, number];
};

/** Compact preschool mazes — start → exit, always solvable. */
const LAYOUTS: MazeLayout[] = [
  {
    grid: [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ],
    start: [1, 1],
    exit: [3, 3],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1],
    ],
    start: [1, 1],
    exit: [4, 4],
  },
  {
    grid: [
      [1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 1, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1],
    ],
    start: [1, 1],
    exit: [5, 4],
  },
];

const DELTA: Record<MazeDir, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

function asState(session: MinigameSession): CharMazeState {
  return session.state as CharMazeState;
}

export function pickLayout(wave: number): MazeLayout {
  return LAYOUTS[wave % LAYOUTS.length]!;
}

export function canStep(grid: MazeGrid, r: number, c: number): boolean {
  const row = grid[r];
  if (!row) return false;
  return row[c] === 0;
}

export function neighbor(r: number, c: number, dir: MazeDir): [number, number] {
  const [dr, dc] = DELTA[dir];
  return [r + dr, c + dc];
}

export function swipeToDir(dx: number, dy: number, min = 16): MazeDir | null {
  if (Math.hypot(dx, dy) < min) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

/** One orthogonal step toward a tapped cell, or null if not adjacent. */
export function dirToAdjacent(
  fromR: number,
  fromC: number,
  toR: number,
  toC: number
): MazeDir | null {
  const dr = toR - fromR;
  const dc = toC - fromC;
  if (Math.abs(dr) + Math.abs(dc) !== 1) return null;
  if (dr === -1) return "up";
  if (dr === 1) return "down";
  if (dc === -1) return "left";
  if (dc === 1) return "right";
  return null;
}

export const charMazeEngine: MinigameEngine = {
  id: "charMaze",
  start(ctx) {
    const needed = ctx.skin.targetCount ?? 3;
    const exitEmoji = ctx.skin.items[0] ?? "⭐";
    return {
      engineId: "charMaze",
      skinId: ctx.skin.id,
      promptHe: ctx.skin.promptHe,
      state: {
        score: 0,
        needed,
        exitEmoji,
        lastQuality: null,
      } satisfies CharMazeState,
      progress: 0,
      complete: false,
    };
  },
  applyInput(session, input) {
    if (session.complete) return session;
    if (input.type !== "action" || input.action !== "step") return session;
    const st = asState(session);
    if (input.quality === "miss") {
      return {
        ...session,
        state: { ...st, lastQuality: "miss" },
      };
    }
    const score = st.score + 1;
    const complete = score >= st.needed;
    return {
      ...session,
      state: { ...st, score, lastQuality: "good" },
      progress: Math.min(1, score / st.needed),
      complete,
    };
  },
  isComplete(session) {
    return session.complete;
  },
};
