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

/** One flat list, ordered so games from the same subject sit next to each other. */
export const GAME_ORDER: GameId[] = [
  "add",
  "sub",
  "mul",
  "div",
  "hebread",
  "engread",
  "eng",
  "music",
  "find",
];
