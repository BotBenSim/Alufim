import type { MinigameEngine, MinigameEngineId } from "./types";
import { meterBurstEngine } from "./meterBurst";
import { tapCollectEngine } from "./tapCollect";
import { catchEngine } from "./catch";
import { pathDashEngine } from "./pathDash";
import { timingBounceEngine } from "./timingBounce";
import { sliceSwipeEngine } from "./sliceSwipe";

export type {
  MinigameEngine,
  MinigameEngineId,
  MinigameSession,
  MinigameInput,
  MinigameOverlay,
  MinigameSkin,
  MinigameContext,
} from "./types";

export { ACTIVE_ENGINES } from "./types";
export { pickMinigameSkin, resetMinigameRecent } from "./pickMinigame";

export const MINIGAME_ENGINES: Record<MinigameEngineId, MinigameEngine> = {
  meterBurst: meterBurstEngine,
  tapCollect: tapCollectEngine,
  catch: catchEngine,
  pathDash: pathDashEngine,
  timingBounce: timingBounceEngine,
  sliceSwipe: sliceSwipeEngine,
};

export function getMinigameEngine(id: MinigameEngineId): MinigameEngine {
  return MINIGAME_ENGINES[id];
}
