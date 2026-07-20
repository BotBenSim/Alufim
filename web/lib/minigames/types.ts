import type { CharacterDef } from "@/lib/types";
import type { JumpPlayConfig } from "./jumpConfig";

export type MinigameEngineId =
  | "pathDash"
  | "timingBounce"
  | "sliceSwipe"
  | "slingShot"
  | "charMaze"
  | "cutRope";

/** Engines currently offered on the play beat. */
export const ACTIVE_ENGINES: readonly MinigameEngineId[] = [
  "pathDash",
  "timingBounce",
  "sliceSwipe",
  "slingShot",
  "charMaze",
  "cutRope",
] as const;

export type MinigameSkin = {
  id: string;
  engineId: MinigameEngineId;
  characterTags: string[];
  promptHe: string;
  items: string[];
  /** collects / good hits needed to complete */
  targetCount?: number;
  /**
   * Optional per-skin jump feel overrides (double jump, pace, gaps…).
   * Merged onto `JUMP_CONFIG_BY_ENGINE[engineId]`.
   */
  jump?: Partial<JumpPlayConfig>;
};

export type MinigameContext = {
  characterId: string;
  character: CharacterDef;
  skin: MinigameSkin;
};

export type MinigameInput = {
  type: "action";
  action: "jump" | "hop" | "slice" | "launch" | "step" | "cut";
  targetId?: string;
  quality: "good" | "miss";
};

export type MinigameSession = {
  engineId: MinigameEngineId;
  skinId: string;
  promptHe: string;
  state: unknown;
  progress: number;
  complete: boolean;
};

export type MinigameEngine = {
  id: MinigameEngineId;
  start: (ctx: MinigameContext) => MinigameSession;
  applyInput: (session: MinigameSession, input: MinigameInput) => MinigameSession;
  isComplete: (session: MinigameSession) => boolean;
};

export type MinigameOverlay = {
  engineId: MinigameEngineId;
  session: MinigameSession;
  done: boolean;
  /** True when launched from profile settings for debugging — no XP / no run step */
  preview?: boolean;
  /** Character used for skins + art during preview */
  previewCharacterId?: string;
};
