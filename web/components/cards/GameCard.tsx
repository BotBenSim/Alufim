"use client";

import { Card, CardBig, CardSub } from "@/design-system";
import { GAMES, type GameId } from "@/data/games";

type GameCardProps = {
  gameId: GameId;
  selected?: boolean;
  onClick: () => void;
};

export function GameCard({ gameId, selected, onClick }: GameCardProps) {
  const g = GAMES[gameId];
  return (
    <Card
      variant={g.cardClass as "add" | "sub" | "eng" | "find"}
      selected={selected}
      onClick={onClick}
      className="bg-white text-heading"
    >
      <CardBig>{g.icon}</CardBig>
      <span>{g.title}</span>
      <CardSub className="text-[#3E6E96]">{g.subtitle}</CardSub>
    </Card>
  );
}
