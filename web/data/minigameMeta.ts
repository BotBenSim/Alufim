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
    title: "גגות העיר",
    icon: "🏙️",
    blurb: "קפצו בין גגות — לפעמים קפיצה כפולה",
    defaultEnabled: true,
  },
  {
    id: "timingBounce",
    title: "ריצת דינו",
    icon: "🦖",
    blurb: "ריצה בקצב קבוע — קקטוסים אחד אחרי השני במרווחים משתנים",
    defaultEnabled: true,
  },
  {
    id: "sliceSwipe",
    title: "נינג׳ה חטיפים",
    icon: "🥷",
    blurb: "החליקו וחתכו פירות ובשר באוויר",
    defaultEnabled: true,
  },
  {
    id: "slingShot",
    title: "האכלה בשיגור",
    icon: "🎯",
    blurb: "מתחו ושלחו חטיף אל החבר",
    defaultEnabled: true,
  },
  {
    id: "charMaze",
    title: "מבוך החבר",
    icon: "🧩",
    blurb: "החליקו או לחצו על החיצים — הגיעו ליציאה",
    defaultEnabled: true,
  },
  {
    id: "cutRope",
    title: "חיתוך החבל",
    icon: "🪢",
    blurb: "חתכו את החבל — החטיף נופל אל החבר",
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
