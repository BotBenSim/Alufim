import { describe, expect, it, vi } from "vitest";
import {
  A4_HZ,
  CHORD_MS,
  MELODY_GAP_MS,
  MELODY_NOTE_MS,
  SOLFA_STEPS,
  chordPlan,
  maxSimultaneous,
  melodyPlan,
  musicAudioContext,
  planDurationMs,
  playNotes,
  playQuestionTones,
  solfaFreq,
  transpose,
  triadFreqs,
  type Solfa,
} from "./musicTones";

const SEMI = Math.pow(2, 1 / 12);
const ALL_SOLFA: Solfa[] = ["do", "re", "mi", "fa", "sol", "la", "ti"];

/** Records what would have been scheduled, without a real WebAudio stack. */
function fakeAudioContext(currentTime = 5) {
  const notes: { freq: number; start: number; stop: number }[] = [];
  const gains: number[] = [];
  const ctx = {
    currentTime,
    state: "running",
    destination: {},
    createOscillator() {
      const rec = { freq: 0, start: -1, stop: -1 };
      notes.push(rec);
      return {
        type: "sine",
        frequency: {
          get value() {
            return rec.freq;
          },
          set value(v: number) {
            rec.freq = v;
          },
        },
        connect() {},
        disconnect() {},
        start(t: number) {
          rec.start = t;
        },
        stop(t: number) {
          rec.stop = t;
        },
        onended: null,
      };
    },
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime(v: number) {
            gains.push(v);
          },
        },
        connect() {},
        disconnect() {},
      };
    },
  };
  return { ctx: ctx as unknown as AudioContext, notes, gains };
}

describe("equal temperament maths", () => {
  it("an octave is exactly double, and down an octave exactly half", () => {
    expect(transpose(A4_HZ, 12)).toBe(880);
    expect(transpose(A4_HZ, -12)).toBe(220);
    expect(transpose(A4_HZ, 24)).toBe(1760);
  });

  it("one semitone is the twelfth root of two", () => {
    expect(transpose(A4_HZ, 1) / A4_HZ).toBeCloseTo(SEMI, 10);
    expect(transpose(A4_HZ, 0)).toBe(A4_HZ);
  });

  it("do is the tonic and every degree sits at its scale step", () => {
    const tonic = transpose(A4_HZ, -9); // C4
    expect(solfaFreq(tonic, "do")).toBeCloseTo(tonic, 6);
    for (const s of ALL_SOLFA) {
      expect(solfaFreq(tonic, s)).toBeCloseTo(tonic * Math.pow(SEMI, SOLFA_STEPS[s]), 6);
    }
    // Movable do: the same degree in another key keeps the same ratio.
    const g = transpose(A4_HZ, -2);
    expect(solfaFreq(g, "sol") / g).toBeCloseTo(solfaFreq(tonic, "sol") / tonic, 10);
  });

  it("the octave parameter shifts a degree by a factor of two", () => {
    const tonic = 261.6;
    expect(solfaFreq(tonic, "mi", 1)).toBeCloseTo(solfaFreq(tonic, "mi") * 2, 6);
    expect(solfaFreq(tonic, "mi", -1)).toBeCloseTo(solfaFreq(tonic, "mi") / 2, 6);
  });
});

describe("triads as movable shapes", () => {
  it("a major triad is 4 then 3 semitones", () => {
    const t = triadFreqs(220, "major");
    expect(t).toHaveLength(3);
    expect(t[0]).toBe(220);
    expect(t[1] / t[0]).toBeCloseTo(Math.pow(SEMI, 4), 10);
    expect(t[2] / t[0]).toBeCloseTo(Math.pow(SEMI, 7), 10);
    expect(t[2] / t[1]).toBeCloseTo(Math.pow(SEMI, 3), 10);
  });

  it("a minor triad is 3 then 4 semitones — same fifth, lower middle", () => {
    const t = triadFreqs(220, "minor");
    expect(t[1] / t[0]).toBeCloseTo(Math.pow(SEMI, 3), 10);
    expect(t[2] / t[0]).toBeCloseTo(Math.pow(SEMI, 7), 10);
    expect(t[1]).toBeLessThan(triadFreqs(220, "major")[1]);
    expect(t[2]).toBeCloseTo(triadFreqs(220, "major")[2], 10);
  });

  it("the shape slides to any root", () => {
    for (const root of [174.6, 220, 261.6, 392]) {
      const t = triadFreqs(root, "major");
      expect(t[1] / t[0]).toBeCloseTo(Math.pow(SEMI, 4), 10);
    }
  });
});

