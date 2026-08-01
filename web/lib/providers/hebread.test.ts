import { describe, expect, it } from "vitest";
import { LETTER_CONFUSE, LETTER_NAME } from "@/data/find";
import {
  HEBREAD_PICTURES,
  HEBREAD_SYLLABLE_LETTERS,
  HEBREAD_WORDS,
  NIKUD,
  PICTURES_BY_LETTER,
  syllableText,
} from "@/data/hebread";
import { defaultCurriculum } from "@/lib/difficulty";
import { hebreadProvider, type HebReadQuestion } from "@/lib/providers/hebread";
import type { ProviderContext } from "@/lib/types";

const STAGES = [1, 2, 3, 4, 5];
const HEB = /[\u05D0-\u05EA]/;

function ctx(stage: number, overrides: Partial<ProviderContext> = {}): ProviderContext {
  const curriculum = defaultCurriculum("hebread");
  curriculum.bands.easy = [{ stage }];
  return {
    gameId: "hebread",
    level: "easy",
    step: 1,
    usedKeys: [],
    recent: [],
    countEmoji: "🦁",
    curriculum,
    ...overrides,
  };
}

function gen(stage: number, overrides: Partial<ProviderContext> = {}): HebReadQuestion {
  return hebreadProvider.generate(ctx(stage, overrides)) as HebReadQuestion;
}

function many(stage: number, n: number, overrides: Partial<ProviderContext> = {}) {
  return Array.from({ length: n }, () => gen(stage, overrides));
}

function confusable(a: string, b: string): boolean {
  if (a === b) return false;
  return LETTER_CONFUSE.some(
    (f) => (f as readonly string[]).includes(a) && (f as readonly string[]).includes(b)
  );
}

function pairs<T>(arr: T[]): [T, T][] {
  const out: [T, T][] = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) out.push([arr[i], arr[j]]);
  }
  return out;
}

function letterOfEmoji(emoji: string): string {
  return HEBREAD_PICTURES.find((p) => p.emoji === emoji)?.l ?? "?";
}

/**
 * Which nikud a written syllable carries. The vav-based marks (holam, shuruk)
 * are two characters, so they have to be matched before the single-character
 * ones.
 */
const BY_LONGEST_MARK = [...NIKUD].sort((a, b) => b.attach.length - a.attach.length);

function vowelOf(text: string) {
  const t = text.normalize("NFC");
  return BY_LONGEST_MARK.find((n) => t.includes(n.attach.normalize("NFC")));
}

describe("hebread data", () => {
  it("has a unique emoji per picture and per word", () => {
    const pics = HEBREAD_PICTURES.map((p) => p.emoji);
    expect(new Set(pics).size).toBe(pics.length);
    const words = HEBREAD_WORDS.map((w) => w.emoji);
    expect(new Set(words).size).toBe(words.length);
  });

  it("gives every letter at least two pictures so stage 1 can cue with one", () => {
    for (const letter of Object.keys(PICTURES_BY_LETTER)) {
      expect(PICTURES_BY_LETTER[letter].length).toBeGreaterThanOrEqual(2);
    }
    expect(Object.keys(PICTURES_BY_LETTER)).toHaveLength(22);
  });

  it("writes each word's first syllable with its own opening letter", () => {
    for (const w of HEBREAD_WORDS) {
      expect(w.syl.startsWith(w.letter)).toBe(true);
      expect(NIKUD[w.nik]).toBeDefined();
      expect(w.he.startsWith(w.letter)).toBe(true);
    }
  });

  it("keeps some open-syllable words for the start of stage 5", () => {
    expect(HEBREAD_WORDS.filter((w) => w.open).length).toBeGreaterThanOrEqual(6);
  });

  it("spells a generated syllable exactly as a word spells it", () => {
    for (const w of HEBREAD_WORDS) {
      expect(w.he.normalize("NFC")).toBe(w.he);
      expect(w.syl.normalize("NFC")).toBe(w.syl);
    }
    const sylOf = (plain: string) => HEBREAD_WORDS.find((w) => w.plain === plain)?.syl;
    expect(syllableText("ב", NIKUD[0])).toBe(sylOf("בית"));
    expect(syllableText("ש", NIKUD[3])).toBe(sylOf("שמש"));
    expect(syllableText("כ", NIKUD[5])).toBe(sylOf("כובע"));
    expect(syllableText("ב", NIKUD[7])).toBe(sylOf("בובה"));
  });
});

