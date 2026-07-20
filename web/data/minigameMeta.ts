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
    blurb: "רוצו וקפצו בין גגות גורדי שחקים",
    defaultEnabled: true,
  },
  {
    id: "timingBounce",
    title: "ריצת דינו",
    icon: "🦖",
    blurb: "כמו בלי אינטרנט — קפצו מעל קקטוסים",
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
    id: "tapCollect",
    title: "איסוף",
    icon: "✨",
    blurb: "לחצו על ניצוצות במסך (פשוט)",
    defaultEnabled: false,
  },
  {
    id: "catch",
    title: "תפיסה",
    icon: "🤲",
    blurb: "תפסו חטיפים נופלים (פשוט)",
    defaultEnabled: false,
  },
  {
    id: "meterBurst",
    title: "שאגה / עידוד",
    icon: "📣",
    blurb: "לחצו שוב ושוב למלא מד (פשוט)",
    defaultEnabled: false,
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
