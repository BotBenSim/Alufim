import type { MinigameEngineId } from "@/lib/minigames/types";
import { ACTIVE_ENGINES } from "@/lib/minigames/types";
import { t } from "@/lib/i18n";

export type MinigameMeta = {
  id: MinigameEngineId;
  title: string;
  icon: string;
  blurb: string;
  /** On for new profiles / migration defaults */
  defaultEnabled: boolean;
};

/** Catalog for settings UI — order is display order. */
export const MINIGAME_META: MinigameMeta[] = [
  {
    id: "pathDash",
    get title() {
      return t("minigame.meta.pathDash.title");
    },
    icon: "🏙️",
    get blurb() {
      return t("minigame.meta.pathDash.blurb");
    },
    defaultEnabled: true,
  },
  {
    id: "timingBounce",
    get title() {
      return t("minigame.meta.timingBounce.title");
    },
    icon: "🌵",
    get blurb() {
      return t("minigame.meta.timingBounce.blurb");
    },
    defaultEnabled: true,
  },
  {
    id: "sliceSwipe",
    get title() {
      return t("minigame.meta.sliceSwipe.title");
    },
    icon: "🍎",
    get blurb() {
      return t("minigame.meta.sliceSwipe.blurb");
    },
    defaultEnabled: true,
  },
  {
    id: "slingShot",
    get title() {
      return t("minigame.meta.slingShot.title");
    },
    icon: "🎯",
    get blurb() {
      return t("minigame.meta.slingShot.blurb");
    },
    defaultEnabled: true,
  },
  {
    id: "charMaze",
    get title() {
      return t("minigame.meta.charMaze.title");
    },
    icon: "🧩",
    get blurb() {
      return t("minigame.meta.charMaze.blurb");
    },
    defaultEnabled: false,
  },
  {
    id: "cutRope",
    get title() {
      return t("minigame.meta.cutRope.title");
    },
    icon: "🍬",
    get blurb() {
      return t("minigame.meta.cutRope.blurb");
    },
    defaultEnabled: false,
  },
  {
    id: "laneCatch",
    get title() {
      return t("minigame.meta.laneCatch.title");
    },
    icon: "🍗",
    get blurb() {
      return t("minigame.meta.laneCatch.blurb");
    },
    defaultEnabled: true,
  },
];

export const MINIGAME_ORDER: MinigameEngineId[] = MINIGAME_META.map((m) => m.id);

export function defaultMinigameConfig(): Record<MinigameEngineId, { enabled: boolean }> {
  const out = {} as Record<MinigameEngineId, { enabled: boolean }>;
  for (const m of MINIGAME_META) {
    out[m.id] = { enabled: m.defaultEnabled };
  }
  return out;
}

export function enabledMinigameIds(
  cfg: Record<MinigameEngineId, { enabled: boolean }> | undefined | null
): MinigameEngineId[] {
  const base = cfg ?? defaultMinigameConfig();
  const on = MINIGAME_ORDER.filter((id) => base[id]?.enabled);
  return on.length ? on : [...ACTIVE_ENGINES];
}
