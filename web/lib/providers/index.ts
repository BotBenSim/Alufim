import type { GameId, Provider } from "@/lib/types";
import { addProvider } from "./add";
import { subProvider } from "./sub";
import { engProvider } from "./eng";
import { findProvider } from "./find";

export const PROVIDERS: Record<GameId, Provider> = {
  add: addProvider,
  sub: subProvider,
  eng: engProvider,
  find: findProvider,
};

export function getProvider(gameId: GameId): Provider {
  return PROVIDERS[gameId];
}
