import { CHARACTERS } from "@/data/characters";
import { GAME_ORDER } from "@/data/games";
import type { AppState, GameId, Profile } from "./types";

export const STATE_KEY = "alufim_state_v2";

export function defaultGames(): Profile["games"] {
  return {
    find: { enabled: true, level: "easy" },
    add: { enabled: true, level: "easy" },
    sub: { enabled: true, level: "easy" },
    eng: { enabled: false, level: "easy" },
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
    characters: chars,
    activeCharacterId: null,
  };
}

export function migrateProfile(p: Profile): Profile {
  if (!p.games) p.games = defaultGames();
  GAME_ORDER.forEach((g) => {
    if (!p.games[g]) p.games[g] = { enabled: g !== "eng", level: "easy" };
    if (!p.games[g].level) p.games[g].level = "easy";
  });
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
    { name: "אלי", avatar: photos.ellie, eng: false },
    { name: "איתן", avatar: photos.ethan, eng: true },
    { name: "נובה", avatar: photos.nova, eng: true },
    { name: "יוני", avatar: photos.uni, eng: false },
  ];
  presets.forEach((pr) => {
    const p = newProfile(pr.name, pr.avatar);
    p.games.eng.enabled = pr.eng;
    state.profiles.push(p);
  });
  return state;
}

export function createDefaultState(photos: Record<string, string>): AppState {
  const state: AppState = { version: 2, profiles: [], lastProfileId: null };
  return seedPresetProfiles(state, photos);
}

export function parseStoredState(raw: string | null, photos: Record<string, string>): AppState {
  let st: AppState | null = null;
  try {
    if (raw) st = JSON.parse(raw) as AppState;
  } catch {
    st = null;
  }
  if (!st?.profiles) st = { version: 2, profiles: [], lastProfileId: null };
  st.profiles = st.profiles.map(migrateProfile);
  if (!st.profiles.length) seedPresetProfiles(st, photos);
  return st;
}

export function isImgAvatar(a: string): boolean {
  return typeof a === "string" && a.startsWith("data:");
}
