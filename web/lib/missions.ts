import { VOCAB, VOCAB_ORDER } from "@/data/vocab";
import { FIND_CATS, FIND_PACKS } from "@/data/find";
import { rnd, shuffle } from "@/lib/random";
import type { ArtDescriptor, CharacterDef } from "@/lib/types";
import { normArt } from "@/data/characters";
import { formForXp } from "@/lib/xp";
import { t, tGroup } from "@/lib/i18n";

/** Ways of asking for a mission item, each a `{{item}}` template in the locale file. */
export const MISSION_ASKS = ["find", "where", "tap", "findYou"] as const;

let _missionPool: { he: string; emoji: string }[] | null = null;

function missionPool() {
  if (_missionPool) return _missionPool;
  const pool: { he: string; emoji: string }[] = [];
  const seen: Record<string, boolean> = {};
  const add = (he: string, emoji: string) => {
    if (emoji && he && !seen[emoji]) {
      seen[emoji] = true;
      pool.push({ he, emoji });
    }
  };
  VOCAB_ORDER.forEach((t) => {
    VOCAB[t].words.forEach((w: { he: string; emoji: string }) => add(w.he, w.emoji));
  });
  FIND_CATS.forEach((cat) => {
    FIND_PACKS[cat].forEach((it) => add(it.he, it.emoji));
  });
  _missionPool = pool;
  return pool;
}

export type Mission = {
  target: string;
  options: string[];
  prompt: string;
  say: string;
  success: string;
};

const pickOne = <T,>(xs: T[]): T => xs[rnd(xs.length)];

export function nextMission(
  character: CharacterDef,
  currentFormArt: ArtDescriptor
): Mission {
  const pool = missionPool();
  if (rnd(5) === 0) {
    const others = shuffle(pool.filter((it) => it.emoji !== character.food));
    return {
      target: character.food,
      options: shuffle([character.food, others[0].emoji, others[1].emoji]),
      prompt: t("mission.feed", { name: character.he }),
      say: t("mission.feed", { name: character.he }),
      success: t("mission.fed", { name: character.he }),
    };
  }
  const item = pool[rnd(pool.length)];
  const rest = shuffle(pool.filter((it) => it.emoji !== item.emoji));
  const ask = MISSION_ASKS[rnd(MISSION_ASKS.length)];
  const prompt = t(`mission.ask.${ask}`, { item: item.he });
  return {
    target: item.emoji,
    options: shuffle([item.emoji, rest[0].emoji, rest[1].emoji]),
    prompt,
    say: prompt,
    success: pickOne(tGroup("mission.success")),
  };
}

export function currentFormArt(
  character: CharacterDef,
  totalXp: number
): ArtDescriptor {
  const fi = formForXp(totalXp || 0, character.forms.length);
  return normArt(character.forms[Math.min(fi, character.forms.length - 1)]);
}
