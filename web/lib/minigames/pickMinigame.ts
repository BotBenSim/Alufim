import { MINIGAME_SKINS } from "@/data/minigames";
import { rnd } from "@/lib/random";
import { ACTIVE_ENGINES, type MinigameEngineId, type MinigameSkin } from "./types";

const recentEngineIds: MinigameEngineId[] = [];
const RECENT_ENGINE_LIMIT = 2;

export function resetMinigameRecent(): void {
  recentEngineIds.length = 0;
}

/**
 * Pick uniformly among enabled engines (avoiding recent ones), then a skin for
 * that engine. Prefer character-tagged skins; fall back to any skin for the engine.
 *
 * Important: do NOT pick among character-tagged skins first — animals with fewer
 * skins (e.g. dragon) would otherwise over-play slingShot.
 */
export function pickMinigameSkin(
  characterId: string,
  engineFilter?: MinigameEngineId | null,
  enabledEngines?: readonly MinigameEngineId[] | null
): MinigameSkin {
  const allow =
    enabledEngines && enabledEngines.length ? [...enabledEngines] : [...ACTIVE_ENGINES];

  // Keep only engines that actually have skins in the catalog.
  const withSkins = allow.filter((id) =>
    MINIGAME_SKINS.some((s) => s.engineId === id)
  );
  const enginePool = withSkins.length ? withSkins : [...ACTIVE_ENGINES];

  let engineId: MinigameEngineId;
  if (engineFilter) {
    engineId = engineFilter;
  } else {
    const fresh = enginePool.filter((id) => !recentEngineIds.includes(id));
    const pickFrom = fresh.length ? fresh : enginePool;
    engineId = pickFrom[rnd(pickFrom.length)] ?? enginePool[0];
  }

  const forEngine = MINIGAME_SKINS.filter((s) => s.engineId === engineId);
  const tagged = forEngine.filter((s) => s.characterTags.includes(characterId));
  const candidates = tagged.length ? tagged : forEngine;
  const skin = candidates[rnd(candidates.length)] ?? forEngine[0] ?? MINIGAME_SKINS[0];

  if (!engineFilter) {
    recentEngineIds.push(skin.engineId);
    while (recentEngineIds.length > RECENT_ENGINE_LIMIT) recentEngineIds.shift();
  }
  return skin;
}