describe("hebread every stage", () => {
  it("always offers three distinct options containing the answer", () => {
    for (const stage of STAGES) {
      for (const q of many(stage, 120)) {
        expect(q.op).toBe("hebread");
        expect(q.stage).toBe(stage);
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(new Set(q.options).size).toBe(q.options.length);
        expect(q.options.every((o) => typeof o === "string" && o.length > 0)).toBe(true);
        expect(q.options).toContain(q.answer);
      }
    }
  });

  it("renders a prompt and speaks Hebrew at every stage", () => {
    for (const stage of STAGES) {
      const q = gen(stage);
      const view = hebreadProvider.render(q);
      expect(view.prompt.length).toBeGreaterThan(0);
      expect(view.options).toEqual(q.options);
      expect(["answerFind", "answerEng"]).toContain(view.variant);
      expect(hebreadProvider.speak(q).he?.length).toBeGreaterThan(0);
    }
  });

  it("fades the written hint away by stage 4", () => {
    for (const stage of [1, 2, 3]) {
      expect(hebreadProvider.render(gen(stage)).hint).toBeTruthy();
    }
    for (const stage of [4, 5]) {
      for (const q of many(stage, 20)) {
        expect(hebreadProvider.render(q).hint).toBeUndefined();
      }
    }
  });

  it("suppresses a used key on the next questions", () => {
    for (const stage of STAGES) {
      const first = gen(stage);
      const used = hebreadProvider.key(first);
      for (const q of many(stage, 40, { usedKeys: [used] })) {
        expect(hebreadProvider.key(q)).not.toBe(used);
      }
    }
  });

  it("rebuilds the pool instead of failing once every item is used", () => {
    const used = HEBREAD_PICTURES.map((p) => `hebread:1:sound:${p.emoji}`);
    const q = gen(1, { usedKeys: used });
    expect(q.options).toContain(q.answer);
  });

  it("keys a question by its stage, mode and answer", () => {
    for (const stage of STAGES) {
      const q = gen(stage);
      expect(hebreadProvider.key(q)).toBe(`hebread:${stage}:${q.mode}:${q.answer}`);
    }
  });
});

describe("hebread stage 1 — same first sound", () => {
  it("shows no Hebrew letter and answers with a different word of the same letter", () => {
    for (const q of many(1, 150)) {
      const view = hebreadProvider.render(q);
      expect(view.variant).toBe("answerEng");
      expect(view.prompt).not.toMatch(HEB);
      expect(q.options.some((o) => HEB.test(o))).toBe(false);

      expect(q.options).not.toContain(q.cueEmoji);
      expect(letterOfEmoji(q.answer)).toBe(q.letter);
      expect(q.cueWord).not.toBe(HEBREAD_PICTURES.find((p) => p.emoji === q.answer)?.he);
      expect(letterOfEmoji(q.cueEmoji as string)).toBe(q.letter);
    }
  });

  it("never offers a second picture that starts with the target sound", () => {
    for (const q of many(1, 150)) {
      const letters = q.options.map(letterOfEmoji);
      expect(letters.filter((l) => l === q.letter)).toHaveLength(1);
      expect(new Set(letters).size).toBe(letters.length);
    }
  });

  it("speaks the cue word without naming its letter", () => {
    for (const q of many(1, 40)) {
      expect(hebreadProvider.speak(q).he).toContain(q.cueWord);
    }
  });
});

describe("hebread stage 2 — sound to letter", () => {
  it("offers letters that cannot be visually confused with each other", () => {
    for (const q of many(2, 200)) {
      expect(hebreadProvider.render(q).variant).toBe("answerFind");
      expect(q.options).toContain(q.letter);
      for (const [a, b] of pairs(q.options)) expect(confusable(a, b)).toBe(false);
    }
  });

  it("speaks the letter name and an example word", () => {
    for (const q of many(2, 40)) {
      const he = hebreadProvider.speak(q).he ?? "";
      expect(he).toContain(q.cueWord);
      expect(he.length).toBeGreaterThan(0);
    }
  });
});

