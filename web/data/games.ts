import type { GameId } from "@/lib/types";
import { PROVIDERS } from "@/lib/providers";

export const GAMES = {
  add: {
    title: "חיבור",
    icon: "➕",
    subtitle: "לחבר מספרים",
    cardClass: "add",
    provider: PROVIDERS.add,
  },
  sub: {
    title: "חיסור",
    icon: "➖",
    subtitle: "להוריד מספרים",
    cardClass: "sub",
    provider: PROVIDERS.sub,
  },
  eng: {
    title: "אנגלית",
    icon: "🔤",
    subtitle: "מילים באנגלית",
    cardClass: "eng",
    provider: PROVIDERS.eng,
  },
  find: {
    title: "מצא את...",
    icon: "🔍",
    subtitle: "אותיות, חשיבה, כמויות וצלילים",
    cardClass: "find",
    provider: PROVIDERS.find,
  },
  hebread: {
    title: "קריאה בעברית",
    icon: "📖",
    subtitle: "מצליל לאות למילה",
    cardClass: "find",
    provider: PROVIDERS.hebread,
  },
  engread: {
    title: "קריאה באנגלית",
    icon: "🅰️",
    subtitle: "sound it out",
    cardClass: "eng",
    provider: PROVIDERS.engread,
  },
  music: {
    title: "מוזיקה",
    icon: "🎵",
    subtitle: "לשמוע, לנגן, לקרוא תווים",
    cardClass: "sub",
    provider: PROVIDERS.music,
  },
} as const;

/**
 * Games are shown by subject, not as one long list. Ordering lives here so the
 * home screen and the parent settings list can never drift apart.
 */
export const GAME_GROUPS: { id: string; title: string; games: GameId[] }[] = [
  { id: "math", title: "מתמטיקה", games: ["add", "sub"] },
  { id: "hebrew", title: "עברית", games: ["hebread"] },
  { id: "english", title: "אנגלית", games: ["engread", "eng"] },
  { id: "music", title: "מוזיקה", games: ["music"] },
  { id: "general", title: "כללי", games: ["find"] },
];

export const GAME_ORDER: GameId[] = GAME_GROUPS.flatMap((g) => g.games);
