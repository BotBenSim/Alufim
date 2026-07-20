import type { MinigameEngineId } from "@/lib/minigames/types";
import type { MinigameSfx } from "@/hooks/useAudio";
import { CharMazeView } from "./CharMazeView";
import { CutRopeView } from "./CutRopeView";
import { PathDashView } from "./PathDashView";
import { SliceSwipeView } from "./SliceSwipeView";
import { SlingShotView } from "./SlingShotView";
import { TimingBounceView } from "./TimingBounceView";
import type { MinigameViewStrategy } from "./types";

export type MinigameUiStrategy = {
  View: MinigameViewStrategy;
  /** Sound when a successful beat scores */
  goodSfx: MinigameSfx;
  /** Sound when a soft miss happens */
  missSfx: MinigameSfx;
};

/**
 * UI strategy registry — one entry per engine.
 * Host looks up by engineId (no switch). Add view here when adding an engine.
 */
export const MINIGAME_UI: Record<MinigameEngineId, MinigameUiStrategy> = {
  pathDash: { View: PathDashView, goodSfx: "land", missSfx: "bonk" },
  timingBounce: { View: TimingBounceView, goodSfx: "land", missSfx: "bonk" },
  sliceSwipe: { View: SliceSwipeView, goodSfx: "slice", missSfx: "miss" },
  slingShot: { View: SlingShotView, goodSfx: "pop", missSfx: "miss" },
  charMaze: { View: CharMazeView, goodSfx: "pop", missSfx: "bonk" },
  cutRope: { View: CutRopeView, goodSfx: "pop", missSfx: "miss" },
};
