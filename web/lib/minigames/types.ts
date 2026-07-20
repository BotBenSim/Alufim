import type { CharacterDef } from "@/lib/types";

export type MinigameEngineId =
  | "tapCollect"
  | "catch"
  | "pathDash"
  | "timingBounce"
  | "meterBurst"
  | "sliceSwipe";

/** Engines currently offered on the play beat (others stay registered but not picked). */
export const ACTIVE_ENGINES: readonly MinigameEngineId[] = [
  "pathDash",
  "timingBounce",
  "sliceSwipe",
] as const;

export type MinigameSkin = {
  id: string;
  engineId: MinigameEngineId;
  characterTags: string[];
  promptHe: string;
  items: string[];
  /** collects / good hits needed to complete */
  targetCount?: number;
};

export type MinigameContext = {
  characterId: string;
  character: CharacterDef;
  skin: MinigameSkin;
};

export type MinigameInput =
  | { type: "tap"; targetId?: string; x?: number; y?: number }
  | { type: "swipe"; x0: number; y0: number; x1: number; y1: number }
  | { type: "hold"; active: boolean }
  | { type: "tick"; t: number }
  | {
      type: "action";
      action: "jump" | "hop" | "slice";
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
