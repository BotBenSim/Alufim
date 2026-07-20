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
} as const;

export const GAME_ORDER: GameId[] = ["add", "find", "eng", "sub"];