describe("plans", () => {
  it("a melody is one note after another with no overlap", () => {
    const plan = melodyPlan([440, 494, 523]);
    expect(plan.map((n) => n.freq)).toEqual([440, 494, 523]);
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].startMs).toBeGreaterThanOrEqual(plan[i - 1].startMs + plan[i - 1].durMs);
    }
    expect(plan[1].startMs).toBe(MELODY_NOTE_MS + MELODY_GAP_MS);
    expect(maxSimultaneous(plan)).toBe(1);
    expect(planDurationMs(plan)).toBe(2 * (MELODY_NOTE_MS + MELODY_GAP_MS) + MELODY_NOTE_MS);
  });

  it("a melody can start after an offset", () => {
    expect(melodyPlan([440], { startMs: 900 })[0].startMs).toBe(900);
    expect(melodyPlan([], { startMs: 900 })).toEqual([]);
  });

  it("a chord sounds all at once", () => {
    const plan = chordPlan(triadFreqs(261.6, "minor"));
    expect(plan).toHaveLength(3);
    expect(new Set(plan.map((n) => n.startMs)).size).toBe(1);
    expect(maxSimultaneous(plan)).toBe(3);
    expect(planDurationMs(plan)).toBe(CHORD_MS);
  });
});

describe("playNotes", () => {
  it("schedules one oscillator per note at the right time", () => {
    const { ctx, notes } = fakeAudioContext(5);
    playNotes(melodyPlan([440, 880]), { ctx });
    expect(notes).toHaveLength(2);
    expect(notes.map((n) => n.freq)).toEqual([440, 880]);
    expect(notes[0].start).toBeCloseTo(5, 6);
    expect(notes[1].start).toBeCloseTo(5 + (MELODY_NOTE_MS + MELODY_GAP_MS) / 1000, 6);
    for (const n of notes) expect(n.stop).toBeGreaterThan(n.start);
  });

  it("delays the whole plan so speech can finish first", () => {
    const { ctx, notes } = fakeAudioContext(0);
    playNotes(melodyPlan([440]), { ctx, delayMs: 1400 });
    expect(notes[0].start).toBeCloseTo(1.4, 6);
  });

  it("keeps a chord quieter per note than a single tone", () => {
    const single = fakeAudioContext();
    playNotes(melodyPlan([440]), { ctx: single.ctx });
    const chord = fakeAudioContext();
    playNotes(chordPlan(triadFreqs(220, "major")), { ctx: chord.ctx });
    expect(Math.max(...chord.gains)).toBeLessThan(Math.max(...single.gains));
  });

  it("skips nonsense frequencies and empty plans", () => {
    const { ctx, notes } = fakeAudioContext();
    playNotes([{ freq: 0, startMs: 0, durMs: 100 }], { ctx });
    playNotes([{ freq: Number.NaN, startMs: 0, durMs: 100 }], { ctx });
    playNotes([], { ctx });
    expect(notes).toHaveLength(0);
  });

  it("plays only what a question carries, and ignores anything else", () => {
    const { ctx, notes } = fakeAudioContext();
    playQuestionTones({ play: chordPlan([440, 550]) }, ctx);
    expect(notes).toHaveLength(2);
    playQuestionTones({ op: "add", a: 1, b: 2 }, ctx);
    playQuestionTones(null, ctx);
    playQuestionTones(undefined, ctx);
    expect(notes).toHaveLength(2);
  });
});

describe("headless safety", () => {
  it("never constructs an AudioContext on import", async () => {
    const ctor = vi.fn(() => {
      throw new Error("AudioContext must not be constructed at import time");
    });
    vi.stubGlobal("AudioContext", ctor);
    vi.resetModules();
    const mod = await import("./musicTones");
    expect(typeof mod.playNotes).toBe("function");
    expect(ctor).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("is a no-op with no WebAudio at all", () => {
    expect(typeof window).toBe("undefined");
    expect(musicAudioContext()).toBeNull();
    expect(() => playNotes(melodyPlan([440, 880]))).not.toThrow();
    expect(() => playQuestionTones({ play: melodyPlan([440]) })).not.toThrow();
  });
});
