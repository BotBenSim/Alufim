import { describe, expect, it, vi } from "vitest";
import {
  DIATONIC_SOLFA,
  MUSIC_BANDS,
  MUSIC_CHORD_DEGREES,
  MUSIC_HAPPY,
  MUSIC_PHRASES,
  MUSIC_SAD,
  PENTATONIC_SOLFA,
  SOLFA_HE,
  SOLFA_KEY_GLYPH,
  type MusicBand,
} from "@/data/music";
import { defaultCurriculum } from "@/lib/difficulty";
import { musicProvider, type MusicQuestion } from "@/lib/providers/music";
import { A4_HZ, solfaFreq, transpose, triadFreqs, type Solfa } from "@/lib/audio/musicTones";
import type { DifficultyBand, ProviderContext } from "@/lib/types";

const SEMI = Math.pow(2, 1 / 12);

function ctx(band: MusicBand, overrides: Partial<ProviderContext> = {}): ProviderContext {
  const curriculum = defaultCurriculum("music");
  curriculum.bands.easy = [band as DifficultyBand];
  return {
    gameId: "music",
    level: "easy",
    step: 0,
    usedKeys: [],
    recent: [],
    countEmoji: "🦁",
    curriculum,
    ...overrides,
  };
}

function gen(band: MusicBand, overrides: Partial<ProviderContext> = {}): MusicQuestion {
  return musicProvider.generate(ctx(band, overrides)) as MusicQuestion;
}

function many(band: MusicBand, n = 60, overrides: Partial<ProviderContext> = {}) {
  return Array.from({ length: n }, () => gen(band, overrides));
}

/** Every rung, at both key-set sizes and every phrase length. */
const STAGE_BANDS: MusicBand[] = [
  { stage: 3, notes: 5, hint: true },
  { stage: 3, notes: 7 },
  { stage: 4, notes: 5, hint: true },
  { stage: 4, notes: 7 },
  { stage: 1, notes: 5, hint: true },
  { stage: 1, notes: 7 },
  { stage: 5, notes: 5, len: 2 },
  { stage: 5, notes: 5, len: 3, hint: true },
  { stage: 5, notes: 7, len: 4 },
  { stage: 2, notes: 5, hint: true },
  { stage: 2, notes: 7 },
];

describe("musicProvider — shape of every stage", () => {
  it("answers with exactly one of its own options", () => {
    for (const band of STAGE_BANDS) {
      for (const q of many(band, 40)) {
        expect(q.op).toBe("music");
        expect(q.stage).toBe(band.stage);
        expect(typeof q.answer).toBe("string");
        expect(q.options.every((o) => typeof o === "string" && o.length > 0)).toBe(true);
        expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
      }
    }
  });

  it("offers enough distinct options — two for the happy/sad rung, three elsewhere", () => {
    for (const band of STAGE_BANDS) {
      const least = band.stage === 1 ? 2 : 3;
      for (const q of many(band, 40)) {
        expect(new Set(q.options).size).toBe(q.options.length);
        expect(q.options.length).toBeGreaterThanOrEqual(least);
      }
    }
  });

  it("carries a playable plan — one scheduled note per tone, all audible", () => {
    for (const band of STAGE_BANDS) {
      for (const q of many(band, 20)) {
        expect(q.tones.length).toBeGreaterThan(0);
        expect(q.play).toHaveLength(q.tones.length);
        for (const f of q.tones) {
          expect(Number.isFinite(f)).toBe(true);
          expect(f).toBeGreaterThan(80);
          expect(f).toBeLessThan(2000);
        }
        for (const n of q.play) {
          expect(n.durMs).toBeGreaterThan(0);
          expect(n.startMs).toBeGreaterThanOrEqual(0);
        }
        expect(q.play.map((n) => n.freq)).toEqual(q.tones);
      }
    }
  });

  it("renders a Hebrew prompt and speaks Hebrew at every stage", () => {
    for (const band of STAGE_BANDS) {
      const q = gen(band);
      const r = musicProvider.render(q);
      expect(r.prompt.length).toBeGreaterThan(0);
      expect(r.options).toEqual(q.options);
      expect(r.variant).toBe(band.stage === 1 ? "answerEng" : "answerFind");
      expect(musicProvider.speak(q).he?.length).toBeGreaterThan(0);
    }
  });
});

