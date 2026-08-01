import { describe, expect, it } from "vitest";
import { defaultCurriculum } from "@/lib/difficulty";
import {
  ENG_CONFUSE,
  ENG_SOUNDS,
  ENGREAD_BANDS,
  ENGREAD_CVC,
  ENGREAD_PICS,
  ENGREAD_STAGES,
  engSound,
  isCvc,
  isDecodable,
  PHONICS_ORDER,
} from "@/data/engread";
import { engreadProvider, type EngReadQuestion } from "@/lib/providers/engread";
import type { DifficultyLevel, ProviderContext } from "@/lib/types";

const STAGES = [1, 2, 3, 4, 5] as const;
const LEVELS: readonly DifficultyLevel[] = ["easy", "medium", "hard"];
/** Every question is shuffled, so run each check enough times to see the tails. */
const RUNS = 200;

const VARIANT: Record<number, "answerFind" | "answerEng"> = {
  1: "answerFind",
  2: "answerEng",
  3: "answerFind",
  4: "answerEng",
  5: "answerFind",
};

function ctx(stage: number, overrides: Partial<ProviderContext> = {}): ProviderContext {
  const curriculum = defaultCurriculum("engread");
  curriculum.bands.easy = [{ stage }];
  return {
    gameId: "engread",
    level: "easy",
    step: 1,
    usedKeys: [],
    recent: [],
    countEmoji: "🦁",
    curriculum,
    ...overrides,
  };
}

/** A context on the factory ladder, standing on one band of one level. */
function bandCtx(level: DifficultyLevel, bandIndex: number): ProviderContext {
  const curriculum = defaultCurriculum("engread");
  return {
    gameId: "engread",
    level,
    step: bandIndex * curriculum.stepsPerBlock + 1,
    usedKeys: [],
    recent: [],
    countEmoji: "🦁",
    curriculum,
  };
}

function gen(stage: number, overrides: Partial<ProviderContext> = {}): EngReadQuestion {
  return engreadProvider.generate(ctx(stage, overrides)) as EngReadQuestion;
}

function each(stage: number, check: (q: EngReadQuestion) => void, runs = RUNS) {
  for (let i = 0; i < runs; i++) check(gen(stage));
}

function picByEmoji(emoji: string) {
  return ENGREAD_PICS.find((p) => p.emoji === emoji);
}

function cvcByEmoji(emoji: string) {
  return ENGREAD_CVC.find((w) => w.emoji === emoji);
}

function cvcByWord(word: string) {
  return ENGREAD_CVC.find((w) => w.en === word);
}

/** Every key a stage can ever produce — used to force the no-repeat reset. */
function allKeys(stage: number): string[] {
  if (stage <= 2) return PHONICS_ORDER.map((l) => `engread:${stage}:${l}`);
  return ENGREAD_CVC.map((w) => `engread:${stage}:${w.en}`);
}

/** Slot the two words differ at, or -1 when they differ nowhere or in more than one place. */
function diffAt(a: string, b: string): number {
  const slots = [0, 1, 2].filter((i) => a[i] !== b[i]);
  return slots.length === 1 ? slots[0] : -1;
}

function slotClash(a: string, b: string): boolean {
  if (a === b) return false;
  if (engSound(a)?.sound === engSound(b)?.sound) return true;
  return ENG_CONFUSE.some(
    (g) => (g as readonly string[]).includes(a) && (g as readonly string[]).includes(b)
  );
}

/** No slot of a written-word option set may contrast two clashing letters. */
function slotsFit(words: readonly string[]): boolean {
  return [0, 1, 2].every((i) => {
    const slot = [...new Set(words.map((w) => w[i]))];
    return slot.every((a, x) => slot.slice(x + 1).every((b) => !slotClash(a, b)));
  });
}

/** Words one letter away from `word` that the confusable rule allows beside it. */
function nearMisses(word: string) {
  return ENGREAD_CVC.filter(
    (w) => w.en !== word && diffAt(word, w.en) >= 0 && slotsFit([word, w.en])
  );
}

/**
 * The letters a question asks the child to tell apart. Rungs 1–4 contrast one
 * flat set — the letter options, the pictures' initials, the word onsets, plus
 * the letter printed in the prompt. Rung 5 contrasts slot by slot: `pan`/`pin`
 * ask about `a` against `i` and ask nothing of the `p` and the `n` they share.
 */
