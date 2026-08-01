import { describe, expect, it } from "vitest";
import { defaultCurriculum } from "@/lib/difficulty";
import {
  ENG_CONFUSE,
  ENG_SOUNDS,
  ENGREAD_BANDS,
  ENGREAD_CVC,
  ENGREAD_PICS,
  engSound,
  isCvc,
  isDecodable,
  PHONICS_ORDER,
} from "@/data/engread";
import { engreadProvider, type EngReadQuestion } from "@/lib/providers/engread";
import type { ProviderContext } from "@/lib/types";

const STAGES = [1, 2, 3, 4, 5] as const;
/** Every question is shuffled, so run each check enough times to see the tails. */
const RUNS = 200;

const VARIANT: Record<number, "answerFind" | "answerEng"> = {
  1: "answerEng",
  2: "answerFind",
  3: "answerEng",
  4: "answerFind",
  5: "answerEng",
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

/** Every key a stage can ever produce — used to force the no-repeat reset. */
function allKeys(stage: number): string[] {
  if (stage === 1) return ENGREAD_PICS.map((p) => `engread:1:${p.en}`);
  if (stage === 2 || stage === 3) return PHONICS_ORDER.map((l) => `engread:${stage}:${l}`);
  return ENGREAD_CVC.map((w) => `engread:${stage}:${w.en}`);
}

/**
 * The letters a question asks the child to tell apart: the options themselves at
 * stage 2, the option onsets at 4–5, the pictures' first letters at 1 and 3,
 * plus the letter printed in the prompt. (Letters *inside* a word, as in "bed",
 * are not a contrast — the rule is about what competes in one option set.)
 */
function contrastedLetters(q: EngReadQuestion): string[] {
  let letters: string[];
  if (q.stage === 2) letters = [...q.options];
  else if (q.stage === 4) letters = q.options.map((w) => w[0]);
  else if (q.stage === 5) letters = q.options.map((e) => cvcByEmoji(e)!.en[0]);
  else letters = q.options.map((e) => picByEmoji(e)!.l);
  if (q.stage >= 3) letters.push(q.letter);
  return [...new Set(letters)];
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

  it("only holds decodable CVC words for stages 4–5", () => {
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

  it("ladders the bands from ear to reading", () => {
    (["easy", "medium", "hard"] as const).forEach((level) => {
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
      const letters = contrastedLetters(q);
      expect(hasConfusablePair(letters), letters.join(",")).toBe(false);
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

describe("engread stage 1 — same first sound", () => {
  it("marks the picture that shares the spoken word's first sound", () => {
    each(1, (q) => {
      const target = ENGREAD_PICS.find((p) => p.en === q.word)!;
      const answer = picByEmoji(q.answer)!;
      expect(answer.sound).toBe(target.sound);
      expect(answer.en).not.toBe(target.en);
      q.options
        .filter((o) => o !== q.answer)
        .forEach((o) => expect(picByEmoji(o)!.sound).not.toBe(target.sound));
    });
  });

  it("shows pictures only — no letter reaches the screen", () => {
    each(1, (q) => {
      const r = engreadProvider.render(q);
      expect(r.prompt).toBe(ENGREAD_PICS.find((p) => p.en === q.word)!.emoji);
      q.options.forEach((o) => expect(PHONICS_ORDER as readonly string[]).not.toContain(o));
    });
  });

  it("speaks the target word in English and the question in Hebrew", () => {
    each(1, (q) => {
      const s = engreadProvider.speak(q);
      expect(s.en).toBe(q.word);
      expect(s.he).toBeTruthy();
    });
  });
});

describe("engread stage 2 — sound to letter", () => {
  it("plays the phoneme and takes the letter as the answer", () => {
    each(2, (q) => {
      expect(q.answer).toBe(q.letter);
      q.options.forEach((o) => expect(PHONICS_ORDER as readonly string[]).toContain(o));
      const s = engreadProvider.speak(q);
      expect(s.en).toBe(engSound(q.letter)!.say);
      expect(s.en).not.toBe(q.letter);
    });
  });

  it("hints with a keyword picture for that letter", () => {
    each(2, (q) => {
      const hint = engreadProvider.render(q).hint!;
      expect(picByEmoji(hint)!.l).toBe(q.letter);
    });
  });
});

describe("engread stage 3 — letter to sound", () => {
  it("shows the letter and expects a picture that starts with it", () => {
    each(3, (q) => {
      expect(engreadProvider.render(q).prompt).toBe(q.letter);
      expect(picByEmoji(q.answer)!.l).toBe(q.letter);
    });
  });

  it("never plays the sound — producing it is the skill", () => {
    each(3, (q) => {
      const s = engreadProvider.speak(q);
      expect(s.en).toBeUndefined();
      expect(s.he).toBeTruthy();
    });
  });
});

describe("engread stage 4 — blend", () => {
  it("splits the word body-coda and asks for the whole word", () => {
    each(4, (q) => {
      const word = q.word!;
      expect(engreadProvider.render(q).prompt).toBe(`${word[0]}-${word.slice(1)}`);
      expect(q.answer).toBe(word);
      const en = engreadProvider.speak(q).en!;
      expect(en).toContain(word.slice(1));
      expect(en).not.toContain(word);
    });
  });

  it("only ever offers decodable CVC words", () => {
    each(4, (q) => {
      q.options.forEach((o) => {
        expect(isDecodable(o), o).toBe(true);
        expect(isCvc(o), o).toBe(true);
        expect(ENGREAD_CVC.some((w) => w.en === o), o).toBe(true);
      });
    });
  });
});

describe("engread stage 5 — read a word", () => {
  it("shows a decodable word and answers with its picture", () => {
    each(5, (q) => {
      const word = q.word!;
      expect(isDecodable(word)).toBe(true);
      expect(isCvc(word)).toBe(true);
      expect(engreadProvider.render(q).prompt).toBe(word);
      expect(cvcByEmoji(q.answer)!.en).toBe(word);
      q.options.forEach((o) => expect(isDecodable(cvcByEmoji(o)!.en), o).toBe(true));
    });
  });

  it("says nothing in English — this is the rung where the child reads", () => {
    each(5, (q) => {
      const s = engreadProvider.speak(q);
      expect(s.en).toBeUndefined();
      expect(s.he).toBeTruthy();
    });
  });
});

describe("engread scaffolding fades up the ladder", () => {
  it("drops the written hint and the English audio at the top", () => {
    const hintOf = (stage: number) => engreadProvider.render(gen(stage)).hint;
    expect(hintOf(1)!.length).toBeGreaterThan(2);
    expect(hintOf(3)!.length).toBeGreaterThan(2);
    expect(hintOf(4)).toBe("👆");
    expect(hintOf(5)).toBeUndefined();
    expect(engreadProvider.speak(gen(4)).en).toBeTruthy();
    expect(engreadProvider.speak(gen(5)).en).toBeUndefined();
  });
});
