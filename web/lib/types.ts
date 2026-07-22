export type DifficultyLevel = "easy" | "medium" | "hard";
export type GameId = "add" | "sub" | "find" | "eng";
export type BeatType = "learn" | "mission" | "play";
export type RunPhase = "learn" | "mission" | "play" | "evolve";
/** Accent for question UI (answer / hear-again buttons). */
export type PlayerGender = "boy" | "girl";

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

/**
 * How add/sub show quantities in a band:
 * - fullCount — emoji + emoji (count both sides)
 * - countOn — written first number + emoji second
 * - numbers — digits only (no emoji counts)
 */
export type MathVisual = "fullCount" | "countOn" | "numbers";

/** Per-band params for one difficulty level (shape depends on game). */
export type DifficultyBand = Record<string, unknown> & {
  visual?: MathVisual;
};

/** Per-game curriculum stored on the profile (copied from factory at create/migrate). */
export type GameCurriculum = {
  stepsPerBlock: number;
  bands: Record<DifficultyLevel, DifficultyBand[]>;
};

export type GameConfig = {
  enabled: boolean;
  level: DifficultyLevel;
  /** Owned copy of difficulty bands; always present after create/migrate. */
  curriculum: GameCurriculum;
};

/** Play-beat mini-game toggles (additive on saves; migrated if missing). */
export type MinigameConfig = { enabled: boolean };

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  /** Boy → blue question accents; girl → pink. */
  gender: PlayerGender;
  games: Record<GameId, GameConfig>;
  /** Which play-beat engines may appear; defaults applied in migrateProfile */
  minigames: Record<string, MinigameConfig>;
  /** Minigame every N learning steps (copied from factory default on create/migrate). */
  playEverySteps: number;
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
  /** Profile-owned curriculum for this game (snapshot for the run). */
  curriculum: GameCurriculum;
};

export type Provider = {
  generate: (ctx: ProviderContext) => Question;
  key: (q: Question) => string;
};

export type RunState = {
  character: CharacterDef;
  gameId: GameId;
  level: DifficultyLevel;
  /** Snapshot of profile curriculum for this run. */
  curriculum: GameCurriculum;
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
