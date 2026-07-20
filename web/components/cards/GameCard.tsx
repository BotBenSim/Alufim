"use client";

import { Card, CardBig } from "@/design-system";
import { GAMES } from "@/data/games";
import type { GameId } from "@/lib/types";

type GameCardProps = {
  gameId: GameId;
  selected?: boolean;
  onClick: () => void;
};

export function GameCard({ gameId, selected, onClick }: GameCardProps) {
  const g = GAMES[gameId];
  return (
    <Card variant="game" selected={selected} onClick={onClick}>
      <CardBig>{g.icon}</CardBig>
      <span>{g.title}</span>
    </Card>
  );
}
