"use client";

import { characterById, CHARACTERS } from "@/data/characters";
import { PHOTOS } from "@/data/photos";
import { effectiveLevel } from "@/lib/difficulty";
import {
  createDefaultState,
  defaultGames,
  migrateProfile,
  newProfile,
} from "@/lib/migrate";
import { STATE_KEY, alufimStorage } from "@/state/storage";
import { nextMission, currentFormArt } from "@/lib/missions";
import { getProvider } from "@/lib/providers";
import { pickNoRepeat, rnd } from "@/lib/random";
import { buildBeat, resolveRhythm } from "@/lib/rhythm";
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
import { xpForCorrect, formForXp, XP_BEAT } from "@/lib/xp";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

let pendingEvolveNext: (() => void) | null = null;

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

type PlayOverlay = {
  tapsDone: number;
  foodLeft: string;
  foodTop: string;
  done: boolean;
};

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
    charXp: Record<string, number>;
  } | null;
  selectedGameId: GameId | null;
  run: RunState | null;
  feedback: string;
  disabledAnswers: string[];
  wobbleAnswer: string | null;
  xpGainFlash: number | null;
  showMission: boolean;
  playOverlay: PlayOverlay | null;
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
  startGame: () => void;
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
  playFoodTap: () => void;
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

function buildContext(run: RunState) {
  return {
    gameId: run.gameId,
    level: effectiveLevel(run.level, run.completed),
    step: run.step,
    usedKeys: run.usedKeys,
    recent: run.completed,
    countEmoji: run.character.counts,
  };
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
      playOverlay: null,
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
        set((state) => ({
          app: { ...state.app, lastProfileId: id },
          selectedGameId: null,
          homeCharSection: true,
          homeGameSection: false,
        }));
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

      startGame: () => {
        const { app, selectedGameId } = get();
        const p = findProfile(app, app.lastProfileId);
        const char = p?.activeCharacterId ? characterById(p.activeCharacterId) : null;
        if (!p || !char || !selectedGameId) return;

        const run: RunState = {
          character: char,
          gameId: selectedGameId,
          level: (p.games[selectedGameId]?.level || "easy") as DifficultyLevel,
          preset: resolveRhythm(),
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
          run: readyRun,
          screen: "game",
          feedback: "",
          disabledAnswers: [],
          showMission: false,
          playOverlay: null,
          evolveOverlay: null,
        });
      },

      goHome: () => {
        const p = findProfile(get().app, get().app.lastProfileId);
        const keepAnimal =
          !!p?.activeCharacterId && !!p.characters[p.activeCharacterId];
        set({
          screen: "profiles",
          run: null,
          feedback: "",
          disabledAnswers: [],
          showMission: false,
          playOverlay: null,
          evolveOverlay: null,
          homeCharSection: true,
          homeGameSection: keepAnimal,
        });
      },

      openProfileEditor: (id) => {
        const p = findProfile(get().app, id);
        set({
          screen: "profileEdit",
          editingProfileId: id,
          editorDraft: {
            avatar: p?.avatar ?? "🙂",
            games: p ? JSON.parse(JSON.stringify(p.games)) : defaultGames(),
            charXp: p
              ? Object.fromEntries(
                  Object.entries(p.characters).map(([cid, prog]) => [cid, prog.totalXp])
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

        if (editingProfileId) {
          const profiles = app.profiles.map((p) => {
            if (p.id !== editingProfileId) return p;
            const next = migrateProfile({
              ...p,
              name: trimmed,
              avatar: editorDraft.avatar,
              games: editorDraft.games,
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
          set({
            app: { ...app, profiles },
            screen: "profiles",
            editingProfileId: null,
            editorDraft: null,
          });
        } else {
          const np = newProfile(trimmed, editorDraft.avatar);
          np.games = editorDraft.games;
          set({
            app: { ...app, profiles: [...app.profiles, np] },
            screen: "profiles",
            editingProfileId: null,
            editorDraft: null,
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
              needed: 6,
              phase: "tap",
              filmstripForm: 0,
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
        const taps = evolveOverlay.taps + 1;
        if (taps >= evolveOverlay.needed) {
          set({
            evolveOverlay: {
              ...evolveOverlay,
              taps,
              phase: "filmstrip",
              filmstripForm: 0,
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
          window.setTimeout(() => get().finishEvolve(), 2600);
        } else {
          set({ evolveOverlay: { ...evolveOverlay, filmstripForm: nextForm } });
          window.setTimeout(() => get().evolveFilmstripTick(), 340);
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
            const w = (run.current as { word: { en: string; he: string } }).word;
            feedback = `🎉 ${w.en} = ${w.he}!`;
          }
          set({
            run: { ...run, locked: true, usedKeys, completed },
            feedback,
          });
          get()._awardXp(gain);
          window.setTimeout(() => {
            const beat = buildBeat(run.preset, run.step);
            if (beat === "mission") {
              const r = get().run!;
              const prog = get().profile()?.characters[r.character.id];
              const art = currentFormArt(r.character, prog?.totalXp ?? 0);
              const m = nextMission(r.character, art);
              set({
                run: { ...get().run!, locked: true, phase: "mission", mission: m },
                showMission: true,
              });
              window.setTimeout(() => set({ run: { ...get().run!, locked: false } }), 100);
            } else if (beat === "play") {
              const tapsNeeded = run.preset.feedTaps || 3;
              set({
                run: { ...get().run!, locked: true, phase: "play" },
                playOverlay: {
                  tapsDone: 0,
                  foodLeft: `${8 + rnd(74)}%`,
                  foodTop: `${22 + rnd(58)}%`,
                  done: false,
                },
              });
            } else {
              get()._gotoNextStep();
            }
          }, 900);
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

      playFoodTap: () => {
        const { run, playOverlay } = get();
        if (!run || !playOverlay || playOverlay.done) return;
        const tapsNeeded = run.preset.feedTaps || 3;
        const tapsDone = playOverlay.tapsDone + 1;
        if (tapsDone >= tapsNeeded) {
          get()._awardXp(XP_BEAT.play);
          set({
            playOverlay: { ...playOverlay, tapsDone, done: true },
            feedback: `ה${run.character.he} אכל והתחזק!`,
          });
          window.setTimeout(() => {
            set({ playOverlay: null, run: { ...get().run!, phase: "learn" } });
            get()._gotoNextStep();
          }, 1500);
        } else {
          set({
            playOverlay: {
              tapsDone,
              foodLeft: `${8 + rnd(74)}%`,
              foodTop: `${22 + rnd(58)}%`,
              done: false,
            },
          });
        }
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
        const hasProfile = !!(
          app.lastProfileId && findProfile(app, app.lastProfileId)
        );
        return {
          ...current,
          app,
          homeCharSection: hasProfile,
          homeGameSection: false,
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
    window.setTimeout(() => useStore.getState().evolveFilmstripTick(), 340);
  }
});

export type { Store };
