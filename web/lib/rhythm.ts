import type { BeatType, RhythmPreset } from "./types";

/** Factory default: minigame every N learning steps. Copied onto profiles. */
export const DEFAULT_PLAY_EVERY_STEPS = 3;

export function clampPlayEverySteps(n: unknown): number {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return DEFAULT_PLAY_EVERY_STEPS;
  return Math.max(2, Math.min(20, v));
}

/** Build a rhythm preset from a numeric "every N steps" cadence. */
export function rhythmFromPlayEvery(playEverySteps: number): RhythmPreset {
  const every = clampPlayEverySteps(playEverySteps);
  return {
    round: every * 3,
    feedTaps: Math.min(3, every),
    beats: [{ every, type: "play" }],
  };
}

/** @deprecated Named presets kept for tests / reference — prefer rhythmFromPlayEvery. */
export const RHYTHM_PRESETS: Record<string, RhythmPreset> = {
  every2: rhythmFromPlayEvery(2),
  every3: rhythmFromPlayEvery(3),
  every4: rhythmFromPlayEvery(4),
};

export function buildBeat(preset: RhythmPreset, stepIndex: number): BeatType {
  let chosen: BeatType = "learn";
  let chosenEvery = 0;
  (preset.beats || []).forEach((b) => {
    if (stepIndex % b.every === 0 && b.every > chosenEvery) {
      chosen = b.type;
      chosenEvery = b.every;
    }
  });
  return chosen;
}

export function resolveRhythm(playEverySteps?: number): RhythmPreset {
  return rhythmFromPlayEvery(playEverySteps ?? DEFAULT_PLAY_EVERY_STEPS);
}
