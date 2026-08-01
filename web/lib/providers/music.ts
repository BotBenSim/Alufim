import { diffParams } from "@/lib/difficulty";
import {
  DIATONIC_SOLFA,
  MUSIC_BANDS,
  MUSIC_DOWN,
  MUSIC_HAPPY,
  MUSIC_PHRASES,
  MUSIC_SAD,
  MUSIC_TONICS,
  MUSIC_UP,
  PENTATONIC_SOLFA,
  SOLFA_HE,
  SOLFA_KEY_GLYPH,
  type MusicBand,
} from "@/data/music";
import {
  A4_HZ,
  ANCHOR_PAUSE_MS,
  chordPlan,
  melodyPlan,
  MELODY_NOTE_MS,
  solfaFreq,
  transpose,
  triadFreqs,
  type PlayNote,
  type Solfa,
  type TriadQuality,
} from "@/lib/audio/musicTones";
import { rnd, shuffle } from "@/lib/random";
import type { ProviderContext, Question } from "@/lib/types";
import type { StageProvider, StageRender, StageSpeak } from "./stage";

export type MusicQuestion = Question & {
  op: "music";
  stage: number;
  /**
   * Movable-do identity of the item, and the whole of `key(q)`. The tonic is
   * deliberately not part of it: "sol then mi" is the same ear-training item in
   * every key, so hearing it in G does not count as a fresh item.
   */
  solfa: Solfa[];
  quality?: TriadQuality;
  /** Key this question was transposed to. */
  keyId: string;
  tonic: number;
  /** Frequencies actually played, in order (includes the do anchor when present). */
  tones: number[];
  /** Ready-to-play schedule — the host plays this and needs to know nothing else. */
  play: PlayNote[];
  /** A reference do was played first. Early bands only; fades with `hint`. */
  anchor: boolean;
  /** Whether render may show its supporting line. */
  showHint: boolean;
  options: string[];
  answer: string;
};

/** Item identity, shared by generation (repeat avoidance) and `key(q)`. */
function itemKey(stage: number, solfa: readonly Solfa[], quality?: TriadQuality): string {
  const tail = quality ? `:${quality}` : "";
  return `music:${stage}:${solfa.join("-")}${tail}`;
}

/**
 * Pick an item this run has not used yet, falling back to the whole pool once
 * every item has been seen so a long run never runs dry.
 */
function fresh<T>(items: T[], ctx: ProviderContext, keyOf: (item: T) => string): T {
  const unused = items.filter((item) => !ctx.usedKeys.includes(keyOf(item)));
  const pool = unused.length ? unused : items;
  return pool[rnd(pool.length)];
}

function keySet(band: MusicBand): Solfa[] {
  return [...((band.notes ?? 5) >= 7 ? DIATONIC_SOLFA : PENTATONIC_SOLFA)];
}

function pickKey(): { id: string; tonic: number } {
  const k = MUSIC_TONICS[rnd(MUSIC_TONICS.length)];
  return { id: k.id, tonic: transpose(A4_HZ, k.fromA4) };
}

/** Melody plan, with the reference do held apart from the phrase it introduces. */
function anchoredPlan(tones: number[], anchor: boolean): PlayNote[] {
  if (!anchor) return melodyPlan(tones);
  const [first, ...rest] = tones;
  return [
    ...melodyPlan([first]),
    ...melodyPlan(rest, { startMs: MELODY_NOTE_MS + ANCHOR_PAUSE_MS }),
  ];
}

function phraseLabel(solfa: readonly Solfa[]): string {
  return solfa.map((s) => SOLFA_HE[s]).join("־");
}

/** Stage 1 — two tones; was the second higher or lower? */
function genHighOrLow(ctx: ProviderContext, band: MusicBand): MusicQuestion {
  const set = keySet(band);
  const pairs: Solfa[][] = [];
  for (const a of set) for (const b of set) if (a !== b) pairs.push([a, b]);
  const pair = fresh(pairs, ctx, (p) => itemKey(1, p));

  const { id, tonic } = pickKey();
  const tones = pair.map((s) => solfaFreq(tonic, s));
  const up = tones[1] > tones[0];
  return {
    op: "music",
    stage: 1,
    solfa: pair,
    keyId: id,
    tonic,
    tones,
    play: melodyPlan(tones),
    anchor: false,
    showHint: band.hint === true,
    options: [MUSIC_UP, MUSIC_DOWN],
    answer: up ? MUSIC_UP : MUSIC_DOWN,
  };
}

/**
 * Stages 2 and 3 — one note plays and the child picks it: at stage 2 as a key on
 * the instrument, at stage 3 by its movable-do name. Same ear, one less support.
 */
function genPickNote(
  ctx: ProviderContext,
  band: MusicBand,
  stage: 2 | 3
): MusicQuestion {
  const set = keySet(band);
  const target = fresh(set, ctx, (s) => itemKey(stage, [s]));
  const { id, tonic } = pickKey();
  const targetHz = solfaFreq(tonic, target);

  // The anchor is unconditional at a hinted band, even when the target *is* do —
  // skipping it there would turn its absence into the answer.
  const anchor = band.hint === true;
  const tones = anchor ? [tonic, targetHz] : [targetHz];

  const label = stage === 2 ? (s: Solfa) => SOLFA_KEY_GLYPH[s] : (s: Solfa) => SOLFA_HE[s];
  const others = shuffle(set.filter((s) => s !== target)).slice(0, 2);
  return {
    op: "music",
    stage,
    solfa: [target],
    keyId: id,
    tonic,
    tones,
    play: anchoredPlan(tones, anchor),
    anchor,
    showHint: band.hint === true,
    options: shuffle([target, ...others]).map(label),
    answer: label(target),
  };
}

