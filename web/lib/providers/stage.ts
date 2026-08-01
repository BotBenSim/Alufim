import type { DifficultyBand, DifficultyLevel, Provider, Question } from "@/lib/types";

/**
 * Shared contract for the stage-ladder games (Hebrew reading, English reading,
 * music). Every stage in those tracks is a pick-one question, so they all render
 * through one branch in `QuestionView` and speak through one branch in
 * `speakQuestion` — a track only has to supply its own atoms, bands and stages.
 *
 * See knowledge/educational/track-skill-ladders.md for the seven stages and
 * knowledge/technical/curriculum-tracks.md for where this is heading.
 */
export type StageRender = {
  /** Big line at the top of the card. */
  prompt: string;
  /** Small line under it. */
  hint?: string;
  /** Button labels; the tapped label is compared against `Question.answer`. */
  options: string[];
  /**
   * `answerFind` for glyphs/letters, `answerEng` for a single emoji/picture,
   * `answerGroup` for a whole set of emoji that needs room to wrap.
   */
  variant: "answerFind" | "answerEng" | "answerGroup";
};

/** What to say when the question appears. Hebrew and English are spoken separately. */
export type StageSpeak = { he?: string; en?: string };

export type StageProvider = Provider & {
  /** Factory difficulty bands, one entry per stage. Content lives in `data/`. */
  bands: Record<DifficultyLevel, DifficultyBand[]>;
  render: (q: Question) => StageRender;
  speak: (q: Question) => StageSpeak;
};