describe("stages 3 and 4 — which key, then what it is called", () => {
  it("the tone that plays last is the note the answer names", () => {
    for (const band of [
      { stage: 3, notes: 5, hint: true },
      { stage: 3, notes: 7 },
      { stage: 4, notes: 5 },
      { stage: 4, notes: 7, hint: true },
    ] as MusicBand[]) {
      for (const q of many(band, 40)) {
        const target = q.solfa[0];
        expect(q.solfa).toHaveLength(1);
        expect(q.tones[q.tones.length - 1]).toBeCloseTo(solfaFreq(q.tonic, target), 6);
        expect(q.answer).toBe(band.stage === 3 ? SOLFA_KEY_GLYPH[target] : SOLFA_HE[target]);
      }
    }
  });

  it("labels keys as keys at stage 3 and as movable-do names at stage 4", () => {
    const glyphs = Object.values(SOLFA_KEY_GLYPH);
    for (const q of many({ stage: 3, notes: 7 }, 30)) {
      for (const o of q.options) expect(glyphs).toContain(o);
    }
    const names = Object.values(SOLFA_HE);
    for (const q of many({ stage: 4, notes: 7 }, 30)) {
      for (const o of q.options) expect(names).toContain(o);
    }
  });

  it("hears do first while the band still hints, and not after it fades", () => {
    for (const q of many({ stage: 3, notes: 5, hint: true }, 40)) {
      expect(q.anchor).toBe(true);
      expect(q.tones).toHaveLength(2);
      expect(q.tones[0]).toBeCloseTo(q.tonic, 6);
      expect(musicProvider.render(q).hint).toBe("הצליל הראשון הוא דו");
    }
    for (const q of many({ stage: 3, notes: 5 }, 40)) {
      expect(q.anchor).toBe(false);
      expect(q.tones).toHaveLength(1);
      expect(musicProvider.render(q).hint).toBeUndefined();
    }
  });

  it("keeps the anchor even when do is itself the answer, so it never leaks", () => {
    const onDo = many({ stage: 4, notes: 5, hint: true }, 120).filter((q) => q.solfa[0] === "do");
    expect(onDo.length).toBeGreaterThan(0);
    for (const q of onDo) {
      expect(q.tones).toHaveLength(2);
      expect(q.tones[0]).toBeCloseTo(q.tones[1], 6);
    }
  });

  it("grows the key set from five to seven notes", () => {
    const five = new Set(many({ stage: 4, notes: 5 }, 120).flatMap((q) => q.solfa));
    expect(five).toEqual(new Set(PENTATONIC_SOLFA));
    const seven = new Set(many({ stage: 4, notes: 7 }, 200).flatMap((q) => q.solfa));
    expect(seven).toEqual(new Set(DIATONIC_SOLFA));
  });
});

describe("stage 1 — happy or sad", () => {
  it("a major triad is happy and a minor one is sad", () => {
    for (const q of many({ stage: 1, notes: 7 }, 80)) {
      expect(q.options).toEqual([MUSIC_HAPPY, MUSIC_SAD]);
      expect(q.tones).toHaveLength(3);
      const third = q.quality === "major" ? 4 : 3;
      expect(q.tones[1] / q.tones[0]).toBeCloseTo(Math.pow(SEMI, third), 8);
      expect(q.tones[2] / q.tones[0]).toBeCloseTo(Math.pow(SEMI, 7), 8);
      expect(q.answer).toBe(q.quality === "major" ? MUSIC_HAPPY : MUSIC_SAD);
    }
  });

  it("is the same shape slid to a new root, not a table of chords", () => {
    for (const q of many({ stage: 1, notes: 5 }, 40)) {
      const root = solfaFreq(q.tonic, q.solfa[0]);
      expect(q.tones).toEqual(triadFreqs(root, q.quality!));
    }
  });

  it("sounds the three notes together", () => {
    for (const q of many({ stage: 1, notes: 5 }, 20)) {
      expect(new Set(q.play.map((n) => n.startMs)).size).toBe(1);
      expect(new Set(q.play.map((n) => n.durMs)).size).toBe(1);
    }
  });

  it("teaches both feelings", () => {
    const answers = new Set(many({ stage: 1, notes: 5 }, 60).map((q) => q.answer));
    expect(answers).toEqual(new Set([MUSIC_HAPPY, MUSIC_SAD]));
  });
});

