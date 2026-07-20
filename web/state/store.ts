"use client";

import { characterById, CHARACTERS } from "@/data/characters";
import { PHOTOS } from "@/data/photos";
import {
  clampCurriculum,
  defaultCurriculum,
  effectiveLevel,
} from "@/lib/difficulty";
import { defaultMinigameConfig, enabledMinigameIds } from "@/data/minigameMeta";
import {
  createDefaultState,
  defaultGames,
  migrateProfile,
  newProfile,
} from "@/lib/migrate";
import type { MinigameEngineId } from "@/lib/minigames/types";
import { STATE_KEY, alufimStorage } from "@/state/storage";
import { nextMission, currentFormArt } from "@/lib/missions";
import { getProvider } from "@/lib/providers";
import { pickNoRepeat } from "@/lib/random";
import {
  buildBeat,
  clampPlayEverySteps,
  DEFAULT_PLAY_EVERY_STEPS,
  resolveRhythm,
} from "@/lib/rhythm";
import type {
  AppState,
  DifficultyLevel,
  GameId,
  Profile,
  Question,
  RunPhase,
  RunState,
  ScreenId,
} from "@/lib/types";
import { GAME_ORDER } from "@/data/games";
import { ENG_CORRECT_ADVANCE_MS } from "@/lib/speakPrompt";
import { xpForCorrect, formForXp, XP_BEAT } from "@/lib/xp";
import {
  getMinigameEngine,
  pickMinigameSkin,
  type MinigameInput,
  type MinigameOverlay,
} from "@/lib/minigames";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

let pendingEvolveNext: (() => void) | null = null;
let lastEvolveTapAt = 0;

/** Big milestone — paced so kids feel the build-up, not a one-second flash. */
const EVOLVE_TAPS_NEEDED = 12;
const EVOLVE_TAP_MIN_MS = 150;
const EVOLVE_FILMSTRIP_HOLD_MS = 950;
const EVOLVE_FILMSTRIP_STEP_MS = 900;
const EVOLVE_DONE_HOLD_MS = 5000;

const PRAISE = [
  "כל הכבוד!",
  "מעולה!",
  "וואו!",
  "נכון מאוד!",
  "יופי!",
  "מצוין!",
  "אלוף/ה!",
  "מדהים!",
];

type EvolveOverlay = {
  formIdx: number;
  taps: number;
  needed: number;
  phase: "tap" | "filmstrip" | "done";
  filmstripForm: number;
  animToken: number;
};

type CollectionOverlay = {
  characterId: string;
  message: string;
};

type UiState = {
  screen: ScreenId;
  /** Home picker flow — not persisted; mirrors vanilla #charSection / #gameSection .show */
  homeCharSection: boolean;
  homeGameSection: boolean;
  editingProfileId: string | null;
  editorDraft: {
    avatar: string;
    games: Profile["games"];
    minigames: Record<MinigameEngineId, { enabled: boolean }>;
    playEverySteps: number;
    charXp: Record<string, number>;
  } | null;
  selectedGameId: GameId | null;
  run: RunState | null;
  feedback: string;
  disabledAnswers: string[];
  wobbleAnswer: string | null;
  xpGainFlash: number | null;
  showMission: boolean;
  minigameOverlay: MinigameOverlay | null;
  evolveOverlay: EvolveOverlay | null;
  collectionOverlay: CollectionOverlay | null;
};

type Store = UiState & {
  app: AppState;
  profile: () => Profile | null;
  activeCharacter: () => ReturnType<typeof characterById>;
  setScreen: (screen: ScreenId) => void;
  selectProfile: (id: string) => void;
  selectCharacter: (id: string) => void;
  selectGame: (id: GameId) => void;
  startGame: (gameId?: GameId) => void;
  goHome: () => void;
  openProfileEditor: (id: string | null) => void;
  updateEditorDraft: (patch: Partial<NonNullable<UiState["editorDraft"]>>) => void;
  saveProfileEditor: (name: string) => void;
  deleteProfileEditor: () => void;
  makeQuestion: (speakNow?: boolean) => void;
  submitAnswer: (value: string) => void;
  speakCurrent: () => void;
  restartGame: () => void;
  evolveTap: () => void;
  evolveFilmstripTick: () => void;
  finishEvolve: () => void;
  minigameInput: (input: MinigameInput) => void;
  previewMinigame: (engineId: MinigameEngineId) => void;
  closeMinigamePreview: () => void;
  dismissCollection: () => void;
  _awardXp: (amount: number) => void;
  _gotoNextStep: () => void;
  _withEvolution: (next: () => void) => void;
  _unlockNextCharacter: () => void;
};

