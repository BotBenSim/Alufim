export type DifficultyLevel = "easy" | "medium" | "hard";
export type GameId = "add" | "sub" | "find" | "eng";
export type BeatType = "learn" | "mission" | "play";
export type RunPhase = "learn" | "mission" | "play" | "evolve";

export type ArtDescriptor =
  | { type: "emoji"; value: string }
  | { type: "image"; src: string; fallback?: string };

export type CharacterDef = {
  id: string;
  he: string;
  en: string;
  forms: readonly ArtDescriptor[];
  sky: string;
  ground: string;
  accent: string;
  counts: string;
  food: string;
  reward: { title: string; emoji: string };
  cheer: string;
  starter?: boolean;
};

export type CharProgress = { form: number; totalXp: number };

export type GameConfig = { enabled: boolean; level: DifficultyLevel };

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  games: Record<GameId, GameConfig>;
  characters: Record<string, CharProgress>;
  activeCharacterId: string | null;
};

export type AppState = {
  version: number;
  profiles: Profile[];
  lastProfileId: string | null;
};

export type RhythmPreset = {
  round: number;
  feedTaps: number;
  beats: { every: number; type: BeatType }[];
};

export type ScreenId =
  | "profiles"
  | "profileEdit"
  | "about"
  | "game";

export type Question = Record<string, unknown> & {
  op: GameId | "find";
  answer: unknown;
};

export type ProviderContext = {
  gameId: GameId;
  level: DifficultyLevel;
  step: number;
  usedKeys: string[];
  recent: { key: string; correct: boolean; hadWrongAttempt: boolean }[];
  countEmoji: string;
};

export type Provider = {
  generate: (ctx: ProviderContext) => Question;
  key: (q: Question) => string;
};

export type RunState = {
  character: CharacterDef;
  gameId: GameId;
  level: DifficultyLevel;
  preset: RhythmPreset;
  step: number;
  usedKeys: string[];
  completed: ProviderContext["recent"];
  mistakes: number;
  hadWrong: boolean;
  current: Question | null;
  currentKey: string | null;
  phase: RunPhase;
  locked: boolean;
  pendingEvolve: number | null;
  mission?: {
    target: string;
    options: string[];
    prompt: string;
    say: string;
    success: string;
  };
};
