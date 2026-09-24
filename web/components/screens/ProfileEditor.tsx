"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CharacterArt } from "@/components/art/CharacterArt";
import { MinigameHost } from "@/components/game/MinigameHost";
import { BackgroundScene } from "@/components/scene/BackgroundScene";
import {
  Brand,
  LevelControl,
  Panel,
  PillControl,
  Screen,
  SettingsButton,
  SettingsNumberField,
  Toggle,
} from "@/design-system";
import { CHARACTERS, characterById } from "@/data/characters";
import { GAMES, GAME_ORDER } from "@/data/games";
import { MINIGAME_META } from "@/data/minigameMeta";
import { NUMS_STAGES } from "@/data/nums";
import { PHOTOS } from "@/data/photos";
import {
  clampCurriculum,
  defaultCurriculum,
  isMathGame,
  hasStageBands,
  MATH_VISUAL_OPTIONS,
  MAX_BAND_COUNT,
  MAX_STAGE,
  normalizeMathVisual,
  levelLabel,
  mathVisualLabel,
} from "@/lib/difficulty";
import { isImgAvatar } from "@/lib/migrate";
import { currentFormArt } from "@/lib/missions";
import { formForXp, formThresholds } from "@/lib/xp";
import type {
  DifficultyBand,
  DifficultyLevel,
  GameCurriculum,
  GameId,
  MathVisual,
  PlayerGender,
} from "@/lib/types";
import type { MinigameEngineId } from "@/lib/minigames/types";
import { useStore } from "@/state/store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const AVATAR_EMOJIS = ["🦄", "🦖", "🚀", "🐬", "🦁", "🐶", "🐱", "🐉", "🐧", "🐼", "🦊", "🐢"];

const LEVELS_FOR_COUNTS: DifficultyLevel[] = ["easy", "medium", "hard"];

/** First and last step of a band, honouring per-band counts when they are set. */
function bandStepRange(
  counts: number[] | undefined,
  stepsPerBlock: number,
  bandIndex: number
): { start: number; end: number; skipped: boolean } {
  if (!counts) {
    return {
      start: bandIndex * stepsPerBlock + 1,
      end: (bandIndex + 1) * stepsPerBlock,
      skipped: false,
    };
  }
  const before = counts.slice(0, bandIndex).reduce((sum, n) => sum + n, 0);
  const own = counts[bandIndex] ?? 0;
  return { start: before + 1, end: before + own, skipped: own === 0 };
}

const GENDER_OPTIONS: { value: PlayerGender; readonly label: string }[] = (
  ["boy", "girl"] as const
).map((value) => ({
  value,
  get label() {
    return t(`settings.profile.${value}`);
  },
}));

const PHOTO_GENDER: Record<string, PlayerGender> = {
  ellie: "girl",
  ethan: "boy",
  nova: "girl",
  uni: "boy",
};

type SettingsSection = "profile" | "games" | "minigames" | "advanced";

const SECTIONS: { id: SettingsSection; existingOnly?: boolean }[] = [
  { id: "profile" },
  { id: "games" },
  { id: "minigames" },
  { id: "advanced", existingOnly: true },
];

/** What each math visual looks like, per game, for the settings legend. */
const VISUAL_EXAMPLES: Record<string, { visual: MathVisual; example: string }[]> = {
  add: [
    { visual: "fullCount", example: "🍎🍎 + 🍎🍎🍎" },
    { visual: "countOn", example: "2 + 🍎🍎🍎" },
    { visual: "numbers", example: "2 + 3" },
  ],
  sub: [
    { visual: "fullCount", example: "🍎🍎🍎🍎 − 🍎🍎" },
    { visual: "countOn", example: "5 − 🍎🍎" },
    { visual: "numbers", example: "5 − 2" },
  ],
  mul: [
    { visual: "fullCount", example: "[🍎🍎] [🍎🍎] [🍎🍎]" },
    { visual: "countOn", example: "3 × [🍎🍎]" },
    { visual: "numbers", example: "3 × 2" },
  ],
  div: [
    { visual: "fullCount", example: "[🍎🍎] [🍎🍎] [🍎🍎]" },
    { visual: "countOn", example: "🍎🍎🍎🍎🍎🍎 ÷ 3" },
    { visual: "numbers", example: "6 ÷ 3" },
  ],
};