describe("stage 5 — echo a phrase", () => {
  function labelOf(solfa: readonly Solfa[]) {
    return solfa.map((s) => SOLFA_HE[s]).join("־");
  }

  it("plays exactly the phrase the correct option spells", () => {
    for (const band of [
      { stage: 5, notes: 5, len: 2 },
      { stage: 5, notes: 7, len: 3 },
      { stage: 5, notes: 7, len: 4 },
    ] as MusicBand[]) {
      for (const q of many(band, 30)) {
        expect(q.answer).toBe(labelOf(q.solfa));
        expect(q.solfa).toHaveLength(band.len!);
        const played = q.anchor ? q.tones.slice(1) : q.tones;
        expect(played).toHaveLength(q.solfa.length);
        q.solfa.forEach((s, i) => {
          expect(played[i]).toBeCloseTo(solfaFreq(q.tonic, s), 6);
        });
      }
    }
  });

  it("plays the phrase one note at a time", () => {
    for (const q of many({ stage: 5, notes: 5, len: 3 }, 20)) {
      for (let i = 1; i < q.play.length; i++) {
        expect(q.play[i].startMs).toBeGreaterThanOrEqual(
          q.play[i - 1].startMs + q.play[i - 1].durMs
        );
      }
    }
  });

  it("uses phrase length as the difficulty knob and clamps silly values", () => {
    expect(gen({ stage: 5, notes: 5 }).solfa).toHaveLength(2);
    expect(gen({ stage: 5, notes: 7, len: 9 }).solfa).toHaveLength(4);
    expect(gen({ stage: 5, notes: 7, len: 0 }).solfa).toHaveLength(2);
  });

  it("only ever uses notes the child has met at that band", () => {
    for (const q of many({ stage: 5, notes: 5, len: 4 }, 40)) {
      for (const s of q.solfa) expect(PENTATONIC_SOLFA).toContain(s);
    }
  });

  it("gives three readable, different phrases to choose from", () => {
    for (const q of many({ stage: 5, notes: 5, len: 2 }, 40)) {
      expect(q.options).toHaveLength(3);
      expect(new Set(q.options).size).toBe(3);
      expect(q.options).toContain(q.answer);
    }
  });
});

