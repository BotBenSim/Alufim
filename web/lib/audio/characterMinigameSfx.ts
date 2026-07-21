export type MinigameSfx =
  | "miss"
  | "jump"
  | "land"
  | "slice"
  | "bonk"
  | "pop"
  | "fanfare";

export type ToneNote = {
  freq: number;
  t0: number;
  dur: number;
  type: OscillatorType;
  vol: number;
};

type Voice = {
  /** Pitch center for jumps / hops */
  jump: number;
  land: number;
  slice: number;
  bonk: number;
  pop: number;
  jumpWave: OscillatorType;
  sliceWave: OscillatorType;
};

/** Per-animal timbre — same action, different creature voice. */
const VOICE: Record<string, Voice> = {
  lion: {
    jump: 240,
    land: 200,
    slice: 320,
    bonk: 140,
    pop: 380,
    jumpWave: "square",
    sliceWave: "sawtooth",
  },
  rabbit: {
    jump: 560,
    land: 480,
    slice: 720,
    bonk: 220,
    pop: 840,
    jumpWave: "triangle",
    sliceWave: "triangle",
  },
  dragon: {
    jump: 180,
    land: 160,
    slice: 260,
    bonk: 110,
    pop: 300,
    jumpWave: "sawtooth",
    sliceWave: "sawtooth",
  },
  shark: {
    jump: 300,
    land: 260,
    slice: 400,
    bonk: 160,
    pop: 520,
    jumpWave: "sine",
    sliceWave: "sine",
  },
  turtle: {
    jump: 340,
    land: 280,
    slice: 360,
    bonk: 150,
    pop: 440,
    jumpWave: "sine",
    sliceWave: "triangle",
  },
};

const FALLBACK: Voice = VOICE.lion;

function voice(characterId: string): Voice {
  return VOICE[characterId] ?? FALLBACK;
}

/** Tone recipe for a minigame SFX in that animal's voice. */
export function characterMinigameNotes(
  characterId: string,
  sfx: MinigameSfx
): ToneNote[] {
  const v = voice(characterId);

  switch (sfx) {
    case "jump":
      return [
        { freq: v.jump, t0: 0, dur: 0.07, type: v.jumpWave, vol: 0.15 },
        { freq: v.jump * 1.5, t0: 0.05, dur: 0.12, type: "triangle", vol: 0.16 },
      ];
    case "land":
      // Bright rising ding — “nice jump / clean landing”
      return [
        { freq: v.land * 1.25, t0: 0, dur: 0.08, type: "triangle", vol: 0.18 },
        { freq: v.land * 1.85, t0: 0.06, dur: 0.1, type: "triangle", vol: 0.2 },
        { freq: v.land * 2.45, t0: 0.14, dur: 0.18, type: "sine", vol: 0.18 },
      ];
    case "slice":
      // Sharp successful cut — bright descending slash (clearly “hit”)
      return [
        { freq: v.slice * 2.1, t0: 0, dur: 0.04, type: v.sliceWave, vol: 0.16 },
        { freq: v.slice * 1.45, t0: 0.03, dur: 0.07, type: v.sliceWave, vol: 0.15 },
        { freq: v.slice * 0.95, t0: 0.08, dur: 0.1, type: "triangle", vol: 0.12 },
        { freq: v.slice * 1.7, t0: 0.05, dur: 0.06, type: "sine", vol: 0.08 },
      ];
    case "bonk":
      return [
        { freq: v.bonk, t0: 0, dur: 0.12, type: "square", vol: 0.16 },
        { freq: v.bonk * 0.7, t0: 0.1, dur: 0.16, type: "sine", vol: 0.13 },
      ];
    case "pop":
      return [
        { freq: v.pop, t0: 0, dur: 0.07, type: "triangle", vol: 0.16 },
        { freq: v.pop * 1.35, t0: 0.05, dur: 0.1, type: "sine", vol: 0.13 },
      ];
    case "miss":
      // Clear descending “nope” — must stay audible next to speech
      return [
        { freq: v.bonk * 2.4, t0: 0, dur: 0.1, type: "square", vol: 0.18 },
        { freq: v.bonk * 1.5, t0: 0.08, dur: 0.12, type: "triangle", vol: 0.16 },
        { freq: v.bonk * 0.85, t0: 0.18, dur: 0.22, type: "sine", vol: 0.17 },
      ];
    case "fanfare":
      return [
        { freq: v.jump * 1.5, t0: 0, dur: 0.18, type: "triangle", vol: 0.18 },
        { freq: v.jump * 1.9, t0: 0.12, dur: 0.18, type: "triangle", vol: 0.18 },
        { freq: v.jump * 2.3, t0: 0.24, dur: 0.18, type: "triangle", vol: 0.18 },
        { freq: v.jump * 3.0, t0: 0.36, dur: 0.4, type: "sine", vol: 0.2 },
      ];
    default:
      return [];
  }
}