function emptyBand(gameId: GameId): DifficultyBand {
  if (gameId === "add") return { minSum: 2, maxSum: 8, visual: "fullCount" };
  if (gameId === "sub") return { minTop: 2, maxMin: 8, visual: "fullCount" };
  if (gameId === "mul") return { minFactor: 1, maxFactor: 5, visual: "fullCount" };
  if (gameId === "div") return { maxDivisor: 3, maxQuotient: 5, visual: "fullCount" };
  if (gameId === "nums") return { stage: 1, maxNum: 10 };
  if (hasStageBands(gameId)) return { stage: 1 };
  return { maxLen: 8 };
}

export function ProfileEditor() {
  const editingProfileId = useStore((s) => s.editingProfileId);
  const editorDraft = useStore((s) => s.editorDraft);
  const app = useStore((s) => s.app);
  const minigameOverlay = useStore((s) => s.minigameOverlay);
  const updateEditorDraft = useStore((s) => s.updateEditorDraft);
  const saveProfileEditor = useStore((s) => s.saveProfileEditor);
  const deleteProfileEditor = useStore((s) => s.deleteProfileEditor);
  const previewMinigame = useStore((s) => s.previewMinigame);
  const closeMinigamePreview = useStore((s) => s.closeMinigamePreview);
  const closeProfileEditor = useStore((s) => s.closeProfileEditor);
  const focusGame = useStore((s) => s.editorFocusGame);

  const existing = app.profiles.find((p) => p.id === editingProfileId);
  const [name, setName] = useState(existing?.name ?? "");
  const [section, setSection] = useState<SettingsSection>(focusGame ? "games" : "profile");
  const [expandedGame, setExpandedGame] = useState<GameId | null>(focusGame);
  const [sectionKey, setSectionKey] = useState(0);

  const previewCharId = minigameOverlay?.previewCharacterId;
  const previewCharacter =
    (previewCharId ? characterById(previewCharId) : null) ??
    (existing?.activeCharacterId
      ? characterById(existing.activeCharacterId)
      : null) ??
    CHARACTERS[0];
  const previewXp =
    (previewCharacter && existing?.characters[previewCharacter.id]?.totalXp) ??
    (previewCharacter && editorDraft?.charXp[previewCharacter.id]) ??
    0;
  const previewFormArt = previewCharacter
    ? currentFormArt(previewCharacter, previewXp)
    : null;

  if (!editorDraft) return null;

  const displayName = name.trim() || existing?.name || t("home.newProfile");
  const avatar = editorDraft.avatar;

  const goSection = (id: SettingsSection) => {
    if (id === "advanced" && existing) {
      // Refresh draft XP from the live profile so the pane shows real totals.
      const charXp = { ...editorDraft.charXp };
      for (const [cid, prog] of Object.entries(existing.characters)) {
        if (charXp[cid] === undefined) {
          charXp[cid] = Math.max(0, Number(prog?.totalXp) || 0);
        }
      }
      updateEditorDraft({ charXp });
    }
    setSection(id);
    setSectionKey((k) => k + 1);
    setExpandedGame(null);
  };

  const setAvatar = (next: string, gender?: PlayerGender) =>
    updateEditorDraft(gender ? { avatar: next, gender } : { avatar: next });

  const setGender = (gender: PlayerGender) => updateEditorDraft({ gender });

  const toggleGame = (gid: GameId) => {
    const games = { ...editorDraft.games };
    games[gid] = { ...games[gid], enabled: !games[gid].enabled };
    updateEditorDraft({ games });
  };

  const toggleMinigame = (id: MinigameEngineId) => {
    const minigames = { ...editorDraft.minigames };
    const nextOn = !minigames[id]?.enabled;
    const othersOn = MINIGAME_META.some((m) => m.id !== id && minigames[m.id]?.enabled);
    if (!nextOn && !othersOn) return;
    minigames[id] = { enabled: nextOn };
    updateEditorDraft({ minigames });
  };

  const setLevel = (gid: GameId, level: DifficultyLevel) => {
    const games = { ...editorDraft.games };
    games[gid] = { ...games[gid], level };
    updateEditorDraft({ games });
  };

  const setCharXp = (cid: string, xp: number) => {
    updateEditorDraft({
      charXp: { ...editorDraft.charXp, [cid]: Math.max(0, xp) },
    });
  };

  const patchCurriculum = (
    gid: GameId,
    patch: Partial<{
      stepsPerBlock: number;
      bands: GameCurriculum["bands"];
      /** `null` clears the per-band counts and returns to the uniform ramp. */
      counts: number[] | null;
    }>
  ) => {
    const games = { ...editorDraft.games };
    const prev = games[gid].curriculum;
    const counts = patch.counts === undefined ? prev.counts : (patch.counts ?? undefined);
    const next = clampCurriculum(gid, {
      stepsPerBlock: patch.stepsPerBlock ?? prev.stepsPerBlock,
      counts,
      bands: patch.bands ?? prev.bands,
    });
    games[gid] = { ...games[gid], curriculum: next };
    updateEditorDraft({ games });
  };

  const setBandCount = (gid: GameId, bandIndex: number, value: number) => {
    const cur = editorDraft.games[gid].curriculum;
    const slots = Math.max(...LEVELS_FOR_COUNTS.map((l) => cur.bands[l]?.length ?? 0));
    const counts = Array.from(
      { length: slots },
      (_, i) => cur.counts?.[i] ?? cur.stepsPerBlock
    );
    counts[bandIndex] = Math.max(0, Math.min(MAX_BAND_COUNT, value || 0));
    // All-zero would leave a run with nothing to ask; keep at least this band.
    if (!counts.some((n) => n > 0)) counts[bandIndex] = 1;
    patchCurriculum(gid, { counts });
  };

  const updateBandField = (
    gid: GameId,
    level: DifficultyLevel,
    bandIndex: number,
    field: string,
    value: number | MathVisual
  ) => {
    const cur = editorDraft.games[gid].curriculum;
    const levelBands = [...(cur.bands[level] ?? [])];
    const band = { ...(levelBands[bandIndex] ?? {}) };
    const next = { ...band, [field]: value };

    // Paired ranges require strictly upper > lower; reject invalid edits.
    if (typeof value === "number") {
      const loHi =
        field === "minSum" || field === "maxSum"
          ? ([Number(next.minSum), Number(next.maxSum)] as const)
          : field === "minTop" || field === "maxMin"
            ? ([Number(next.minTop), Number(next.maxMin)] as const)
            : field === "qLo" || field === "qHi"
              ? ([Number(next.qLo), Number(next.qHi)] as const)
              : null;
      if (loHi && Number.isFinite(loHi[0]) && Number.isFinite(loHi[1]) && !(loHi[1] > loHi[0])) {
        return;
      }
    }

    levelBands[bandIndex] = next;
    patchCurriculum(gid, {
      bands: { ...cur.bands, [level]: levelBands },
    });
  };

  const addBand = (gid: GameId, level: DifficultyLevel) => {
    const cur = editorDraft.games[gid].curriculum;
    const levelBands = [...(cur.bands[level] ?? [])];
    const last = levelBands[levelBands.length - 1];
    levelBands.push(last ? { ...last } : emptyBand(gid));
    patchCurriculum(gid, {
      bands: { ...cur.bands, [level]: levelBands },
    });
  };

  const removeBand = (gid: GameId, level: DifficultyLevel, bandIndex: number) => {
    const cur = editorDraft.games[gid].curriculum;
    const levelBands = [...(cur.bands[level] ?? [])];
    if (levelBands.length <= 1) return;
    levelBands.splice(bandIndex, 1);
    patchCurriculum(gid, {
      bands: { ...cur.bands, [level]: levelBands },
    });
  };

  const resetCurriculum = (gid: GameId) => {
    const games = { ...editorDraft.games };
    games[gid] = {
      ...games[gid],
      curriculum: defaultCurriculum(gid),
    };
    updateEditorDraft({ games });
  };

  const navItems = SECTIONS.filter((s) => !s.existingOnly || !!existing);

  return (
    <Screen
      id="scrProfileEdit"
      scroll
      contentClassName="gap-4 w-full max-w-[960px] px-4"
    >
      <Brand className="text-[clamp(32px,6vw,48px)]">Alufim</Brand>

      <Panel variant="shell">
        <aside className="settingsSidebar">
          <div className="settingsAvatarWrap">
            <div className="settingsAvatar">
              {isImgAvatar(avatar) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[48px] leading-none">{avatar || "🙂"}</span>
              )}
            </div>
            <div className="settingsAvatarName">{displayName}</div>
            <div className="settingsAvatarHint">
              {existing ? t("settings.playerSettings") : t("home.newProfile")}
            </div>
          </div>

          {!focusGame && (
          <nav className="settingsNav" aria-label={t("settings.sections.label")}>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn("settingsNavItem", section === item.id && "is-active")}
                onClick={() => goSection(item.id)}
              >
                {t(`settings.sections.${item.id}`)}
              </button>
            ))}
          </nav>
          )}
        </aside>

        <div className="settingsMain">
          <div key={sectionKey} className="settingsPane">
            {section === "profile" && (
              <>
                <h2 className="settingsPaneTitle">{t("settings.sections.profile")}</h2>
                <label className="flabel profileNameLabel" htmlFor="profileName">
                  {t("settings.profile.name")}
                </label>
                <input
                  id="profileName"
                  className="finput profileNameInput"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("profile.defaultName")}
                />

                <div className="flabel">{t("settings.profile.genderLabel")}</div>
                <PillControl
                  className="mb-1"
                  options={GENDER_OPTIONS}
                  value={editorDraft.gender}
                  onChange={setGender}
                  aria-label={t("settings.profile.genderAria")}
                />
                <p className="settingsPaneBlurb mt-1">
                  {t("settings.profile.genderHint")}
                </p>

                <div className="flabel">{t("settings.profile.picture")}</div>
                <div id="avatarGrid" className="avatarGrid">
                  {AVATAR_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      className={cn(
                        "avatarOpt flex h-[54px] w-[54px] items-center justify-center rounded-full border-[3px] bg-[#F0F4F8] text-[30px]",
                        editorDraft.avatar === e
                          ? "border-[#2E9E5B] shadow-[0_0_0_3px_rgba(46,158,91,.25)]"
                          : "border-transparent"
                      )}
                      onClick={() => setAvatar(e)}
                    >
                      {e}
                    </button>
                  ))}
                  {(
                    [
                      ["ellie", PHOTOS.ellie],
                      ["ethan", PHOTOS.ethan],
                      ["nova", PHOTOS.nova],
                      ["uni", PHOTOS.uni],
                    ] as const
                  ).map(([id, ph]) => (
                    <button
                      key={id}
                      type="button"
                      className={cn(
                        "avatarOpt h-[54px] w-[54px] overflow-hidden rounded-full border-[3px] p-0",
                        editorDraft.avatar === ph ? "border-[#2E9E5B]" : "border-transparent"
                      )}
                      onClick={() => setAvatar(ph, PHOTO_GENDER[id])}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ph} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {section === "games" && (
              <>
                <h2 className="settingsPaneTitle">
                  {focusGame ? t("settings.games.gameTitle", { game: GAMES[focusGame].title }) : t("settings.sections.games")}
                </h2>
                <p className="settingsPaneBlurb">
                  {focusGame
                    ? t("settings.games.focusBlurb")
                    : t("settings.games.blurb")}
                </p>
                <div id="gameRows" className="gameSettingsList">
                  {(focusGame ? [focusGame] : GAME_ORDER).map((gid) => {
                    const cfg = editorDraft.games[gid];
                    const g = GAMES[gid];
                    const open = expandedGame === gid && cfg.enabled;
                    const level = cfg.level;
                    const curriculum = cfg.curriculum;
                    const bands = curriculum.bands[level] ?? [];

                    return (
                      <div
                        key={gid}
                        className={cn(
                          "gameSettingsCard",
                          open && "is-open",
                          !cfg.enabled && "is-off"
                        )}
                      >
                        <div className="gameSettingsRow">
                          <div className="gameSettingsHit">
                            <span className="gameSettingsTitle">
                              {g.icon} {g.title}
                            </span>
                            <span className="gameSettingsDesc">{g.subtitle}</span>
                          </div>
                          <div className="settingsRowControls gameSettingsControls">
                            <Toggle
                              className="settingsToggle"
                              on={cfg.enabled}
                              onClick={() => {
                                toggleGame(gid);
                                if (cfg.enabled && expandedGame === gid) {
                                  setExpandedGame(null);
                                }
                              }}
                            />
                            <LevelControl
                              value={level}
                              onChange={(next) => setLevel(gid, next)}
                              disabled={!cfg.enabled}
                            />
                            <button
                              type="button"
                              className="gameCustomizeBtn"
                              aria-expanded={open}
                              disabled={!cfg.enabled}
                              onClick={() =>
                                setExpandedGame((cur) => (cur === gid ? null : gid))
                              }
                            >
                              {open ? t("settings.games.close") : t("settings.games.customize")}
                              <span aria-hidden>{open ? "▴" : "▾"}</span>
                            </button>
                          </div>
                        </div>

                        {open && (
                          <div className="gameCurriculumPanel">
                            <p className="curriculumIntro">
                              {isMathGame(gid)
                                ? t("settings.games.bandsIntroMath")
                                : t("settings.games.bandsIntro")}
                            </p>

                            {isMathGame(gid) && (
                              <div className="visualLegend">
                                <div className="visualLegendTitle">{t("settings.games.visualLegend")}</div>
                                <div className="visualLegendRows">
                                  {VISUAL_EXAMPLES[gid].map((ex) => (
                                    <div key={ex.visual} className="visualLegendRow">
                                      <span className="visualLegendName">{mathVisualLabel(ex.visual)}</span>
                                      <span className="visualLegendEx" dir="ltr">
                                        {ex.example}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {gid === "nums" && (
                              <div className="visualLegend">
                                <div className="visualLegendTitle">{t("settings.games.stagesLegend")}</div>
                                <div className="visualLegendRows">
                                  {NUMS_STAGES.map((s) => (
                                    <div key={s.stage} className="visualLegendRow">
                                      <span className="visualLegendName">{t("settings.games.stageN", { stage: s.stage })}</span>
                                      <span className="visualLegendEx">{s.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flabel">
                              {t("settings.games.bandsForLevel", { level: levelLabel(level) })}
                            </div>
                            <div className="minigameSettingsRow">
                              <div className="minigameSettingsHit">
                                <span className="minigameSettingsTitle">
                                  {t("settings.games.perBandCounts")}
                                </span>
                                <span className="minigameSettingsDesc">
                                  {t("settings.games.perBandCountsHint")}
                                </span>
                              </div>
                              <div className="settingsRowControls">
                                <Toggle
                                  className="settingsToggle"
                                  on={!!curriculum.counts}
                                  onClick={() =>
                                    patchCurriculum(gid, {
                                      counts: curriculum.counts
                                        ? null
                                        : bands.map(() => curriculum.stepsPerBlock),
                                    })
                                  }
                                />
                              </div>
                            </div>
                            {curriculum.counts ? (
                              <p className="curriculumIntro">
                                {t("settings.games.countsHelp")}
                              </p>
                            ) : (
                              <SettingsNumberField
                                id={`stepsPerBlock-${gid}`}
                                label={t("settings.games.stepsPerBand")}
                                min={1}
                                max={20}
                                value={curriculum.stepsPerBlock}
                                onChange={(v) =>
                                  patchCurriculum(gid, {
                                    stepsPerBlock: Math.max(1, v || 1),
                                  })
                                }
                              />
                            )}
                            <div className="bandList">
                              {bands.map((band, idx) => {
                                const range = bandStepRange(
                                  curriculum.counts,
                                  curriculum.stepsPerBlock,
                                  idx
                                );
                                return (
                                  <div key={idx} className="bandCard">
                                    <div className="bandCardHead">
                                      <span>
                                        {t("settings.games.bandN", { n: idx + 1 })} ·{" "}
                                        {range.skipped
                                          ? t("settings.games.skipped")
                                          : t("settings.games.stepsRange", { start: range.start, end: range.end })}
                                      </span>
                                      {bands.length > 1 && (
                                        <button
                                          type="button"
                                          className="bandRemove"
                                          onClick={() => removeBand(gid, level, idx)}
                                        >
                                          {t("settings.games.remove")}
                                        </button>
                                      )}
                                    </div>
                                    <div className="bandFields">
                                      {curriculum.counts && (
                                        <SettingsNumberField
                                          label={t("settings.games.questionCount")}
                                          min={0}
                                          max={MAX_BAND_COUNT}
                                          value={curriculum.counts[idx] ?? 0}
                                          onChange={(v) => setBandCount(gid, idx, v)}
                                        />
                                      )}
                                      {gid === "add" && (() => {
                                        const minSum = Number(band.minSum) || 2;
                                        const maxSum = Number(band.maxSum) || 8;
                                        return (
                                          <>
                                            <SettingsNumberField
                                              label={t("settings.games.minSum")}
                                              value={minSum}
                                              min={2}
                                              max={maxSum - 1}
                                              onChange={(v) =>
                                                updateBandField(gid, level, idx, "minSum", v)
                                              }
                                            />
                                            <SettingsNumberField
                                              label={t("settings.games.maxSum")}
                                              value={maxSum}
                                              min={minSum + 1}
                                              max={200}
                                              onChange={(v) =>
                                                updateBandField(gid, level, idx, "maxSum", v)
                                              }
                                            />
                                          </>
                                        );
                                      })()}
                                      {gid === "mul" && (() => {
                                        const minFactor = Number(band.minFactor) || 1;
                                        const maxFactor = Number(band.maxFactor) || 5;
                                        return (
                                          <>
                                            <SettingsNumberField
                                              label={t("settings.games.minFactor")}
                                              value={minFactor}
                                              min={1}
                                              max={maxFactor - 1}
                                              onChange={(v) =>
                                                updateBandField(gid, level, idx, "minFactor", v)
                                              }
                                            />
                                            <SettingsNumberField
                                              label={t("settings.games.maxFactor")}
                                              value={maxFactor}
                                              min={minFactor + 1}
                                              max={20}
                                              onChange={(v) =>
                                                updateBandField(gid, level, idx, "maxFactor", v)
                                              }
                                            />
                                          </>
                                        );
                                      })()}
                                      {gid === "div" && (
                                        <>
                                          <SettingsNumberField
                                            label={t("settings.games.maxDivisor")}
                                            value={Number(band.maxDivisor) || 3}
                                            min={2}
                                            max={20}
                                            onChange={(v) =>
                                              updateBandField(gid, level, idx, "maxDivisor", v)
                                            }
                                          />
                                          <SettingsNumberField
                                            label={t("settings.games.maxQuotient")}
                                            value={Number(band.maxQuotient) || 5}
                                            min={1}
                                            max={20}
                                            onChange={(v) =>
                                              updateBandField(gid, level, idx, "maxQuotient", v)
                                            }
                                          />
                                        </>
                                      )}
                                      {gid === "sub" && (() => {
                                        const minTop = Number(band.minTop) || 2;
                                        const maxMin = Number(band.maxMin) || 8;
                                        return (
                                          <>
                                            <SettingsNumberField
                                              label={t("settings.games.min")}
                                              value={minTop}
                                              min={2}
                                              max={maxMin - 1}
                                              onChange={(v) =>
                                                updateBandField(gid, level, idx, "minTop", v)
                                              }
                                            />
                                            <SettingsNumberField
                                              label={t("settings.games.max")}
                                              value={maxMin}
                                              min={minTop + 1}
                                              max={200}
                                              onChange={(v) =>
                                                updateBandField(gid, level, idx, "maxMin", v)
                                              }
                                            />
                                          </>
                                        );
                                      })()}
                                      {hasStageBands(gid) && (
                                        <>
                                          <SettingsNumberField
                                            label={t("settings.games.stage")}
                                            value={Number(band.stage) || 1}
                                            min={1}
                                            max={MAX_STAGE}
                                            onChange={(v) =>
                                              updateBandField(gid, level, idx, "stage", v)
                                            }
                                          />
                                          {gid === "nums" && (
                                            <SettingsNumberField
                                              label={t("settings.games.maxNum")}
                                              value={Number(band.maxNum) || 10}
                                              min={2}
                                              max={100}
                                              onChange={(v) =>
                                                updateBandField(gid, level, idx, "maxNum", v)
                                              }
                                            />
                                          )}
                                        </>
                                      )}
                                      {gid === "eng" && (
                                        <SettingsNumberField
                                          label={t("settings.games.maxLen")}
                                          value={Number(band.maxLen) || 0}
                                          min={1}
                                          max={64}
                                          onChange={(v) =>
                                            updateBandField(gid, level, idx, "maxLen", v)
                                          }
                                        />
                                      )}
                                    </div>
                                    {isMathGame(gid) && (
                                      <PillControl
                                        className="bandVisualControl"
                                        options={MATH_VISUAL_OPTIONS}
                                        value={normalizeMathVisual(band.visual, idx)}
                                        onChange={(visual) =>
                                          updateBandField(gid, level, idx, "visual", visual)
                                        }
                                        aria-label={t("settings.games.visualForBand", { n: idx + 1 })}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="btnRow bandActions">
                              <SettingsButton onClick={() => addBand(gid, level)}>
                                {t("settings.games.addBand")}
                              </SettingsButton>
                              <SettingsButton onClick={() => resetCurriculum(gid)}>
                                {t("settings.games.reset")}
                              </SettingsButton>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {section === "minigames" && (
              <>
                <h2 className="settingsPaneTitle">{t("settings.sections.minigames")}</h2>
                <p className="settingsPaneBlurb">
                  {t("settings.minigames.blurb")}
                </p>

                <SettingsNumberField
                  id="playEverySteps"
                  label={t("settings.minigames.everySteps")}
                  min={2}
                  max={20}
                  value={editorDraft.playEverySteps}
                  onChange={(v) =>
                    updateEditorDraft({
                      playEverySteps: Math.max(2, Math.min(20, v || 2)),
                    })
                  }
                />

                <div className="flabel mt-3">{t("settings.minigames.active")}</div>
                <div id="minigameRows" className="minigameSettingsList">
                  {MINIGAME_META.map((m) => {
                    const on = !!editorDraft.minigames[m.id]?.enabled;
                    return (
                      <div key={m.id} className="minigameSettingsRow">
                        <div className="minigameSettingsHit">
                          <span className="minigameSettingsTitle">
                            {m.icon} {m.title}
                          </span>
                          <span className="minigameSettingsDesc">{m.blurb}</span>
                        </div>
                        <div className="settingsRowControls">
                          <SettingsButton onClick={() => previewMinigame(m.id)}>
                            {t("settings.minigames.try")}
                          </SettingsButton>
                          <Toggle
                            className="settingsToggle"
                            on={on}
                            onClick={() => toggleMinigame(m.id)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {section === "advanced" && existing && (
              <>
                <h2 className="settingsPaneTitle">{t("settings.sections.advanced")}</h2>
                <p className="settingsPaneBlurb">
                  {t("settings.advanced.blurb")}
                </p>
                <div id="advChars" className="advCharList">
                  {CHARACTERS.filter((c) => existing.characters[c.id]).map((c) => {
                    const savedXp = Math.max(
                      0,
                      Number(existing.characters[c.id]?.totalXp) || 0
                    );
                    const xp =
                      editorDraft.charXp[c.id] !== undefined
                        ? Math.max(0, Number(editorDraft.charXp[c.id]) || 0)
                        : savedXp;
                    const formIdx = formForXp(xp, c.forms.length);
                    const formNum = formIdx + 1;
                    const art = currentFormArt(c, xp);
                    const thresholds = formThresholds(c.forms.length);
                    const nextAt = thresholds[formIdx + 1];
                    const formLabel =
                      nextAt == null
                        ? t("settings.advanced.formGrown", { n: formNum, total: c.forms.length })
                        : t("settings.advanced.formNext", { n: formNum, total: c.forms.length, at: nextAt });
                    return (
                      <div key={c.id} className="advCharRow">
                        <div className="advCharHit">
                          <div className="advCharArt" aria-hidden>
                            <CharacterArt art={art} size={44} />
                          </div>
                          <div className="advCharText">
                            <span className="advCharName">{c.he}</span>
                            <span className="advCharMeta">{formLabel}</span>
                          </div>
                        </div>
                        <SettingsNumberField
                          id={`char-xp-${c.id}`}
                          label="XP"
                          layout="inline"
                          min={0}
                          step={1}
                          value={xp}
                          onChange={(v) => setCharXp(c.id, v || 0)}
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="btnRow settingsFooter">
            <SettingsButton
              id="profileSave"
              variant="primary"
              onClick={() => saveProfileEditor(name)}
            >
              {t("settings.save")}
            </SettingsButton>
            <SettingsButton
              id="profileCancel"
              onClick={closeProfileEditor}
            >
              {t("settings.cancel")}
            </SettingsButton>
            {existing && !focusGame && (
              <SettingsButton
                id="profileDelete"
                variant="danger"
                onClick={deleteProfileEditor}
              >
                {t("settings.delete")}
              </SettingsButton>
            )}
          </div>
        </div>
      </Panel>

      {typeof document !== "undefined" &&
        minigameOverlay?.preview &&
        previewCharacter &&
        previewFormArt &&
        createPortal(
          <div className="fixed inset-0 z-[19]">
            <div className="absolute inset-0 bg-gradient-to-b from-sky via-sky-mid to-sky-light" />
            <BackgroundScene mode="fill" />
            <MinigameHost
              overlay={minigameOverlay}
              character={previewCharacter}
              formArt={previewFormArt}
            />
            <button
              type="button"
              className="fixed left-3 top-3 z-[20] rounded-[18px] border-none bg-white/95 px-3.5 py-2 text-[17px] font-extrabold text-heading shadow-[0_4px_12px_rgba(0,0,0,.2)]"
              onClick={closeMinigamePreview}
            >
              {t("settings.minigames.closePreview")}
            </button>
          </div>,
          document.body
        )}
    </Screen>
  );
}