function contrastSets(q: EngReadQuestion): string[][] {
  if (q.stage === 1) return [[...q.options]];
  if (q.stage === 2) return [[...q.options.map((e) => picByEmoji(e)!.l), q.letter]];
  if (q.stage === 3) return [[...q.options.map((w) => w[0]), q.letter]];
  if (q.stage === 4) return [[...q.options.map((e) => cvcByEmoji(e)!.en[0]), q.letter]];
  return [0, 1, 2].map((i) => q.options.map((w) => w[i]));
}

function hasConfusablePair(letters: string[]): boolean {
  return ENG_CONFUSE.some(
    (group) => letters.filter((l) => (group as readonly string[]).includes(l)).length > 1
  );
}

describe("engread data", () => {
  it("gives every letter in the phonics order a sound and a keyword picture", () => {
    PHONICS_ORDER.forEach((l) => {
      expect(engSound(l), l).toBeDefined();
      expect(ENGREAD_PICS.some((p) => p.l === l), l).toBe(true);
    });
  });

  it("spells sounds as phonemes, never as letter names", () => {
    ENG_SOUNDS.forEach((s) => {
      expect(s.say).not.toBe(s.l);
      expect(s.say.length).toBeGreaterThan(1);
    });
    expect(engSound("c")!.sound).toBe(engSound("k")!.sound);
  });

  it("keeps keyword pictures distinct and inside the taught letters", () => {
    const emojis = ENGREAD_PICS.map((p) => p.emoji);
    expect(new Set(emojis).size).toBe(emojis.length);
    ENGREAD_PICS.forEach((p) => {
      expect(PHONICS_ORDER as readonly string[], p.en).toContain(p.l);
      expect(engSound(p.l)!.sound, p.en).toBe(p.sound);
      expect(p.en[0], p.en).toBe(p.l);
    });
  });

  it("only holds decodable CVC words for the word rungs", () => {
    const words = ENGREAD_CVC.map((w) => w.en);
    const emojis = ENGREAD_CVC.map((w) => w.emoji);
    expect(new Set(words).size).toBe(words.length);
    expect(new Set(emojis).size).toBe(emojis.length);
    ENGREAD_CVC.forEach((w) => {
      expect(isDecodable(w.en), w.en).toBe(true);
      expect(isCvc(w.en), w.en).toBe(true);
    });
    expect(isDecodable("ship")).toBe(false); // digraph
    expect(isDecodable("egg")).toBe(false); // doubled letter
    expect(isDecodable("cake")).toBe(false); // silent e
    expect(isDecodable("jet")).toBe(false); // j not introduced
    expect(isCvc("bed")).toBe(true);
    expect(isCvc("ant")).toBe(false);
  });

  it("names one rung per stage, from the letter to the spelling", () => {
    expect(ENGREAD_STAGES.map((s) => s.stage)).toEqual([...STAGES]);
    expect(ENGREAD_STAGES[0].label).toContain("letter");
    expect(ENGREAD_STAGES[ENGREAD_STAGES.length - 1].label).toContain("word");
    ENGREAD_STAGES.forEach((s) => expect(s.label.length, `${s.stage}`).toBeGreaterThan(0));
  });

  it("ladders the bands from the first letter to reading and spelling", () => {
    LEVELS.forEach((level) => {
      ENGREAD_BANDS[level].forEach((band) => {
        expect(STAGES as readonly number[]).toContain(band.stage);
      });
    });
    expect(ENGREAD_BANDS.easy[0].stage).toBe(1);
    expect(ENGREAD_BANDS.hard[ENGREAD_BANDS.hard.length - 1].stage).toBe(5);
    expect(defaultCurriculum("engread").bands).toEqual(ENGREAD_BANDS);
  });
});

