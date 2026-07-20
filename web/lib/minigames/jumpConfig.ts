import type { MinigameEngineId, MinigameSkin } from "./types";

/** Shared jump / hop feel — tuned per engine (and optionally per skin). */
export type JumpPlayConfig = {
  /** 1 = single jump only; 2 = allow mid-air double jump */
  maxJumps: number;
  jumpVelocity: number;
  doubleJumpVelocity: number;
  gravity: number;
  speedMin: number;
  speedMax: number;
  /** 0..1 chance a gap/obstacle uses the hard variant */
  hardChance: number;
  hitStunMs: number;
  /** Easy gap width range (roof runners) */
  gapEasy: readonly [number, number];
  /** Wide gap — usually needs double jump */
  gapWide: readonly [number, number];
  roofWidth: readonly [number, number];
  /** Obstacle spawn distance when “close rush” */
  spawnNear: readonly [number, number];
  /** Obstacle spawn distance when “long wait” */
  spawnFar: readonly [number, number];
  /** Extra-long breather spawn (empty runway feel) */
  spawnBreather: readonly [number, number];
  /** 0..1 chance of a close rush spawn */
  closeChance: number;
  /** 0..1 chance of a long breather (after closeChance fails) */
  breatherChance: number;
  /** Hold before next obstacle appears [ms min, max] */
  spawnHoldMs: readonly [number, number];
  /** How fast world pace oscillates (higher = choppier). 0 = steady scroll. */
  paceDriftRate: number;
  /** Height (px up) to clear a short obstacle */
  clearYShort: number;
  /** Height (px up) to clear a tall obstacle — typically needs double jump */
  clearYTall: number;
  runnerX: number;
  hitHalf: number;
  roofTop: number;
  artSize: number;
  groundH: number;
};

const BASE: JumpPlayConfig = {
  maxJumps: 2,
  jumpVelocity: -800,
  doubleJumpVelocity: -700,
  gravity: 2100,
  speedMin: 0.35,
  speedMax: 0.6,
  hardChance: 0.35,
  hitStunMs: 650,
  gapEasy: [0.12, 0.2],
  gapWide: [0.28, 0.4],
  roofWidth: [0.24, 0.5],
  spawnNear: [0.95, 1.15],
  spawnFar: [1.25, 1.65],
  spawnBreather: [1.85, 2.5],
  closeChance: 0.35,
  breatherChance: 0.25,
  spawnHoldMs: [0, 900],
  paceDriftRate: 1.1,
  clearYShort: 26,
  clearYTall: 52,
  runnerX: 0.18,
  hitHalf: 0.07,
  roofTop: 0.34,
  artSize: 84,
  groundH: 22,
};

/** Default jump feel per engine — only deltas from BASE. Skins may override via `skin.jump`. */
export const JUMP_CONFIG_BY_ENGINE: Partial<Record<MinigameEngineId, JumpPlayConfig>> = {
  pathDash: {
    ...BASE,
    jumpVelocity: -820,
    doubleJumpVelocity: -720,
    gravity: 2200,
    speedMin: 0.32,
    speedMax: 0.58,
    gapEasy: [0.11, 0.2],
    roofWidth: [0.22, 0.52],
    runnerX: 0.22,
    artSize: 78,
  },
  timingBounce: {
    ...BASE,
    jumpVelocity: -780,
    // Steady land scroll — rhythm from spawn gaps
    speedMin: 0.66,
    speedMax: 0.66,
    hardChance: 0.4,
    hitStunMs: 700,
    spawnNear: [0.75, 0.95],
    spawnFar: [1.25, 1.85],
    spawnBreather: [2.1, 3.1],
    closeChance: 0.42,
    breatherChance: 0.28,
    paceDriftRate: 0,
    runnerX: 0.14,
    artSize: 88,
  },
};

export function resolveJumpConfig(
  engineId: MinigameEngineId,
  skin?: Pick<MinigameSkin, "jump"> | null
): JumpPlayConfig {
  const base = JUMP_CONFIG_BY_ENGINE[engineId] ?? BASE;
  if (!skin?.jump) return base;
  return { ...base, ...skin.jump };
}

export function randRange(range: readonly [number, number]): number {
  return range[0] + Math.random() * (range[1] - range[0]);
}

export function pickGap(cfg: JumpPlayConfig, allowHard: boolean): number {
  if (allowHard && Math.random() < cfg.hardChance) {
    return randRange(cfg.gapWide);
  }
  return randRange(cfg.gapEasy);
}

/**
 * Scroll speed. When `paceDriftRate` is 0 (or speedMin≈speedMax), returns a steady pace.
 * Otherwise sine-drifts between min/max (used by pathDash).
 */
export function pacedSpeed(phase: number, cfg: JumpPlayConfig): number {
  if (cfg.paceDriftRate <= 0 || cfg.speedMax - cfg.speedMin < 0.01) {
    return (cfg.speedMin + cfg.speedMax) / 2;
  }
  const pulse = (Math.sin(phase) + 1) / 2;
  const wobble = 0.85 + 0.3 * Math.sin(phase * 2.7 + 1.3);
  const base = cfg.speedMin + pulse * (cfg.speedMax - cfg.speedMin);
  const speed = base * wobble;
  return Math.min(cfg.speedMax * 1.15, Math.max(cfg.speedMin * 0.85, speed));
}

/**
 * Start a jump / mid-air double jump.
 * Returns new velocity + jumpsUsed, or null if jump not allowed.
 */
export function tryBeginJump(
  cfg: JumpPlayConfig,
  opts: { grounded: boolean; jumping: boolean; jumpsUsed: number }
): { jumpsUsed: number; velocity: number } | null {
  const max = Math.max(1, Math.floor(cfg.maxJumps));
  let jumpsUsed = opts.jumpsUsed;
  if (opts.grounded) {
    jumpsUsed = 0;
  } else if (!opts.jumping || jumpsUsed >= max) {
    return null;
  }
  jumpsUsed += 1;
  const velocity = jumpsUsed === 1 ? cfg.jumpVelocity : cfg.doubleJumpVelocity;
  return { jumpsUsed, velocity };
}

export function spawnObstacleX(cfg: JumpPlayConfig): {
  x: number;
  tall: boolean;
  holdMs: number;
} {
  const roll = Math.random();
  let x: number;
  if (roll < cfg.closeChance) {
    x = randRange(cfg.spawnNear);
  } else if (roll < cfg.closeChance + cfg.breatherChance) {
    x = randRange(cfg.spawnBreather);
  } else {
    x = randRange(cfg.spawnFar);
  }
  return {
    x,
    tall: Math.random() < cfg.hardChance,
    holdMs: Math.random() < 0.6 ? randRange(cfg.spawnHoldMs) : 0,
  };
}