describe("stage 2 — which chord", () => {
  const CHORD_NAMES = MUSIC_CHORD_DEGREES.map((d) => SOLFA_HE[d]);

  it("offers the three chords of the key, and names the one that sounded", () => {
    for (const q of many({ stage: 2, notes: 7 }, 60)) {
      expect(q.options).toEqual(CHORD_NAMES);
      expect(MUSIC_CHORD_DEGREES).toContain(q.solfa[0]);
      expect(q.answer).toBe(SOLFA_HE[q.solfa[0]]);
    }
  });

  it("sounds a triad built by interval off the key's own do, never a stored chord", () => {
    for (const q of many({ stage: 2, notes: 5 }, 60)) {
      const [, ...triad] = q.tones;
      const root = solfaFreq(q.tonic, q.solfa[0]);
      expect(triad).toHaveLength(3);
      expect(triad).toEqual(triadFreqs(root, "major"));
      // A major shape: 4 semitones then 7, measured from the root itself.
      expect(triad[0]).toBeCloseTo(root, 6);
      expect(triad[1] / triad[0]).toBeCloseTo(Math.pow(SEMI, 4), 10);
      expect(triad[2] / triad[0]).toBeCloseTo(Math.pow(SEMI, 7), 10);
    }
  });

  it("is the I, IV and V of whatever key it landed in — same ratios, new pitches", () => {
    const byKey = new Map<string, MusicQuestion[]>();
    for (const q of many({ stage: 2, notes: 5 }, 120)) {
      byKey.set(q.keyId, [...(byKey.get(q.keyId) ?? []), q]);
    }
    expect(byKey.size).toBeGreaterThan(1);

    const ratios = new Map<Solfa, number>();
    for (const qs of byKey.values()) {
      for (const q of qs) {
        const ratio = q.tones[1] / q.tonic;
        const seen = ratios.get(q.solfa[0]);
        if (seen === undefined) ratios.set(q.solfa[0], ratio);
        else expect(ratio).toBeCloseTo(seen, 10);
      }
    }
    // do / fa / sol are 0, 5 and 7 semitones above the tonic, in every key.
    expect(ratios.get("do")).toBeCloseTo(1, 10);
    expect(ratios.get("fa")).toBeCloseTo(Math.pow(SEMI, 5), 10);
    expect(ratios.get("sol")).toBeCloseTo(Math.pow(SEMI, 7), 10);
    // Different keys really do put the same chord at a different pitch.
    const doPitches = new Set(
      [...byKey.values()].flat().filter((q) => q.solfa[0] === "do").map((q) => q.tones[1])
    );
    expect(doPitches.size).toBeGreaterThan(1);
  });

  it("states the key first — do alone, then the chord all at once", () => {
    for (const q of many({ stage: 2, notes: 7 }, 30)) {
      expect(q.anchor).toBe(true);
      expect(q.tones).toHaveLength(4);
      expect(q.tones[0]).toBeCloseTo(q.tonic, 6);
      const [anchor, ...chord] = q.play;
      expect(new Set(chord.map((n) => n.startMs)).size).toBe(1);
      expect(chord[0].startMs).toBeGreaterThan(anchor.startMs + anchor.durMs);
    }
  });

  it("really asks for all three chords", () => {
    const answers = new Set(many({ stage: 2, notes: 7 }, 90).map((q) => q.answer));
    expect(answers).toEqual(new Set(CHORD_NAMES));
  });
});

describe("musicProvider keys and repeats", () => {
  it("names the item, not the pitch — the same phrase in another key is one item", () => {
    const qs = many({ stage: 4, notes: 5 }, 200);
    expect(new Set(qs.map((q) => q.keyId)).size).toBeGreaterThan(1);
    expect(new Set(qs.map((q) => musicProvider.key(q))).size).toBe(PENTATONIC_SOLFA.length);
  });

  it("separates the two chord shapes on the same root", () => {
    const major = musicProvider.key({ op: "music", stage: 1, solfa: ["do"], quality: "major", answer: "" } as MusicQuestion);
    const minor = musicProvider.key({ op: "music", stage: 1, solfa: ["do"], quality: "minor", answer: "" } as MusicQuestion);
    expect(major).not.toBe(minor);
  });

  it("separates the same note asked as a key and asked by name", () => {
    const q1 = gen({ stage: 3, notes: 5 });
    const q2: MusicQuestion = { ...q1, stage: 4 };
    expect(musicProvider.key(q1)).not.toBe(musicProvider.key(q2));
  });

  it("avoids what the run already used", () => {
    const keyFor = (s: Solfa) =>
      musicProvider.key({ op: "music", stage: 4, solfa: [s], answer: "" } as MusicQuestion);
    const usedKeys = PENTATONIC_SOLFA.filter((s) => s !== "la").map(keyFor);
    for (const q of many({ stage: 4, notes: 5 }, 20, { usedKeys })) {
      expect(q.solfa[0]).toBe("la");
    }

    // The chord rung has a pool of three, and suppression narrows it the same way.
    const chordKeys = MUSIC_CHORD_DEGREES.filter((d) => d !== "sol").map((d) =>
      musicProvider.key({ op: "music", stage: 2, solfa: [d], quality: "major", answer: "" } as MusicQuestion)
    );
    for (const q of many({ stage: 2, notes: 7 }, 20, { usedKeys: chordKeys })) {
      expect(q.solfa[0]).toBe("sol");
    }
  });

  it("resets gracefully once every item has been used", () => {
    const usedKeys = PENTATONIC_SOLFA.map((s) =>
      musicProvider.key({ op: "music", stage: 4, solfa: [s], answer: "" } as MusicQuestion)
    );
    for (const q of many({ stage: 4, notes: 5 }, 20, { usedKeys })) {
      expect(PENTATONIC_SOLFA).toContain(q.solfa[0]);
      expect(q.options).toContain(q.answer);
    }
    const phraseKeys = MUSIC_PHRASES.map((p) =>
      musicProvider.key({ op: "music", stage: 5, solfa: [...p.solfa], answer: "" } as MusicQuestion)
    );
    const q = gen({ stage: 5, notes: 5, len: 2 }, { usedKeys: phraseKeys });
    expect(q.options).toContain(q.answer);

    const chordKeys = MUSIC_CHORD_DEGREES.map((d) =>
      musicProvider.key({ op: "music", stage: 2, solfa: [d], quality: "major", answer: "" } as MusicQuestion)
    );
    const chord = gen({ stage: 2, notes: 7 }, { usedKeys: chordKeys });
    expect(chord.options).toContain(chord.answer);
  });
});

