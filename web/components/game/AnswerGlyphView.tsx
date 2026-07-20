import type { AnswerGlyph } from "@/lib/answerChoice";
import { cn } from "@/lib/utils";

/** Renders a game-agnostic answer glyph (emoji / text / color swatch). */
export function AnswerGlyphView({ glyph }: { glyph: AnswerGlyph }) {
  if (glyph.kind === "text") return <>{glyph.text}</>;
  if (glyph.kind === "emoji") return <>{glyph.emoji}</>;

  const light =
    glyph.color.toLowerCase() === "#f7fbff" || glyph.color.toLowerCase() === "#ffffff";
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-[0.72em] w-[0.72em] shrink-0 rounded-full shadow-[inset_0_-2px_0_rgba(0,0,0,.14)]",
        light && "border-[3px] border-[#C5D8EC]"
      )}
      style={{ background: glyph.color }}
    />
  );
}
