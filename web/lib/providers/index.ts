import type { GameId, Provider } from "@/lib/types";
import { addProvider } from "./add";
import { subProvider } from "./sub";
import { mulProvider } from "./mul";
import { divProvider } from "./div";
import { engProvider } from "./eng";
import { numsProvider } from "./nums";
import { hebreadProvider } from "./hebread";
import { engreadProvider } from "./engread";
import { musicProvider } from "./music";
import type { StageProvider } from "./stage";

/**
 * Stage-ladder games. They all render and speak through one shared branch, so a
 * new one only needs its own data + provider file.
 */
export const STAGE_PROVIDERS = {
  nums: numsProvider,
  hebread: hebreadProvider,
  engread: engreadProvider,
  music: musicProvider,
} as const satisfies Partial<Record<GameId, StageProvider>>;

export type StageGameId = keyof typeof STAGE_PROVIDERS;

export function isStageGame(op: unknown): op is StageGameId {
  return typeof op === "string" && op in STAGE_PROVIDERS;
}

export const PROVIDERS: Record<GameId, Provider> = {
  add: addProvider,
  sub: subProvider,
  mul: mulProvider,
  div: divProvider,
  eng: engProvider,
  ...STAGE_PROVIDERS,
};

export function getProvider(gameId: GameId): Provider {
  return PROVIDERS[gameId];
}