function findProfile(app: AppState, id: string | null) {
  if (!id) return null;
  return app.profiles.find((p) => p.id === id) ?? null;
}

function profileHasActiveAnimal(p: Profile | null | undefined): boolean {
  return !!p?.activeCharacterId && !!p.characters[p.activeCharacterId];
}

function buildContext(run: RunState) {
  return {
    gameId: run.gameId,
    level: effectiveLevel(run.level, run.completed),
    step: run.step,
    usedKeys: run.usedKeys,
    recent: run.completed,
    countEmoji: run.character.counts,
    curriculum: run.curriculum,
  };
}

function clampGamesCurriculum(games: Profile["games"]): Profile["games"] {
  const next = { ...games };
  for (const gid of GAME_ORDER) {
    if (!next[gid]) continue;
    next[gid] = {
      ...next[gid],
      curriculum: clampCurriculum(gid, next[gid].curriculum),
    };
  }
  return next;
}

function initialApp(): AppState {
  return createDefaultState(PHOTOS);
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      app: initialApp(),
      screen: "profiles",
      homeCharSection: false,
      homeGameSection: false,
      editingProfileId: null,
      editorDraft: null,
      selectedGameId: null,
      run: null,
      feedback: "",
      disabledAnswers: [],
      wobbleAnswer: null,
      xpGainFlash: null,
      showMission: false,
      minigameOverlay: null,
      evolveOverlay: null,
      collectionOverlay: null,

      profile: () => {
        const { app, run } = get();
        if (run) {
          return findProfile(app, app.lastProfileId);
        }
        return findProfile(app, app.lastProfileId);
      },

      activeCharacter: () => {
        const p = get().profile();
        const id = p?.activeCharacterId;
        return id ? characterById(id) : null;
      },

      setScreen: (screen) => set({ screen }),

      selectProfile: (id) => {
        set({
          app: { ...get().app, lastProfileId: id },
          selectedGameId: null,
          homeCharSection: true,
          // Always land on animal pick next — games open only after choosing an animal.
          homeGameSection: false,
        });
      },

      selectCharacter: (id) => {
        set((state) => ({
          app: {
            ...state.app,
            profiles: state.app.profiles.map((p) => {
              if (p.id !== state.app.lastProfileId) return p;
              const characters = { ...p.characters };
              if (!characters[id]) characters[id] = { form: 0, totalXp: 0 };
              return { ...p, activeCharacterId: id, characters };
            }),
          },
          selectedGameId: null,
          homeGameSection: true,
        }));
      },

      selectGame: (id) => set({ selectedGameId: id }),

      startGame: (gameId) => {
        const { app } = get();
        const selectedGameId = gameId ?? get().selectedGameId;
        const p = findProfile(app, app.lastProfileId);
        const char = p?.activeCharacterId ? characterById(p.activeCharacterId) : null;
        if (!p || !char || !selectedGameId) return;

        const gameCfg = p.games[selectedGameId];
        const run: RunState = {
          character: char,
          gameId: selectedGameId,
          level: (gameCfg?.level || "easy") as DifficultyLevel,
          curriculum: gameCfg?.curriculum
            ? JSON.parse(JSON.stringify(gameCfg.curriculum))
            : defaultCurriculum(selectedGameId),
          preset: resolveRhythm(p.playEverySteps),
          step: 1,
          usedKeys: [],
          completed: [],
          mistakes: 0,
          hadWrong: false,
          current: null,
          currentKey: null,
          phase: "learn",
          locked: false,
          pendingEvolve: null,
        };

        const provider = getProvider(selectedGameId);
        const q = provider.generate(buildContext(run));
        const readyRun: RunState = {
          ...run,
          current: q,
          currentKey: provider.key(q),
        };

        set({
          selectedGameId,
          run: readyRun,
          screen: "game",
          feedback: "",
          disabledAnswers: [],
          showMission: false,
          minigameOverlay: null,
          evolveOverlay: null,
        });
      },

      goHome: () => {
        const p = findProfile(get().app, get().app.lastProfileId);
        set({
          screen: "profiles",
          run: null,
          feedback: "",
          disabledAnswers: [],
          showMission: false,
          minigameOverlay: null,
          evolveOverlay: null,
          homeCharSection: true,
          homeGameSection: profileHasActiveAnimal(p),
        });
      },

      openProfileEditor: (id) => {
        const p = findProfile(get().app, id);
        const migrated = p
          ? migrateProfile(JSON.parse(JSON.stringify(p)) as Profile)
          : null;
        set({
          screen: "profileEdit",
          editingProfileId: id,
          editorDraft: {
            avatar: migrated?.avatar ?? "🙂",
            games: migrated ? migrated.games : defaultGames(),
            minigames: migrated
              ? { ...defaultMinigameConfig(), ...migrated.minigames }
              : defaultMinigameConfig(),
            playEverySteps: migrated
              ? clampPlayEverySteps(migrated.playEverySteps)
              : DEFAULT_PLAY_EVERY_STEPS,
            charXp: migrated
              ? Object.fromEntries(
                  Object.entries(migrated.characters).map(([cid, prog]) => [
                    cid,
                    Math.max(0, Number(prog?.totalXp) || 0),
                  ])
                )
              : {},
          },
        });
      },

      updateEditorDraft: (patch) => {
        const draft = get().editorDraft;
        if (!draft) return;
        set({ editorDraft: { ...draft, ...patch } });
      },

      saveProfileEditor: (name) => {
        const { app, editingProfileId, editorDraft } = get();
        if (!editorDraft) return;
        const trimmed = name.trim() || "ילד/ה";

        const games = clampGamesCurriculum(editorDraft.games);

        if (editingProfileId) {
          const profiles = app.profiles.map((p) => {
            if (p.id !== editingProfileId) return p;
            const next = migrateProfile({
              ...p,
              name: trimmed,
              avatar: editorDraft.avatar,
              games,
              minigames: editorDraft.minigames,
              playEverySteps: clampPlayEverySteps(editorDraft.playEverySteps),
            });
            Object.entries(editorDraft.charXp).forEach(([cid, xp]) => {
              const c = characterById(cid);
              const prog = next.characters[cid];
              if (!c || !prog) return;
              const totalXp = Math.max(0, xp || 0);
              prog.totalXp = totalXp;
              prog.form = formForXp(totalXp, c.forms.length);
            });
            return next;
          });
          const saved = profiles.find((p) => p.id === editingProfileId) ?? null;
          set({
            app: { ...app, profiles },
            screen: "profiles",
            editingProfileId: null,
            editorDraft: null,
            homeCharSection: true,
            homeGameSection: profileHasActiveAnimal(saved),
          });
        } else {
          const np = newProfile(trimmed, editorDraft.avatar);
          np.games = games;
          np.minigames = editorDraft.minigames;
          np.playEverySteps = clampPlayEverySteps(editorDraft.playEverySteps);
          set({
            app: { ...app, profiles: [...app.profiles, np] },
            screen: "profiles",
            editingProfileId: null,
            editorDraft: null,
            homeCharSection: true,
            homeGameSection: false,
          });
        }
      },

      deleteProfileEditor: () => {
        const { app, editingProfileId } = get();
        if (!editingProfileId) return;
        set({
          app: {
            ...app,
            profiles: app.profiles.filter((p) => p.id !== editingProfileId),
            lastProfileId:
              app.lastProfileId === editingProfileId ? null : app.lastProfileId,
          },
          screen: "profiles",
          editingProfileId: null,
          editorDraft: null,
        });
      },

      makeQuestion: () => {
        const run = get().run;
        if (!run) return;
        const provider = getProvider(run.gameId);
        const ctx = buildContext(run);
        const q = provider.generate(ctx);
        set({
          run: {
            ...run,
            current: q,
            currentKey: provider.key(q),
            hadWrong: false,
            mistakes: 0,
            phase: "learn",
            locked: false,
          },
          feedback: "",
          disabledAnswers: [],
          wobbleAnswer: null,
        });
      },

      _awardXp: (amount) => {
        const { app, run } = get();
        if (!run) return;
        const p = findProfile(app, app.lastProfileId);
        if (!p) return;
        const prog = p.characters[run.character.id];
        if (!prog) return;

        const before = formForXp(prog.totalXp, run.character.forms.length);
        prog.totalXp += amount;
        const after = formForXp(prog.totalXp, run.character.forms.length);
        prog.form = after;

        const profiles = app.profiles.map((pr) =>
          pr.id === p.id ? { ...p, characters: { ...p.characters, [run.character.id]: { ...prog } } } : pr
        );

        set({
          app: { ...app, profiles },
          run: {
            ...run,
            pendingEvolve: after > before ? after : run.pendingEvolve,
          },
          xpGainFlash: amount,
        });
        window.setTimeout(() => set({ xpGainFlash: null }), 1400);
      },

      _withEvolution: (next) => {
        const run = get().run;
        if (!run) return;
        if (run.pendingEvolve != null) {
          const formIdx = run.pendingEvolve;
          pendingEvolveNext = next;
          set({
            run: { ...run, pendingEvolve: null, locked: true, phase: "evolve" },
            evolveOverlay: {
              formIdx,
              taps: 0,
              needed: EVOLVE_TAPS_NEEDED,
              phase: "tap",
              // Start on the form they're growing from — morph into the new one.
              filmstripForm: Math.max(0, formIdx - 1),
              animToken: Date.now(),
            },
          });
        } else {
          next();
        }
      },

      evolveTap: () => {
        const { evolveOverlay, run } = get();
        if (!run || !evolveOverlay || evolveOverlay.phase !== "tap") return;
        if (evolveOverlay.taps >= evolveOverlay.needed) return;
        const now = Date.now();
        if (now - lastEvolveTapAt < EVOLVE_TAP_MIN_MS) return;
        lastEvolveTapAt = now;
        const taps = evolveOverlay.taps + 1;
        if (taps >= evolveOverlay.needed) {
          set({
            evolveOverlay: {
              ...evolveOverlay,
              taps,
              phase: "filmstrip",
              filmstripForm: Math.max(0, evolveOverlay.formIdx - 1),
            },
          });
        } else {
          set({ evolveOverlay: { ...evolveOverlay, taps } });
        }
      },

      evolveFilmstripTick: () => {
        const { evolveOverlay } = get();
        if (!evolveOverlay || evolveOverlay.phase !== "filmstrip") return;
        const nextForm = evolveOverlay.filmstripForm + 1;
        if (nextForm > evolveOverlay.formIdx) {
          set({
            evolveOverlay: { ...evolveOverlay, phase: "done", filmstripForm: evolveOverlay.formIdx },
          });
          window.setTimeout(() => get().finishEvolve(), EVOLVE_DONE_HOLD_MS);
        } else {
          set({ evolveOverlay: { ...evolveOverlay, filmstripForm: nextForm } });
          window.setTimeout(() => get().evolveFilmstripTick(), EVOLVE_FILMSTRIP_STEP_MS);
        }
      },

      finishEvolve: () => {
        const run = get().run;
        const cb = pendingEvolveNext;
        pendingEvolveNext = null;
        if (run?.character && get().evolveOverlay?.formIdx != null) {
          const formIdx = get().evolveOverlay!.formIdx;
          if (formIdx >= run.character.forms.length - 1) get()._unlockNextCharacter();
        }
        set({
          evolveOverlay: null,
          run: run ? { ...run, locked: false, phase: "learn" } : null,
        });
        cb?.();
      },

      _unlockNextCharacter: () => {
        const p = get().profile();
        if (!p) return;
        for (const c of CHARACTERS) {
          if (!p.characters[c.id]) {
            p.characters[c.id] = { form: 0, totalXp: 0 };
            const app = get().app;
            set({
              app: {
                ...app,
                profiles: app.profiles.map((pr) =>
                  pr.id === p.id ? { ...p, characters: { ...p.characters } } : pr
                ),
              },
              collectionOverlay: {
                characterId: c.id,
                message: `${c.he} מחכה לך במסך החיות!`,
              },
            });
            window.setTimeout(() => set({ collectionOverlay: null }), 3000);
            return;
          }
        }
      },

      _gotoNextStep: () => {
        get()._withEvolution(() => {
          const run = get().run;
          if (!run) return;
          const nextStep = run.step + 1;
          set({ run: { ...run, step: nextStep } });
          get().makeQuestion();
        });
      },

      submitAnswer: (value) => {
        const { run, showMission } = get();
        if (!run || run.locked) return;

        if (showMission && run.mission) {
          const correct = value === run.mission.target;
          if (correct) {
            set({ run: { ...run, locked: true } });
            get()._awardXp(XP_BEAT.mission);
            set({ feedback: run.mission.success });
            window.setTimeout(() => {
              set({ showMission: false, run: { ...get().run!, phase: "learn" } });
              get()._gotoNextStep();
            }, 1200);
          } else {
            set({ wobbleAnswer: value });
            window.setTimeout(() => set({ wobbleAnswer: null }), 500);
            set({ feedback: "💪 כמעט! נסו שוב" });
          }
          return;
        }

        const ans = run.current?.answer;
        const correct =
          ans != null &&
          (value === String(ans) || (typeof ans === "number" && Number(value) === ans));
        if (correct) {
          const ctx = buildContext(run);
          const gain = xpForCorrect(ctx.level, run.step, run.mistakes);
          const usedKeys = [...run.usedKeys];
          if (run.currentKey && !usedKeys.includes(run.currentKey)) usedKeys.push(run.currentKey);
          const completed = [
            ...run.completed,
            { key: run.currentKey || "", correct: true, hadWrongAttempt: run.hadWrong },
          ];
          const praise = pickNoRepeat(PRAISE, "praise");
          let feedback = `🎉 ${praise}`;
          if (run.gameId === "eng" && run.current && "word" in run.current) {
            const w = (run.current as unknown as { word: { en: string; he: string } }).word;
            feedback = `🎉 ${w.en} = ${w.he}!`;
          }
          set({
            run: { ...run, locked: true, usedKeys, completed },
            feedback,
          });
          get()._awardXp(gain);
          // Eng teach-back speech needs longer before the next prompt.
          const advanceMs = run.gameId === "eng" ? ENG_CORRECT_ADVANCE_MS : 900;
          window.setTimeout(() => {
            const beat = buildBeat(run.preset, run.step);
            if (beat === "mission") {
              // Grow before mission so art matches the celebrated form.
              get()._withEvolution(() => {
                const r = get().run!;
                const prog = get().profile()?.characters[r.character.id];
                const art = currentFormArt(r.character, prog?.totalXp ?? 0);
                const m = nextMission(r.character, art);
                set({
                  run: { ...get().run!, locked: true, phase: "mission", mission: m },
                  showMission: true,
                });
                window.setTimeout(() => set({ run: { ...get().run!, locked: false } }), 100);
              });
            } else if (beat === "play") {
              // Grow before play — otherwise the minigame already shows the new form.
              get()._withEvolution(() => {
                const r = get().run!;
                const prof = get().profile();
                const enabled = enabledMinigameIds(
                  prof?.minigames as Record<MinigameEngineId, { enabled: boolean }> | undefined
                );
                const skin = pickMinigameSkin(r.character.id, null, enabled);
                const engine = getMinigameEngine(skin.engineId);
                const session = engine.start({
                  characterId: r.character.id,
                  character: r.character,
                  skin,
                });
                set({
                  run: { ...r, locked: true, phase: "play" },
                  minigameOverlay: {
                    engineId: skin.engineId,
                    session,
                    done: false,
                  },
                });
              });
            } else {
              get()._gotoNextStep();
            }
          }, advanceMs);
        } else {
          const mistakes = run.mistakes + 1;
          const disabled = [...get().disabledAnswers, value];
          set({
            run: { ...run, hadWrong: true, mistakes },
            disabledAnswers: disabled,
            wobbleAnswer: value,
            feedback: "💪 כמעט! נסו שוב",
          });
          window.setTimeout(() => set({ wobbleAnswer: null }), 500);
          if (mistakes >= 3) {
            window.setTimeout(() => set({ disabledAnswers: [], run: { ...get().run!, mistakes: 0 } }), 700);
          }
        }
      },

      minigameInput: (input) => {
        const { run, minigameOverlay } = get();
        if (!minigameOverlay || minigameOverlay.done) return;
        if (!run && !minigameOverlay.preview) return;
        const engine = getMinigameEngine(minigameOverlay.engineId);
        const session = engine.applyInput(minigameOverlay.session, input);
        if (engine.isComplete(session)) {
          if (minigameOverlay.preview) {
            set({ minigameOverlay: { ...minigameOverlay, session, done: true } });
            window.setTimeout(() => {
              const st = get().minigameOverlay;
              if (st?.preview) set({ minigameOverlay: null });
            }, 1500);
            return;
          }
          get()._awardXp(XP_BEAT.play);
          set({
            minigameOverlay: { ...minigameOverlay, session, done: true },
            feedback: `ה${run!.character.he} שיחק והתחזק!`,
          });
          window.setTimeout(() => {
            set({ minigameOverlay: null, run: { ...get().run!, phase: "learn" } });
            get()._gotoNextStep();
          }, 1500);
        } else {
          set({ minigameOverlay: { ...minigameOverlay, session, done: false } });
        }
      },

      previewMinigame: (engineId) => {
        const p = findProfile(get().app, get().editingProfileId ?? get().app.lastProfileId);
        const charId =
          p?.activeCharacterId ||
          (p && Object.keys(p.characters)[0]) ||
          CHARACTERS[0]?.id ||
          "lion";
        const character = characterById(charId) ?? CHARACTERS[0];
        if (!character) return;
        const skin = pickMinigameSkin(character.id, engineId, [engineId]);
        const engine = getMinigameEngine(engineId);
        const session = engine.start({
          characterId: character.id,
          character,
          skin,
        });
        set({
          minigameOverlay: {
            engineId,
            session,
            done: false,
            preview: true,
            previewCharacterId: character.id,
          },
        });
      },

      closeMinigamePreview: () => {
        const ov = get().minigameOverlay;
        if (ov?.preview) set({ minigameOverlay: null });
      },

      speakCurrent: () => {
        /* handled in GameScreen via useSpeech */
      },

      restartGame: () => {
        const gameId = get().run?.gameId ?? get().selectedGameId;
        if (gameId) {
          set({ selectedGameId: gameId });
          get().startGame();
        }
      },

      dismissCollection: () => set({ collectionOverlay: null }),
    }),
    {
      name: STATE_KEY,
      storage: createJSONStorage(() => alufimStorage),
      partialize: (state) => ({ app: state.app }),
      skipHydration: true,
      merge: (persisted, current) => {
        const p = persisted as { app?: AppState } | undefined;
        if (!p?.app) return current;
        const app = { ...p.app, profiles: p.app.profiles.map(migrateProfile) };
        const last = findProfile(app, app.lastProfileId);
        const hasProfile = !!last;
        return {
          ...current,
          app,
          homeCharSection: hasProfile,
          homeGameSection: profileHasActiveAnimal(last),
        };
      },
    }
  )
);

// Trigger filmstrip when phase changes to filmstrip
let lastFilmstripToken = 0;
useStore.subscribe((state, prev) => {
  const ev = state.evolveOverlay;
  const prevEv = prev.evolveOverlay;
  if (
    ev?.phase === "filmstrip" &&
    prevEv?.phase === "tap" &&
    ev.animToken !== lastFilmstripToken
  ) {
    lastFilmstripToken = ev.animToken;
    window.setTimeout(() => useStore.getState().evolveFilmstripTick(), EVOLVE_FILMSTRIP_HOLD_MS);
  }
});

export type { Store };
