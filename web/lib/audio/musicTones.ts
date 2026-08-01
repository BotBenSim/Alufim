/**
 * Note maths and playback for the music game.
 *
 * Everything is equal temperament from one seed pitch, so transposing to another
 * key is a parameter and never a new table — which is what makes movable do work
 * (knowledge/educational/sound-before-symbol.md).
 *
 * The maths at the top is pure. `playNotes` is the only browser-touching
 * function, and nothing here constructs an `AudioContext` at import time, so the
 * module is safe under SSR and in the Vitest node environment.
 */

export type Solfa = "do" | "re" | "mi" | "fa" | "sol" | "la" | "ti";
export type TriadQuality = "major" | "minor";

/** One scheduled note. Offsets are relative to the start of the sequence. */
export type PlayNote = { freq: number; startMs: number; durMs: number };

/** Concert A — the one seed pitch. Every other frequency is derived from it. */
export const A4_HZ = 440;
export const SEMITONES_PER_OCTAVE = 12;

/** Semitones above do. Movable: do is the tonic, whatever pitch that is. */
export const SOLFA_STEPS: Record<Solfa, number> = {
  do: 0,
  re: 2,
  mi: 4,
  fa: 5,
  sol: 7,
  la: 9,
  ti: 11,
};

/**
 * A triad is a shape in semitones, not a chord to memorise: two shapes times any
 * root covers every major and minor chord.
 */
export const TRIAD_SHAPE: Record<TriadQuality, readonly number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
};

/** Kid-paced phrase timing. Length is the difficulty knob, never speed. */
export const MELODY_NOTE_MS = 520;
export const MELODY_GAP_MS = 120;
/** Extra silence after a "this is do" anchor so it reads as a reference, not part of the phrase. */
export const ANCHOR_PAUSE_MS = 420;
export const CHORD_MS = 1200;
/** Time to leave for the spoken prompt before the notes start — the two take turns. */
export const MUSIC_LEAD_IN_MS = 1400;

const DEFAULT_VOL = 0.22;
const ATTACK_S = 0.018;
const RELEASE_PAD_S = 0.05;

export function transpose(freq: number, semitones: number): number {
  return freq * Math.pow(2, semitones / SEMITONES_PER_OCTAVE);
}

/** Frequency of a solfège degree in the key whose do is `tonicHz`. */
export function solfaFreq(tonicHz: number, solfa: Solfa, octave = 0): number {
  return transpose(tonicHz, SOLFA_STEPS[solfa] + octave * SEMITONES_PER_OCTAVE);
}

/** The movable shape, applied at `rootHz`. */
export function triadFreqs(rootHz: number, quality: TriadQuality): number[] {
  return TRIAD_SHAPE[quality].map((s) => transpose(rootHz, s));
}

/** One note after another. */
export function melodyPlan(
  freqs: readonly number[],
  opts: { noteMs?: number; gapMs?: number; startMs?: number } = {}
): PlayNote[] {
  const durMs = opts.noteMs ?? MELODY_NOTE_MS;
  const gapMs = opts.gapMs ?? MELODY_GAP_MS;
  const startMs = opts.startMs ?? 0;
  return freqs.map((freq, i) => ({ freq, startMs: startMs + i * (durMs + gapMs), durMs }));
}

/** All notes at once. */
export function chordPlan(
  freqs: readonly number[],
  opts: { durMs?: number; startMs?: number } = {}
): PlayNote[] {
  const durMs = opts.durMs ?? CHORD_MS;
  const startMs = opts.startMs ?? 0;
  return freqs.map((freq) => ({ freq, startMs, durMs }));
}

export function planDurationMs(notes: readonly PlayNote[]): number {
  return notes.reduce((end, n) => Math.max(end, n.startMs + n.durMs), 0);
}

/** How many notes ever sound together — used to keep a chord from clipping. */
export function maxSimultaneous(notes: readonly PlayNote[]): number {
  let most = 0;
  for (const a of notes) {
    let n = 0;
    for (const b of notes) {
      if (b.startMs <= a.startMs && a.startMs < b.startMs + b.durMs) n++;
    }
    most = Math.max(most, n);
  }
  return most;
}

type AudioCtor = new () => AudioContext;

function audioContextCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: AudioCtor;
    webkitAudioContext?: AudioCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

let shared: AudioContext | null = null;

/**
 * Lazily created on first playback, never at import. Callers that already own a
 * context (the `useAudio` hook) should pass theirs instead.
 */
export function musicAudioContext(): AudioContext | null {
  if (shared) return shared;
  const Ctor = audioContextCtor();
  if (!Ctor) return null;
  try {
    shared = new Ctor();
  } catch {
    shared = null;
  }
  return shared;
}

export type PlayOptions = {
  /** Prefer the host's context so notes share the unlocked iOS context. */
  ctx?: AudioContext | null;
  type?: OscillatorType;
  vol?: number;
  /** Wait this long before the first note (leave room for the spoken prompt). */
  delayMs?: number;
};

/** Play a plan. A no-op wherever WebAudio is missing — audio is never load-bearing. */
export function playNotes(notes: readonly PlayNote[], opts: PlayOptions = {}): void {
  if (notes.length === 0) return;
  const ctx = opts.ctx ?? musicAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});

  const type = opts.type ?? "triangle";
  const vol = (opts.vol ?? DEFAULT_VOL) / Math.sqrt(Math.max(1, maxSimultaneous(notes)));
  const base = ctx.currentTime + Math.max(0, opts.delayMs ?? 0) / 1000;

  for (const n of notes) {
    if (!Number.isFinite(n.freq) || n.freq <= 0) continue;
    const start = base + Math.max(0, n.startMs) / 1000;
    const dur = Math.max(ATTACK_S + 0.05, n.durMs / 1000);
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = n.freq;
      // linearRamp — exponentialRamp is easy to kill on short / soft notes
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(Math.max(0.0001, vol), start + ATTACK_S);
      g.gain.linearRampToValueAtTime(0.0001, start + dur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(start);
      o.stop(start + dur + RELEASE_PAD_S);
      o.onended = () => {
        try {
          o.disconnect();
          g.disconnect();
        } catch {
          /* already torn down */
        }
      };
    } catch {
      return;
    }
  }
}

/**
 * Play whatever a question wants heard. Reads the `play` plan a music question
 * carries and ignores every other question, so the host can call it blindly.
 */
export function playQuestionTones(
  q: unknown,
  ctx?: AudioContext | null,
  delayMs = 0
): void {
  const plan = (q as { play?: unknown } | null | undefined)?.play;
  if (!Array.isArray(plan)) return;
  playNotes(plan as PlayNote[], { ctx, delayMs });
}
