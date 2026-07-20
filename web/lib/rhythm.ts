import type { BeatType, RhythmPreset } from "./types";

export const RHYTHM_PRESETS: Record<string, RhythmPreset> = {
  every2: { round: 8, feedTaps: 2, beats: [{ every: 2, type: "play" }] },
  every3: { round: 9, feedTaps: 3, beats: [{ every: 3, type: "play" }] },
  every4: { round: 12, feedTaps: 3, beats: [{ every: 4, type: "play" }] },
};

export const ACTIVE_RHYTHM = "every3";

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

export function resolveRhythm(): RhythmPreset {
  return RHYTHM_PRESETS[ACTIVE_RHYTHM] || RHYTHM_PRESETS.every3;
}
