import type { MinigameEngine, MinigameEngineId } from "./types";
import { pathDashEngine } from "./pathDash";
import { timingBounceEngine } from "./timingBounce";
import { sliceSwipeEngine } from "./sliceSwipe";
import { slingShotEngine } from "./slingShot";
import { charMazeEngine } from "./charMaze";
import { cutRopeEngine } from "./cutRope";

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
export {
  JUMP_CONFIG_BY_ENGINE,
  resolveJumpConfig,
  tryBeginJump,
  type JumpPlayConfig,
} from "./jumpConfig";

export const MINIGAME_ENGINES: Record<MinigameEngineId, MinigameEngine> = {
  pathDash: pathDashEngine,
  timingBounce: timingBounceEngine,
  sliceSwipe: sliceSwipeEngine,
  slingShot: slingShotEngine,
  charMaze: charMazeEngine,
  cutRope: cutRopeEngine,
};

export function getMinigameEngine(id: MinigameEngineId): MinigameEngine {
  return MINIGAME_ENGINES[id];
}
