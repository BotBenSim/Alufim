import { diffParams } from "@/lib/difficulty";
import {
  DIATONIC_SOLFA,
  MUSIC_BANDS,
  MUSIC_CHORD_DEGREES,
  MUSIC_HAPPY,
  MUSIC_PHRASES,
  MUSIC_SAD,
  MUSIC_TONICS,
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
import { t } from "@/lib/i18n";

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
  /**
   * A reference do was played first. It fades with `hint` on the rungs that only
   * lean on it, and is permanent at stage 2, where the question is which chord
   * of *this* key sounded and so has no meaning without the key.
   */
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

/**
 * Stages 3 and 4 — one note plays and the child picks it: at stage 3 as a key on
 * the instrument, at stage 4 by its movable-do name. Same ear, one less support.
 * These come after the chord rungs so the game opens on what the parent asked for.
 */
function genPickNote(
  ctx: ProviderContext,
  band: MusicBand,
  stage: 3 | 4
): MusicQuestion {
  const set = keySet(band);
  const target = fresh(set, ctx, (s) => itemKey(stage, [s]));
  const { id, tonic } = pickKey();
  const targetHz = solfaFreq(tonic, target);

  // The anchor is unconditional at a hinted band, even when the target *is* do —
  // skipping it there would turn its absence into the answer.
  const anchor = band.hint === true;
  const tones = anchor ? [tonic, targetHz] : [targetHz];

  const label = stage === 3 ? (s: Solfa) => SOLFA_KEY_GLYPH[s] : (s: Solfa) => SOLFA_HE[s];
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

/**
 * Stage 1 — one triad; happy or sad? The shape moves, the feeling does not.
 * First question of the game: a chord, not a single note.
 */
function genHappyOrSad(ctx: ProviderContext, band: MusicBand): MusicQuestion {
  const set = keySet(band);
  const qualities: TriadQuality[] = ["major", "minor"];
  const items = set.flatMap((root) => qualities.map((quality) => ({ root, quality })));
  const item = fresh(items, ctx, (i) => itemKey(1, [i.root], i.quality));

  const { id, tonic } = pickKey();
  const tones = triadFreqs(solfaFreq(tonic, item.root), item.quality);
  return {
    op: "music",
    stage: 1,
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

/** Stage 5 — a short phrase plays; pick the phrase that matches. */
function genEchoPhrase(ctx: ProviderContext, band: MusicBand): MusicQuestion {
  const set = keySet(band);
  const len = Math.max(2, Math.min(4, band.len ?? 2));
  const inSet = MUSIC_PHRASES.filter((p) => p.solfa.every((s) => set.includes(s)));
  const atLen = inSet.filter((p) => p.solfa.length === len);
  const pool = atLen.length ? atLen : inSet;

  const phrase = fresh([...pool], ctx, (p) => itemKey(5, p.solfa));
  const target = [...phrase.solfa];
  const { id, tonic } = pickKey();

  const anchor = band.hint === true;
  const phraseTones = target.map((s) => solfaFreq(tonic, s));
  const tones = anchor ? [tonic, ...phraseTones] : phraseTones;

  const others = pool.filter((p) => p.id !== phrase.id).map((p) => [...p.solfa]);
  const decoys = phraseDecoys(target, others, set);
  return {
    op: "music",
    stage: 5,
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

/**
 * Stage 2 — one of the three chords of the key sounds; which one was it? The
 * roots are scale degrees, so the triads are built by interval off the key's own
 * do and the whole rung transposes for free.
 */
function genWhichChord(ctx: ProviderContext, band: MusicBand): MusicQuestion {
  const degrees = [...MUSIC_CHORD_DEGREES];
  const root = fresh(degrees, ctx, (d) => itemKey(2, [d], "major"));
  const { id, tonic } = pickKey();

  // Unlike every other rung, do is not a scaffold here: "which chord of the key"
  // is unanswerable until the key has been stated, so the anchor never fades.
  const triad = triadFreqs(solfaFreq(tonic, root), "major");
  return {
    op: "music",
    stage: 2,
    solfa: [root],
    quality: "major",
    keyId: id,
    tonic,
    tones: [tonic, ...triad],
    play: [
      ...melodyPlan([tonic]),
      ...chordPlan(triad, { startMs: MELODY_NOTE_MS + ANCHOR_PAUSE_MS }),
    ],
    anchor: true,
    showHint: band.hint === true,
    // Left in scale order rather than shuffled: like the key glyphs, the three
    // chords keep one fixed slot each so the map is never relearned.
    options: degrees.map((d) => SOLFA_HE[d]),
    answer: SOLFA_HE[root],
  };
}

const STAGES = [1, 2, 3, 4, 5] as const;
const clampStage = (n: number) => (STAGES.includes(n as never) ? n : 1) as (typeof STAGES)[number];
const prompt = (n: number) => t(`music.ask.${clampStage(n)}`);
const saying = (n: number) => t(`music.say.${clampStage(n)}`);

export const musicProvider: StageProvider = {
  bands: MUSIC_BANDS,

  generate(ctx: ProviderContext): MusicQuestion {
    const band = diffParams<MusicBand>(ctx.curriculum, ctx.level, ctx.step);
    switch (band.stage ?? 1) {
      case 2:
        return genWhichChord(ctx, band);
      case 3:
        return genPickNote(ctx, band, 3);
      case 4:
        return genPickNote(ctx, band, 4);
      case 5:
        return genEchoPhrase(ctx, band);
      default:
        return genHappyOrSad(ctx, band);
    }
  },

  key(q) {
    const qq = q as MusicQuestion;
    return itemKey(qq.stage, qq.solfa, qq.quality);
  },

  render(q: Question): StageRender {
    const qq = q as MusicQuestion;
    const emojiOptions = qq.stage === 1;
    return {
      prompt: prompt(qq.stage),
      hint: musicHint(qq),
      options: qq.options,
      variant: emojiOptions ? "answerEng" : "answerFind",
    };
  },

  speak(q: Question): StageSpeak {
    const qq = q as MusicQuestion;
    const say = saying(qq.stage);
    return { he: qq.anchor ? t("music.anchorThen", { say }) : say };
  },
};

/** The faded support: present at a level's first band, gone from the next one. */
function musicHint(q: MusicQuestion): string | undefined {
  if (!q.showHint) return undefined;
  if (q.anchor) return t("music.anchor");
  if (q.stage === 1) return t("music.happySad", { happy: MUSIC_HAPPY, sad: MUSIC_SAD });
  return undefined;
}
