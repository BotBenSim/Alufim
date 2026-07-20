import { CHARACTERS } from "@/data/characters";
import { GAME_ORDER } from "@/data/games";
import { defaultMinigameConfig, MINIGAME_ORDER } from "@/data/minigameMeta";
import { defaultCurriculum, ensureCurriculum } from "./difficulty";
import { clampPlayEverySteps, DEFAULT_PLAY_EVERY_STEPS } from "./rhythm";
import type { AppState, GameId, Profile } from "./types";

export const STATE_KEY = "alufim_state_v2";

export function defaultGames(): Profile["games"] {
  return {
    find: { enabled: true, level: "easy", curriculum: defaultCurriculum("find") },
    add: { enabled: true, level: "easy", curriculum: defaultCurriculum("add") },
    sub: { enabled: true, level: "easy", curriculum: defaultCurriculum("sub") },
    eng: { enabled: true, level: "easy", curriculum: defaultCurriculum("eng") },
  };
}

export function newProfile(name: string, avatar: string): Profile {
  const chars: Profile["characters"] = {};
  CHARACTERS.forEach((c) => {
    if (c.starter) chars[c.id] = { form: 0, totalXp: 0 };
  });
  return {
    id: `p${Date.now()}_${Math.floor(Math.random() * 99999)}`,
    name: name || "ילד/ה",
    avatar: avatar || "🙂",
    games: defaultGames(),
    minigames: defaultMinigameConfig(),
    playEverySteps: DEFAULT_PLAY_EVERY_STEPS,
    characters: chars,
    activeCharacterId: null,
  };
}

export function migrateProfile(p: Profile): Profile {
  if (!p.games) p.games = defaultGames();
  GAME_ORDER.forEach((g: GameId) => {
    if (!p.games[g]) {
      p.games[g] = {
        enabled: true,
        level: "easy",
        curriculum: defaultCurriculum(g),
      };
    }
    if (!p.games[g].level) p.games[g].level = "easy";
    p.games[g].curriculum = ensureCurriculum(g, p.games[g].curriculum);
  });
  // Rebuild from known engines only — drops removed stub ids (tapCollect/catch/meterBurst)
  const defaults = defaultMinigameConfig();
  const prev = p.minigames;
  const next = { ...defaults };
  if (prev) {
    for (const id of MINIGAME_ORDER) {
      if (prev[id]) next[id] = { ...prev[id] };
    }
  }
  p.minigames = next;
  p.playEverySteps = clampPlayEverySteps(
    p.playEverySteps ?? DEFAULT_PLAY_EVERY_STEPS
  );
  if (!p.characters) p.characters = {};
  CHARACTERS.forEach((c) => {
    if (c.starter && !p.characters[c.id]) {
      p.characters[c.id] = { form: 0, totalXp: 0 };
    }
  });
  if (!p.avatar) p.avatar = "🙂";
  return p;
}

export function seedPresetProfiles(state: AppState, photos: Record<string, string>): AppState {
  const presets = [
    { name: "אלי", avatar: photos.ellie },
    { name: "איתן", avatar: photos.ethan },
    { name: "נובה", avatar: photos.nova },
    { name: "יוני", avatar: photos.uni },
  ];
  presets.forEach((pr) => {
    state.profiles.push(newProfile(pr.name, pr.avatar));
  });
  return state;
}

export function createDefaultState(photos: Record<string, string>): AppState {
  const state: AppState = { version: 2, profiles: [], lastProfileId: null };
  return seedPresetProfiles(state, photos);
}

export function parseStoredState(raw: string | null, photos: Record<string, string>): AppState {
  const st = readAppState(raw);
  if (!st) {
    const empty: AppState = { version: 2, profiles: [], lastProfileId: null };
    return seedPresetProfiles(empty, photos);
  }
  st.profiles = st.profiles.map(migrateProfile);
  if (!st.profiles.length) seedPresetProfiles(st, photos);
  return st;
}

/** Read AppState from localStorage — supports vanilla flat JSON and zustand-wrapped blobs */
export function readAppState(raw: string | null): AppState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (Array.isArray(parsed.profiles)) {
      return parsed as unknown as AppState;
    }
    const wrapped = parsed.state as { app?: AppState } | undefined;
    if (wrapped?.app && Array.isArray(wrapped.app.profiles)) {
      return wrapped.app;
    }
    if (parsed.app && Array.isArray((parsed.app as AppState).profiles)) {
      return parsed.app as AppState;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Write vanilla AppState JSON (same shape as index.html saveState) */
export function writeAppState(app: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATE_KEY, JSON.stringify(app));
}

export function isImgAvatar(a: string): boolean {
  return typeof a === "string" && a.startsWith("data:");
}