describe("hebread stage 3 — letter to sound", () => {
  it("shows the letter and offers pictures with non-confusable initials", () => {
    for (const q of many(3, 200)) {
      const view = hebreadProvider.render(q);
      expect(view.variant).toBe("answerEng");
      expect(view.prompt).toBe(q.letter);
      const letters = q.options.map(letterOfEmoji);
      expect(letters.filter((l) => l === q.letter)).toHaveLength(1);
      for (const [a, b] of pairs(letters)) expect(confusable(a, b)).toBe(false);
    }
  });

  it("does not say the letter name, which is what the child must supply", () => {
    const said = new Set<string>();
    for (const q of many(3, 60)) {
      const he = hebreadProvider.speak(q).he ?? "";
      expect(he).not.toContain(LETTER_NAME[q.letter ?? ""]);
      said.add(he);
    }
    expect(said.size).toBe(1);
  });
});

describe("hebread stage 4 — letter plus nikud", () => {
  it("introduces patach alone before any other mark", () => {
    for (const q of many(4, 150, { step: 1 })) {
      if (q.mode === "hearSyl") {
        for (const o of q.options) expect(vowelOf(o)?.name).toBe(NIKUD[0].name);
      } else {
        expect(HEBREAD_WORDS.find((w) => w.emoji === q.answer)?.nik).toBe(0);
      }
    }
  });

  it("adds later marks as the run goes on", () => {
    const seen = new Set<string>();
    for (const q of many(4, 300, { step: 40 })) {
      if (q.mode !== "hearSyl") continue;
      for (const o of q.options) {
        const mark = vowelOf(o);
        if (mark) seen.add(mark.name);
      }
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("writes syllables from taught consonants and never repeats a sound", () => {
    for (const q of many(4, 200, { step: 40 })) {
      if (q.mode !== "hearSyl") continue;
      expect(hebreadProvider.render(q).variant).toBe("answerFind");
      const letters = q.options.map((o) => o[0]);
      for (const l of letters) expect(HEBREAD_SYLLABLE_LETTERS).toContain(l);
      for (const [a, b] of pairs(letters)) expect(confusable(a, b)).toBe(false);

      // patach and kamatz both say "a" — two options may never read alike
      const sounds = q.options.map((o) => `${o[0]}:${vowelOf(o)?.sound ?? "?"}`);
      expect(sounds.every((s) => !s.endsWith("?"))).toBe(true);
      expect(new Set(sounds).size).toBe(sounds.length);
    }
  });

  it("shows the syllable and pictures, unspoken, in the reading direction", () => {
    for (const q of many(4, 200, { step: 40 })) {
      if (q.mode !== "readSyl") continue;
      const view = hebreadProvider.render(q);
      expect(view.variant).toBe("answerEng");
      expect(view.prompt).toBe(q.text);
      expect(hebreadProvider.speak(q).he).not.toContain(q.text);

      const words = q.options.map((o) => HEBREAD_WORDS.find((w) => w.emoji === o));
      expect(words.every(Boolean)).toBe(true);
      const starts = words.map((w) => `${w?.letter}:${NIKUD[w?.nik ?? 0].sound}`);
      expect(new Set(starts).size).toBe(starts.length);
    }
  });

  it("produces both directions over a run", () => {
    const modes = new Set(many(4, 60, { step: 40 }).map((q) => q.mode));
    expect(modes).toEqual(new Set(["hearSyl", "readSyl"]));
  });
});

describe("hebread stage 5 — whole word", () => {
  it("shows a pointed word and pictures, and never reads the word aloud", () => {
    for (const q of many(5, 150, { step: 40 })) {
      const view = hebreadProvider.render(q);
      expect(view.variant).toBe("answerEng");
      const word = HEBREAD_WORDS.find((w) => w.emoji === q.answer);
      expect(word).toBeDefined();
      expect(view.prompt).toBe(word?.he);
      const he = hebreadProvider.speak(q).he ?? "";
      expect(he).not.toContain(word?.he);
      expect(he).not.toContain(word?.plain);
    }
  });

  it("starts with open-syllable words and never repeats a first syllable", () => {
    for (const q of many(5, 100, { step: 1 })) {
      expect(HEBREAD_WORDS.find((w) => w.emoji === q.answer)?.open).toBe(true);
      const syls = q.options.map((o) => HEBREAD_WORDS.find((w) => w.emoji === o)?.syl);
      expect(new Set(syls).size).toBe(syls.length);
    }
  });

  it("brings in closed-syllable words later in the run", () => {
    const closed = many(5, 200, { step: 40 }).some(
      (q) => HEBREAD_WORDS.find((w) => w.emoji === q.answer)?.open === false
    );
    expect(closed).toBe(true);
  });
});