describe("music bands", () => {
  it("climbs the ladder as the parent raises the level", () => {
    const stageOf = (bands: DifficultyBand[]) => bands.map((b) => b.stage);
    expect(stageOf(MUSIC_BANDS.easy)).toEqual([1, 2, 3]);
    expect(stageOf(MUSIC_BANDS.medium)).toEqual([2, 3, 4]);
    expect(stageOf(MUSIC_BANDS.hard)).toEqual([3, 4, 5]);
    expect(musicProvider.bands).toBe(MUSIC_BANDS);
  });

  it("opens on a chord — the first easy question is happy or sad", () => {
    expect(MUSIC_BANDS.easy[0].stage).toBe(1);
    const chordBands = MUSIC_BANDS.easy.filter((b) => b.stage === 1 || b.stage === 2);
    expect(chordBands.length).toBe(2);
    for (const band of chordBands) {
      for (const q of many(band as MusicBand, 20)) {
        expect(q.tones.length).toBeGreaterThanOrEqual(3);
        expect(q.options).toContain(q.answer);
      }
    }
    const q = gen(MUSIC_BANDS.easy[0] as MusicBand);
    expect(q.stage).toBe(1);
    expect(q.options).toEqual([MUSIC_HAPPY, MUSIC_SAD]);
    expect(q.quality === "major" || q.quality === "minor").toBe(true);
  });

  it("only ever drops supports as a run goes on, and ends without them", () => {
    for (const level of ["easy", "medium", "hard"] as const) {
      const hints = MUSIC_BANDS[level].map((b) => b.hint === true);
      for (let i = 1; i < hints.length; i++) {
        expect(hints[i] && !hints[i - 1]).toBe(false);
      }
      expect(hints[hints.length - 1]).toBe(false);
    }
  });

  it("generates a real question for every factory band", () => {
    for (const level of ["easy", "medium", "hard"] as const) {
      for (const band of MUSIC_BANDS[level]) {
        const q = gen(band as MusicBand);
        expect(q.options).toContain(q.answer);
      }
    }
  });
});

describe("music maths and headless safety", () => {
  it("uses equal temperament — an octave is exactly double", () => {
    expect(transpose(A4_HZ, 12)).toBe(2 * A4_HZ);
    const c4 = transpose(A4_HZ, -9);
    expect(solfaFreq(c4, "do", 1)).toBeCloseTo(2 * c4, 6);
  });

  it("builds a major triad from the right intervals", () => {
    const [root, third, fifth] = triadFreqs(261.6, "major");
    expect(third / root).toBeCloseTo(Math.pow(SEMI, 4), 10);
    expect(fifth / root).toBeCloseTo(Math.pow(SEMI, 7), 10);
  });

  it("generates questions without any AudioContext", async () => {
    const ctor = vi.fn(() => {
      throw new Error("the provider must not touch WebAudio");
    });
    vi.stubGlobal("AudioContext", ctor);
    vi.resetModules();
    const mod = await import("@/lib/providers/music");
    const q = mod.musicProvider.generate(ctx({ stage: 2, notes: 7 }));
    expect((q as MusicQuestion).tones).toHaveLength(4);
    expect(ctor).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
