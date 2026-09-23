import type { GameId } from "@/lib/types";
import { PROVIDERS } from "@/lib/providers";

export const GAMES = {
  add: {
    title: "חיבור",
    icon: "➕",
    glyph: "+",
    subtitle: "לחבר מספרים",
    cardClass: "add",
    provider: PROVIDERS.add,
  },
  sub: {
    title: "חיסור",
    icon: "➖",
    glyph: "−",
    subtitle: "להוריד מספרים",
    cardClass: "sub",
    provider: PROVIDERS.sub,
  },
  nums: {
    title: "מספרים",
    icon: "🔢",
    glyph: "123",
    subtitle: "לספור ולהכיר ספרות",
    cardClass: "find",
    provider: PROVIDERS.nums,
  },
  mul: {
    title: "כפל",
    icon: "✖️",
    glyph: "×",
    subtitle: "קבוצות שוות",
    cardClass: "add",
    provider: PROVIDERS.mul,
  },
  div: {
    title: "חילוק",
    icon: "➗",
    glyph: "÷",
    subtitle: "לחלק שווה בשווה",
    cardClass: "sub",
    provider: PROVIDERS.div,
  },
  eng: {
    title: "אנגלית",
    icon: "🔤",
    glyph: "ABC",
    subtitle: "מילים באנגלית",
    cardClass: "eng",
    provider: PROVIDERS.eng,
  },
  hebread: {
    title: "קריאה בעברית",
    icon: "📖",
    glyph: "אב",
    subtitle: "מצליל לאות למילה",
    cardClass: "find",
    provider: PROVIDERS.hebread,
  },
  engread: {
    title: "קריאה באנגלית",
    icon: "🅰️",
    glyph: "Aa",
    subtitle: "sound it out",
    cardClass: "eng",
    provider: PROVIDERS.engread,
  },
  music: {
    title: "מוזיקה",
    icon: "🎵",
    glyph: "♪",
    subtitle: "לשמוע, לנגן, לקרוא תווים",
    cardClass: "sub",
    provider: PROVIDERS.music,
  },
} as const;

export type GameGroup = {
  id: string;
  title: string;
  icon: string;
  /** Tile gradient (top → bottom) and the darker edge under it. */
  color: { from: string; to: string; edge: string };
  games: GameId[];
};

/** Home-screen groups, by subject. Order here is the order everywhere. */
export const GAME_GROUPS: GameGroup[] = [
  {
    id: "math",
    title: "חשבון",
    icon: "🔢",
    color: { from: "#FFB547", to: "#FF7A2F", edge: "#D9571A" },
    games: ["nums", "add", "sub", "mul", "div"],
  },
  {
    id: "reading",
    title: "קריאה ושפה",
    icon: "📖",
    color: { from: "#8F8BFF", to: "#5E5CE6", edge: "#4240B8" },
    games: ["hebread", "engread", "eng"],
  },
  {
    id: "music",
    title: "מוזיקה",
    icon: "🎵",
    color: { from: "#FF8DC7", to: "#EC4899", edge: "#BE2A76" },
    games: ["music"],
  },
];

export function groupOfGame(id: GameId): GameGroup {
  return GAME_GROUPS.find((g) => g.games.includes(id)) ?? GAME_GROUPS[0];
}

/** One flat list, ordered so games from the same subject sit next to each other. */
export const GAME_ORDER: GameId[] = GAME_GROUPS.flatMap((g) => g.games);
