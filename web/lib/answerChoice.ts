/**
 * Game-agnostic answer button content. Providers map their options into this;
 * the view only knows how to draw a glyph — never a specific game id.
 */
export type AnswerGlyph =
  | { kind: "text"; text: string }
  | { kind: "emoji"; emoji: string }
  | { kind: "swatch"; color: string };

export type AnswerChoice = {
  value: string;
  glyph: AnswerGlyph;
};
