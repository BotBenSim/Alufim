import type { MinigameEngineId } from "@/lib/minigames/types";
import { ACTIVE_ENGINES } from "@/lib/minigames/types";

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
    title: "גג לגג",
    icon: "🏙️",
    blurb: "קפצו בין הגגות ותפסו פרסים",
    defaultEnabled: true,
  },
  {
    id: "timingBounce",
    title: "דילוג קקטוס",
    icon: "🌵",
    blurb: "לחצו בזמן וקפצו מעל הקקטוסים",
    defaultEnabled: true,
  },
  {
    id: "sliceSwipe",
    title: "סופת חטיפים",
    icon: "🍎",
    blurb: "החליקו וחתכו חטיפים שעפים באוויר",
    defaultEnabled: true,
  },
  {
    id: "slingShot",
    title: "תאכילו אותי",
    icon: "🎯",
    blurb: "מתחו ושלחו חטיף ישר לחבר",
    defaultEnabled: true,
  },
  {
    id: "charMaze",
    title: "מבוך",
    icon: "🧩",
    blurb: "הובילו את החבר עד היציאה",
    defaultEnabled: true,
  },
  {
    id: "cutRope",
    title: "חטיף על חבל",
    icon: "🍬",
    blurb: "חתכו את החבל — החטיף נופל לפה",
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
