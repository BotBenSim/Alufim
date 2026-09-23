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
  nums: {
    title: "מספרים",
    icon: "🔢",
    subtitle: "לספור ולהכיר ספרות",
    cardClass: "find",
    provider: PROVIDERS.nums,
  },
  mul: {
    title: "כפל",
    icon: "✖️",
    subtitle: "קבוצות שוות",
    cardClass: "add",
    provider: PROVIDERS.mul,
  },
  div: {
    title: "חילוק",
    icon: "➗",
    subtitle: "לחלק שווה בשווה",
    cardClass: "sub",
    provider: PROVIDERS.div,
  },
  eng: {
    title: "אנגלית",
    icon: "🔤",
    subtitle: "מילים באנגלית",
    cardClass: "eng",
    provider: PROVIDERS.eng,
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

/** Home-screen groups, by subject. Order here is the order everywhere. */
export const GAME_GROUPS: { id: string; title: string; icon: string; games: GameId[] }[] = [
  { id: "math", title: "חשבון", icon: "🔢", games: ["nums", "add", "sub", "mul", "div"] },
  { id: "reading", title: "קריאה ושפה", icon: "📖", games: ["hebread", "engread", "eng"] },
  { id: "music", title: "מוזיקה", icon: "🎵", games: ["music"] },
];

/** One flat list, ordered so games from the same subject sit next to each other. */
export const GAME_ORDER: GameId[] = GAME_GROUPS.flatMap((g) => g.games);
