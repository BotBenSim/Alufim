import type { MinigameEngine, MinigameSession } from "./types";

export type CutRopeState = {
  score: number;
  needed: number;
  pool: string[];
};

export type Vec = { x: number; y: number };

/** Preschool layouts: pegs + rope length. Candy swings as a pendulum. */
export type RopeLayout = {
  pegs: Vec[];
  /** Rope length (normalized) */
  hang: number;
  /** Catch zone center (character mouth) */
  mouth: Vec;
  mouthR: number;
  /** Starting swing angle (rad); 0 = straight down, + = right */
  startAngle: number;
  /** Starting angular velocity */
  startOmega: number;
};

const LAYOUTS: RopeLayout[] = [
  // Peg left — swings across the mouth
  {
    pegs: [{ x: 0.28, y: 0.1 }],
    hang: 0.38,
    mouth: { x: 0.55, y: 0.78 },
    mouthR: 0.17,
    startAngle: -0.85,
    startOmega: 1.4,
  },
  // Peg right — swings the other way
  {
    pegs: [{ x: 0.72, y: 0.1 }],
    hang: 0.38,
    mouth: { x: 0.45, y: 0.78 },
    mouthR: 0.17,
    startAngle: 0.85,
    startOmega: -1.4,
  },
  // Two ropes — pivot between pegs, then cut one to change the swing
  {
    pegs: [
      { x: 0.3, y: 0.08 },
      { x: 0.7, y: 0.08 },
    ],
    hang: 0.36,
    mouth: { x: 0.5, y: 0.78 },
    mouthR: 0.18,
    startAngle: -0.7,
    startOmega: 1.6,
  },
  // Higher / longer swing
  {
    pegs: [{ x: 0.35, y: 0.06 }],
    hang: 0.42,
    mouth: { x: 0.58, y: 0.8 },
    mouthR: 0.18,
    startAngle: -0.95,
    startOmega: 1.7,
  },
];

/** Gravity for pendulum (normalized space). */
export const PENDULUM_G = 2.8;
export const PENDULUM_DAMP = 0.08;

function asState(session: MinigameSession): CutRopeState {
  return session.state as CutRopeState;
}

export function pickRopeLayout(wave: number): RopeLayout {
  return LAYOUTS[wave % LAYOUTS.length]!;
}

/** Pivot for remaining pegs — single peg, or midpoint of two. */
export function swingPivot(pegs: Vec[]): Vec {
  if (pegs.length === 0) return { x: 0.5, y: 0.1 };
  if (pegs.length === 1) return pegs[0]!;
  return {
    x: pegs.reduce((s, p) => s + p.x, 0) / pegs.length,
    y: pegs.reduce((s, p) => s + p.y, 0) / pegs.length,
  };
}

/** θ = 0 hangs straight down; +θ swings to the right. */
export function candyFromAngle(pivot: Vec, length: number, angle: number): Vec {
  return {
    x: pivot.x + length * Math.sin(angle),
    y: pivot.y + length * Math.cos(angle),
  };
}

/** Tangential release velocity when the last rope is cut. */
export function releaseVelocity(pivot: Vec, length: number, angle: number, omega: number): Vec {
  return {
    x: length * omega * Math.cos(angle),
    y: -length * omega * Math.sin(angle),
  };
}

/**
 * Step a simple pendulum. Returns new angle + omega.
 * Soft angle clamp keeps preschool swings readable.
 */
export function stepPendulum(
  angle: number,
  omega: number,
  length: number,
  dt: number,
  g = PENDULUM_G,
  damp = PENDULUM_DAMP
): { angle: number; omega: number } {
  const L = Math.max(0.12, length);
  let w = omega;
  let a = angle;
  // Sub-steps for stability
  const steps = Math.max(1, Math.ceil(dt / 0.01));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    const alpha = -(g / L) * Math.sin(a) - damp * w;
    w += alpha * h;
    a += w * h;
  }
  // Soft clamp so it doesn't flip over the peg
  const maxA = 1.25;
  if (a > maxA) {
    a = maxA;
    w = Math.min(0, w);
  } else if (a < -maxA) {
    a = -maxA;
    w = Math.max(0, w);
  }
  return { angle: a, omega: w };
}

/** Re-express current candy as angle around a new pivot (after cutting a rope). */
export function angleAboutPivot(pivot: Vec, candy: Vec): number {
  return Math.atan2(candy.x - pivot.x, candy.y - pivot.y);
}

export function hitsMouth(p: Vec, mouth: Vec, mouthR: number): boolean {
  return Math.hypot(p.x - mouth.x, p.y - mouth.y) <= mouthR;
}

/** Distance from point to segment; used for swipe-cut padding. */
export function distPointToSeg(p: Vec, a: Vec, b: Vec): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;
  const ab2 = abx * abx + aby * aby || 1;
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2));
  const cx = a.x + abx * t;
  const cy = a.y + aby * t;
  return Math.hypot(p.x - cx, p.y - cy);
}

/** True if swipe segment comes within pad of rope segment (normalized space). */
export function swipeCutsRope(
  s0: Vec,
  s1: Vec,
  ropeA: Vec,
  ropeB: Vec,
  pad = 0.045
): boolean {
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const p = {
      x: s0.x + (s1.x - s0.x) * t,
      y: s0.y + (s1.y - s0.y) * t,
    };
    if (distPointToSeg(p, ropeA, ropeB) <= pad) return true;
  }
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const p = {
      x: ropeA.x + (ropeB.x - ropeA.x) * t,
      y: ropeA.y + (ropeB.y - ropeA.y) * t,
    };
    if (distPointToSeg(p, s0, s1) <= pad) return true;
  }
  return false;
}

export const cutRopeEngine: MinigameEngine = {
  id: "cutRope",
  start(ctx) {
    const needed = ctx.skin.targetCount ?? 4;
    const pool = ctx.skin.items.length ? ctx.skin.items : ["🍬"];
    return {
      engineId: "cutRope",
      skinId: ctx.skin.id,
      promptHe: ctx.skin.promptHe,
      state: {
        score: 0,
        needed,
        pool,
      } satisfies CutRopeState,
      progress: 0,
      complete: false,
    };
  },
  applyInput(session, input) {
    if (session.complete) return session;
    if (input.action !== "cut" || input.quality === "miss") return session;
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