describe.each(STAGES)("engread stage %i", (stage) => {
  it("generates the stage the band asked for", () => {
    each(stage, (q) => {
      expect(q.op).toBe("engread");
      expect(q.stage).toBe(stage);
    });
  });

  it("offers at least three distinct string options containing the answer", () => {
    each(stage, (q) => {
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      q.options.forEach((o) => expect(typeof o).toBe("string"));
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options).toContain(q.answer);
      expect(typeof q.answer).toBe("string");
    });
  });

  it("never puts two letters from one confusable family in a set", () => {
    each(stage, (q) => {
      contrastSets(q).forEach((set) => {
        const letters = [...new Set(set)];
        expect(hasConfusablePair(letters), letters.join(",")).toBe(false);
      });
    });
  });

  it("renders the tapped strings and the right answer style", () => {
    each(stage, (q) => {
      const r = engreadProvider.render(q);
      expect(r.options).toEqual(q.options);
      expect(r.variant).toBe(VARIANT[stage]);
      expect(r.prompt.length).toBeGreaterThan(0);
    });
  });

  it("does not repeat an item the run already used", () => {
    const used = engreadProvider.key(gen(stage));
    for (let i = 0; i < 80; i++) {
      expect(engreadProvider.key(gen(stage, { usedKeys: [used] }))).not.toBe(used);
    }
  });

  it("keeps going once every item has been used", () => {
    const usedKeys = allKeys(stage);
    for (let i = 0; i < 40; i++) {
      const q = gen(stage, { usedKeys });
      expect(usedKeys).toContain(engreadProvider.key(q));
      expect(q.options).toContain(q.answer);
      expect(q.options.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("engread rung 1 — sound to letter", () => {
  it("plays the phoneme and takes the letter as the answer", () => {
    each(1, (q) => {
      expect(q.answer).toBe(q.letter);
      q.options.forEach((o) => expect(PHONICS_ORDER as readonly string[]).toContain(o));
      const s = engreadProvider.speak(q);
      expect(s.en).toBe(engSound(q.letter)!.say);
      expect(s.en).not.toBe(q.letter);
      expect(s.he).toBeTruthy();
    });
  });

  it("hints with a keyword picture for that letter", () => {
    each(1, (q) => {
      const hint = engreadProvider.render(q).hint!;
      expect(picByEmoji(hint)!.l).toBe(q.letter);
    });
  });

  it("puts letters on the card from the very first question — no rung is ear-only", () => {
    each(1, (q) => {
      const r = engreadProvider.render(q);
      expect(r.variant).toBe("answerFind");
      expect(r.options.length).toBeGreaterThanOrEqual(3);
      r.options.forEach((o) => expect(o).toMatch(/^[a-z]$/));
    });
  });
});

describe("engread rung 2 — letter to sound", () => {
  it("shows the letter and expects a picture that starts with it", () => {
    each(2, (q) => {
      expect(engreadProvider.render(q).prompt).toBe(q.letter);
      expect(picByEmoji(q.answer)!.l).toBe(q.letter);
      q.options
        .filter((o) => o !== q.answer)
        .forEach((o) => expect(picByEmoji(o)!.sound).not.toBe(engSound(q.letter)!.sound));
    });
  });

  it("never plays the sound — producing it is the skill", () => {
    each(2, (q) => {
      const s = engreadProvider.speak(q);
      expect(s.en).toBeUndefined();
      expect(s.he).toBeTruthy();
    });
  });
});

describe("engread rung 3 — blend", () => {
  it("splits the word body-coda and asks for the whole word", () => {
    each(3, (q) => {
      const word = q.word!;
      expect(engreadProvider.render(q).prompt).toBe(`${word[0]}-${word.slice(1)}`);
      expect(q.answer).toBe(word);
      const en = engreadProvider.speak(q).en!;
      expect(en).toContain(word.slice(1));
      expect(en).not.toContain(word);
    });
  });

  it("only ever offers decodable CVC words", () => {
    each(3, (q) => {
      q.options.forEach((o) => {
        expect(isDecodable(o), o).toBe(true);
        expect(isCvc(o), o).toBe(true);
        expect(ENGREAD_CVC.some((w) => w.en === o), o).toBe(true);
      });
    });
  });
});

describe("engread rung 4 — read a word, pick the picture", () => {
  it("shows a decodable word and answers with its picture", () => {
    each(4, (q) => {
      const word = q.word!;
      expect(isDecodable(word)).toBe(true);
      expect(isCvc(word)).toBe(true);
      expect(engreadProvider.render(q).prompt).toBe(word);
      expect(cvcByEmoji(q.answer)!.en).toBe(word);
      q.options.forEach((o) => expect(isDecodable(cvcByEmoji(o)!.en), o).toBe(true));
    });
  });

  it("says nothing in English — this is the rung where the child reads", () => {
    each(4, (q) => {
      const s = engreadProvider.speak(q);
      expect(s.en).toBeUndefined();
      expect(s.he).toBeTruthy();
    });
  });
});

describe("engread rung 5 — picture, pick the written word", () => {
  it("shows the picture and takes the spelling as the answer", () => {
    each(5, (q) => {
      const word = q.word!;
      const r = engreadProvider.render(q);
      expect(r.prompt).toBe(cvcByWord(word)!.emoji);
      expect(r.variant).toBe("answerFind");
      expect(q.answer).toBe(word);
      expect(q.options).toHaveLength(3);
      q.options.forEach((o) => {
        expect(isDecodable(o), o).toBe(true);
        expect(isCvc(o), o).toBe(true);
        expect(cvcByWord(o), o).toBeDefined();
      });
    });
  });

  it("offers a one-letter-apart distractor wherever the data holds one", () => {
    let checked = 0;
    let checkedBeyondOnset = 0;
    each(5, (q) => {
      const word = q.word!;
      const others = q.options.filter((o) => o !== word);
      const label = q.options.join(",");
      if (nearMisses(word).length) {
        checked++;
        expect(others.some((o) => diffAt(word, o) >= 0), label).toBe(true);
      }
      // Where a near miss differs past the onset, use it: reading the first
      // letter must not be enough to answer.
      if (nearMisses(word).some((w) => diffAt(word, w.en) > 0)) {
        checkedBeyondOnset++;
        expect(others.some((o) => diffAt(word, o) > 0), label).toBe(true);
      }
    });
    // Both branches have to fire, or the assertions above prove nothing.
    expect(checked).toBeGreaterThan(RUNS / 2);
    expect(checkedBeyondOnset).toBeGreaterThan(RUNS / 4);
  });

  it("makes `pan` compete with `pin` or `pen`, not with a different-looking word", () => {
    const onlyPan = allKeys(5).filter((k) => k !== "engread:5:pan");
    for (let i = 0; i < 40; i++) {
      const q = gen(5, { usedKeys: onlyPan });
      expect(q.word).toBe("pan");
      expect(q.options).toContain("pan");
      expect(q.options.some((o) => o === "pin" || o === "pen"), q.options.join(",")).toBe(
        true
      );
    }
  });

  it("never contrasts two clashing letters in the same slot", () => {
    each(5, (q) => {
      expect(slotsFit(q.options), q.options.join(",")).toBe(true);
      // The i/e family is the one this rung could easily break: `pin`/`pen`.
      const vowels = [...new Set(q.options.map((o) => o[1]))];
      expect(hasConfusablePair(vowels), vowels.join(",")).toBe(false);
    });
  });

  it("says nothing in English — the words on the card are the only source", () => {
    each(5, (q) => {
      const s = engreadProvider.speak(q);
      expect(s.en).toBeUndefined();
      expect(s.he).toBeTruthy();
    });
  });
});

describe("engread shows a letter on every rung", () => {
  it("puts a Latin letter in the prompt or the options at every level and band", () => {
    LEVELS.forEach((level) => {
      ENGREAD_BANDS[level].forEach((band, i) => {
        for (let n = 0; n < 40; n++) {
          const q = engreadProvider.generate(bandCtx(level, i)) as EngReadQuestion;
          const r = engreadProvider.render(q);
          const onScreen = [r.prompt, ...r.options].join(" ");
          expect(q.stage, `${level} band ${i}`).toBe(band.stage);
          expect(/[a-z]/i.test(onScreen), `${level} rung ${q.stage}: ${onScreen}`).toBe(
            true
          );
        }
      });
    });
  });
});

describe("engread scaffolding fades up the ladder", () => {
  it("drops the picture hint and the English audio at the top", () => {
    const hintOf = (stage: number) => engreadProvider.render(gen(stage)).hint;
    expect(picByEmoji(hintOf(1)!)).toBeDefined();
    expect(hintOf(2)!.length).toBeGreaterThan(2);
    expect(hintOf(3)).toBe("👆");
    expect(hintOf(4)).toBeUndefined();
    // Rung 5's hint is Hebrew chrome for a picture prompt, not a reading crutch.
    expect(/[a-z]/i.test(hintOf(5)!)).toBe(false);
    expect(engreadProvider.speak(gen(3)).en).toBeTruthy();
    expect(engreadProvider.speak(gen(4)).en).toBeUndefined();
    expect(engreadProvider.speak(gen(5)).en).toBeUndefined();
  });
});
