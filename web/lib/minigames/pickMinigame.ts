import { MINIGAME_SKINS } from "@/data/minigames";
import { rnd } from "@/lib/random";
import { ACTIVE_ENGINES, type MinigameEngineId, type MinigameSkin } from "./types";

const recentSkinIds: string[] = [];
const RECENT_LIMIT = 4;

export function resetMinigameRecent(): void {
  recentSkinIds.length = 0;
}

/**
 * Prefer skins tagged for the character; avoid the last few skin ids.
 * `enabledEngines` comes from the profile settings (falls back to ACTIVE_ENGINES).
 */
export function pickMinigameSkin(
  characterId: string,
  engineFilter?: MinigameEngineId | null,
  enabledEngines?: readonly MinigameEngineId[] | null
): MinigameSkin {
  const allow =
    enabledEngines && enabledEngines.length
      ? new Set(enabledEngines)
      : new Set(ACTIVE_ENGINES);

  let pool = MINIGAME_SKINS.filter((s) => {
    if (engineFilter) return s.engineId === engineFilter;
    return allow.has(s.engineId);
  });
  if (!pool.length && engineFilter) {
    pool = MINIGAME_SKINS.filter((s) => s.engineId === engineFilter);
  }
  if (!pool.length) {
    pool = MINIGAME_SKINS.filter((s) => ACTIVE_ENGINES.includes(s.engineId));
  }

  const tagged = pool.filter((s) => s.characterTags.includes(characterId));
  let candidates = tagged.length ? tagged : pool;

  const fresh = candidates.filter((s) => !recentSkinIds.includes(s.id));
  if (fresh.length) candidates = fresh;

  const skin = candidates[rnd(candidates.length)] ?? pool[0];
  recentSkinIds.push(skin.id);
  while (recentSkinIds.length > RECENT_LIMIT) recentSkinIds.shift();
  return skin;
}
