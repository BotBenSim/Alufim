import { diffParams } from "@/lib/difficulty";
import { MUSIC_BANDS, PENTATONIC } from "@/data/music";
import { rnd, shuffle } from "@/lib/random";
import type { ProviderContext, Question } from "@/lib/types";
import type { StageProvider, StageRender, StageSpeak } from "./stage";

export type MusicQuestion = Question & {
  op: "music";
  stage: number;
  /** Frequencies to play when the question appears, in order. */
  tones: number[];
  answer: string;
};

/**
 * Stage 1 only so far — two tones play, was the second higher or lower? Audio
 * playback is wired by the host; `tones` is what it should sound.
 *
 * Stages 2–5 (which note, note name, echo a phrase, happy/sad chord) need the
 * keyboard surface — see backlog/music-ear-and-chords-game.md.
 */
function genHighOrLow(_ctx: ProviderContext): MusicQuestion {
  const [a, b] = shuffle([...PENTATONIC]).slice(0, 2);
  const up = b.freq > a.freq;
  return {
    op: "music",
    stage: 1,
    tones: [a.freq, b.freq],
    options: ["⬆️", "⬇️"],
    answer: up ? "⬆️" : "⬇️",
  };
}

export const musicProvider: StageProvider = {
  bands: MUSIC_BANDS,

  generate(ctx: ProviderContext): MusicQuestion {
    const p = diffParams<{ stage?: number }>(ctx.curriculum, ctx.level, ctx.step);
    switch (p.stage ?? 1) {
      default:
        return genHighOrLow(ctx);
    }
  },

  key(q) {
    const qq = q as MusicQuestion;
    return `music:${qq.stage}:${qq.tones.join("-")}:${rnd(1)}`;
  },

  render(q: Question): StageRender {
    const qq = q as MusicQuestion;
    return {
      prompt: "הצליל השני עלה או ירד?",
      hint: "👆",
      options: qq.options as string[],
      variant: "answerFind",
    };
  },

  speak(): StageSpeak {
    return { he: "הקשיבו לשני הצלילים" };
  },
};
