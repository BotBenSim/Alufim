import type { GameId } from "@/lib/types";
import { PROVIDERS } from "@/lib/providers";
import { t } from "@/lib/i18n";

export const GAMES = {
  add: {
    get title() {
      return t("games.add.title");
    },
    icon: "➕",
    glyph: "+",
    get subtitle() {
      return t("games.add.subtitle");
    },
    cardClass: "add",
    provider: PROVIDERS.add,
  },
  sub: {
    get title() {
      return t("games.sub.title");
    },
    icon: "➖",
    glyph: "−",
    get subtitle() {
      return t("games.sub.subtitle");
    },
    cardClass: "sub",
    provider: PROVIDERS.sub,
  },
  nums: {
    get title() {
      return t("games.nums.title");
    },
    icon: "🔢",
    glyph: "123",
    get subtitle() {
      return t("games.nums.subtitle");
    },
    cardClass: "find",
    provider: PROVIDERS.nums,
  },
  mul: {
    get title() {
      return t("games.mul.title");
    },
    icon: "✖️",
    glyph: "×",
    get subtitle() {
      return t("games.mul.subtitle");
    },
    cardClass: "add",
    provider: PROVIDERS.mul,
  },
  div: {
    get title() {
      return t("games.div.title");
    },
    icon: "➗",
    glyph: "÷",
    get subtitle() {
      return t("games.div.subtitle");
    },
    cardClass: "sub",
    provider: PROVIDERS.div,
  },
  eng: {
    get title() {
      return t("games.eng.title");
    },
    icon: "🔤",
    glyph: "ABC",
    get subtitle() {
      return t("games.eng.subtitle");
    },
    cardClass: "eng",
    provider: PROVIDERS.eng,
  },
  hebread: {
    get title() {
      return t("games.hebread.title");
    },
    icon: "📖",
    glyph: "אב",
    get subtitle() {
      return t("games.hebread.subtitle");
    },
    cardClass: "find",
    provider: PROVIDERS.hebread,
  },
  engread: {
    get title() {
      return t("games.engread.title");
    },
    icon: "🅰️",
    glyph: "Aa",
    get subtitle() {
      return t("games.engread.subtitle");
    },
    cardClass: "eng",
    provider: PROVIDERS.engread,
  },
  music: {
    get title() {
      return t("games.music.title");
    },
    icon: "🎵",
    glyph: "♪",
    get subtitle() {
      return t("games.music.subtitle");
    },
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
    get title() {
      return t("gameGroups.math");
    },
    icon: "🔢",
    color: { from: "#FFB547", to: "#FF7A2F", edge: "#D9571A" },
    games: ["nums", "add", "sub", "mul", "div"],
  },
  {
    id: "reading",
    get title() {
      return t("gameGroups.reading");
    },
    icon: "📖",
    color: { from: "#8F8BFF", to: "#5E5CE6", edge: "#4240B8" },
    games: ["hebread", "engread", "eng"],
  },
  {
    id: "music",
    get title() {
      return t("gameGroups.music");
    },
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