/** Two wrong phrases that never read the same as the target. */
function phraseDecoys(target: readonly Solfa[], pool: Solfa[][], set: Solfa[]): Solfa[][] {
  const seen = new Set([phraseLabel(target)]);
  const out: Solfa[][] = [];
  const add = (p: Solfa[]) => {
    const label = phraseLabel(p);
    if (seen.has(label)) return;
    seen.add(label);
    out.push(p);
  };

  for (const p of shuffle(pool)) {
    if (out.length >= 2) break;
    add(p);
  }
  // Not enough real phrases at this length: bend the target instead — same notes
  // reversed, then one note changed, which is the discrimination we want anyway.
  if (out.length < 2) add([...target].reverse());
  for (const s of shuffle(set)) {
    if (out.length >= 2) break;
    add([...target.slice(0, -1), s]);
  }
  return out.slice(0, 2);
}

/** Stage 4 — a short phrase plays; pick the phrase that matches. */
function genEchoPhrase(ctx: ProviderContext, band: MusicBand): MusicQuestion {
  const set = keySet(band);
  const len = Math.max(2, Math.min(4, band.len ?? 2));
  const inSet = MUSIC_PHRASES.filter((p) => p.solfa.every((s) => set.includes(s)));
  const atLen = inSet.filter((p) => p.solfa.length === len);
  const pool = atLen.length ? atLen : inSet;

  const phrase = fresh([...pool], ctx, (p) => itemKey(4, p.solfa));
  const target = [...phrase.solfa];
  const { id, tonic } = pickKey();

  const anchor = band.hint === true;
  const phraseTones = target.map((s) => solfaFreq(tonic, s));
  const tones = anchor ? [tonic, ...phraseTones] : phraseTones;

  const others = pool.filter((p) => p.id !== phrase.id).map((p) => [...p.solfa]);
  const decoys = phraseDecoys(target, others, set);
  return {
    op: "music",
    stage: 4,
    solfa: target,
    keyId: id,
    tonic,
    tones,
    play: anchoredPlan(tones, anchor),
    anchor,
    showHint: band.hint === true,
    options: shuffle([target, ...decoys]).map(phraseLabel),
    answer: phraseLabel(target),
  };
}

/** Stage 5 — one triad; happy or sad? The shape moves, the feeling does not. */
function genHappyOrSad(ctx: ProviderContext, band: MusicBand): MusicQuestion {
  const set = keySet(band);
  const qualities: TriadQuality[] = ["major", "minor"];
  const items = set.flatMap((root) => qualities.map((quality) => ({ root, quality })));
  const item = fresh(items, ctx, (i) => itemKey(5, [i.root], i.quality));

  const { id, tonic } = pickKey();
  const tones = triadFreqs(solfaFreq(tonic, item.root), item.quality);
  return {
    op: "music",
    stage: 5,
    solfa: [item.root],
    quality: item.quality,
    keyId: id,
    tonic,
    tones,
    play: chordPlan(tones),
    anchor: false,
    showHint: band.hint === true,
    options: [MUSIC_HAPPY, MUSIC_SAD],
    answer: item.quality === "major" ? MUSIC_HAPPY : MUSIC_SAD,
  };
}

const PROMPT: Record<number, string> = {
  1: "הצליל השני עלה או ירד?",
  2: "איזה מקש שמעתם?",
  3: "מה שם הצליל?",
  4: "איזה לחן שמעתם?",
  5: "הצליל הזה שמח או עצוב?",
};

const SAY: Record<number, string> = {
  1: "הקשיבו לשני הצלילים. השני עלה או ירד?",
  2: "הקשיבו. איזה מקש שמעתם?",
  3: "הקשיבו. מה שם הצליל?",
  4: "הקשיבו ללחן. איזה לחן זה?",
  5: "הקשיבו. שמח או עצוב?",
};

export const musicProvider: StageProvider = {
  bands: MUSIC_BANDS,

  generate(ctx: ProviderContext): MusicQuestion {
    const band = diffParams<MusicBand>(ctx.curriculum, ctx.level, ctx.step);
    switch (band.stage ?? 1) {
      case 2:
        return genPickNote(ctx, band, 2);
      case 3:
        return genPickNote(ctx, band, 3);
      case 4:
        return genEchoPhrase(ctx, band);
      case 5:
        return genHappyOrSad(ctx, band);
      default:
        return genHighOrLow(ctx, band);
    }
  },

  key(q) {
    const qq = q as MusicQuestion;
    return itemKey(qq.stage, qq.solfa, qq.quality);
  },

  render(q: Question): StageRender {
    const qq = q as MusicQuestion;
    const emojiOptions = qq.stage === 1 || qq.stage === 5;
    return {
      prompt: PROMPT[qq.stage] ?? PROMPT[1],
      hint: musicHint(qq),
      options: qq.options,
      variant: emojiOptions ? "answerEng" : "answerFind",
    };
  },

  speak(q: Question): StageSpeak {
    const qq = q as MusicQuestion;
    const say = SAY[qq.stage] ?? SAY[1];
    return { he: qq.anchor ? `הצליל הראשון הוא דו. ${say}` : say };
  },
};

/** The faded support: present at a level's first band, gone from the next one. */
function musicHint(q: MusicQuestion): string | undefined {
  if (!q.showHint) return undefined;
  if (q.anchor) return "הצליל הראשון הוא דו";
  if (q.stage === 1) return `${MUSIC_UP} עלה · ${MUSIC_DOWN} ירד`;
  if (q.stage === 5) return `${MUSIC_HAPPY} שמח · ${MUSIC_SAD} עצוב`;
  return undefined;
}
