"use client";

import { Card } from "@/design-system";
import { GAMES, groupOfGame } from "@/data/games";
import type { GameId } from "@/lib/types";

type GameCardProps = {
  gameId: GameId;
  selected?: boolean;
  onClick: () => void;
};

export function GameCard({ gameId, selected, onClick }: GameCardProps) {
  const g = GAMES[gameId];
  const { color } = groupOfGame(gameId);
  // Long glyphs (123, ABC) step down so every tile reads at the same weight.
  const glyphSize =
    g.glyph.length > 2
      ? "text-[clamp(22px,6vw,32px)]"
      : g.glyph.length > 1
        ? "text-[clamp(28px,7.5vw,40px)]"
        : "text-[clamp(38px,10vw,54px)]";
  return (
    <Card variant="game" selected={selected} onClick={onClick}>
      <span
        className={`flex aspect-square min-h-0 w-[64%] flex-1 items-center justify-center rounded-[30%] font-bold leading-none text-white [direction:ltr] ${glyphSize}`}
        style={{
          background: `linear-gradient(180deg, ${color.from}, ${color.to})`,
          boxShadow: `inset 0 3px 0 rgba(255,255,255,.35), 0 4px 0 ${color.edge}`,
        }}
      >
        {g.glyph}
      </span>
      <span className="shrink-0">{g.title}</span>
    </Card>
  );
}
