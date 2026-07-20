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
import { PHOTOS } from "@/data/photos";
import {
  clampCurriculum,
  defaultCurriculum,
  MATH_VISUAL_OPTIONS,
  normalizeMathVisual,
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
} from "@/lib/types";
import type { MinigameEngineId } from "@/lib/minigames/types";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";

const AVATAR_EMOJIS = ["🦄", "🦖", "🚀", "🐬", "🦁", "🐶", "🐱", "🐉", "🐧", "🐼", "🦊", "🐢"];

type SettingsSection = "profile" | "games" | "minigames" | "advanced";

const SECTIONS: { id: SettingsSection; label: string; existingOnly?: boolean }[] = [
  { id: "profile", label: "פרופיל" },
  { id: "games", label: "משחקי למידה" },
  { id: "minigames", label: "משחקונים" },
  { id: "advanced", label: "מתקדם", existingOnly: true },
];

function emptyBand(gameId: GameId): DifficultyBand {
  if (gameId === "add") return { minSum: 2, maxSum: 8, visual: "fullCount" };
  if (gameId === "sub") return { minTop: 2, maxMin: 8, visual: "fullCount" };
  if (gameId === "find") return { maxNum: 5, qLo: 1, qHi: 4 };
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
  const setScreen = useStore((s) => s.setScreen);

  const existing = app.profiles.find((p) => p.id === editingProfileId);
  const [name, setName] = useState(existing?.name ?? "");
  const [section, setSection] = useState<SettingsSection>("profile");
  const [expandedGame, setExpandedGame] = useState<GameId | null>(null);
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

  const displayName = name.trim() || existing?.name || "פרופיל חדש";
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

  const setAvatar = (next: string) => updateEditorDraft({ avatar: next });

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
    patch: Partial<{ stepsPerBlock: number; bands: GameCurriculum["bands"] }>
  ) => {
    const games = { ...editorDraft.games };
    const prev = games[gid].curriculum;
    const next = clampCurriculum(gid, {
      stepsPerBlock: patch.stepsPerBlock ?? prev.stepsPerBlock,
      bands: patch.bands ?? prev.bands,
    });
    games[gid] = { ...games[gid], curriculum: next };
    updateEditorDraft({ games });
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
    band[field] = value;
    levelBands[bandIndex] = band;
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
      <Brand className="text-[clamp(28px,5vw,44px)] text-heading">Alufim</Brand>

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
              {existing ? "הגדרות השחקן" : "פרופיל חדש"}
            </div>
          </div>

          <nav className="settingsNav" aria-label="סעיפי הגדרות">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn("settingsNavItem", section === item.id && "is-active")}
                onClick={() => goSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="settingsMain">
          <div key={sectionKey} className="settingsPane">
            {section === "profile" && (
              <>
                <h2 className="settingsPaneTitle">פרופיל</h2>
                <label className="flabel profileNameLabel" htmlFor="profileName">
                  שם
                </label>
                <input
                  id="profileName"
                  className="finput profileNameInput"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ילד/ה"
                />

                <div className="flabel">תמונה</div>
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
                      onClick={() => setAvatar(ph)}
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
                <h2 className="settingsPaneTitle">משחקי למידה</h2>
                <p className="settingsPaneBlurb">
                  בחרו אילו משחקים יהיו זמינים לילד, הגדירו רמת קושי לכל משחק,
                  ודרך ״התאמה״ כוונו במדויק את הקטעים, הטווחים והתצוגה.
                </p>
                <div id="gameRows" className="gameSettingsList">
                  {GAME_ORDER.map((gid) => {
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
                              {open ? "סגור" : "התאמה"}
                              <span aria-hidden>{open ? "▴" : "▾"}</span>
                            </button>
                          </div>
                        </div>

                        {open && (
                          <div className="gameCurriculumPanel">
                            <p className="curriculumIntro">
                              {gid === "add" || gid === "sub"
                                ? "המשחק מחולק לקטעים. בכל קטע אפשר לקבוע את רמת הקושי (טווח המספרים) ואת התצוגה. אחרי מספר שלבים קבוע עוברים לקטע הבא — כך אפשר להתחיל פשוט ולהעלות בהדרגה."
                                : "המשחק מחולק לקטעים. בכל קטע אפשר לקבוע את רמת הקושי. אחרי מספר שלבים קבוע עוברים לקטע הבא — כך אפשר להתחיל פשוט ולהעלות בהדרגה."}
                            </p>

                            {(gid === "add" || gid === "sub") && (
                              <div className="visualLegend">
                                <div className="visualLegendTitle">תצוגה</div>
                                <div className="visualLegendRows">
                                  <div className="visualLegendRow">
                                    <span className="visualLegendName">ספירה</span>
                                    <span className="visualLegendEx" dir="ltr">
                                      {gid === "sub" ? "🍎🍎🍎🍎 − 🍎🍎" : "🍎🍎 + 🍎🍎🍎"}
                                    </span>
                                  </div>
                                  <div className="visualLegendRow">
                                    <span className="visualLegendName">מעורב</span>
                                    <span className="visualLegendEx" dir="ltr">
                                      {gid === "sub" ? "5 − 🍎🍎" : "2 + 🍎🍎🍎"}
                                    </span>
                                  </div>
                                  <div className="visualLegendRow">
                                    <span className="visualLegendName">ספרות</span>
                                    <span className="visualLegendEx" dir="ltr">
                                      {gid === "sub" ? "5 − 2" : "2 + 3"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flabel">
                              קטעים — רמה {levelLabelHe(level)}
                            </div>
                            <SettingsNumberField
                              id={`stepsPerBlock-${gid}`}
                              label="שלבים בכל קטע"
                              min={1}
                              max={20}
                              value={curriculum.stepsPerBlock}
                              onChange={(v) =>
                                patchCurriculum(gid, {
                                  stepsPerBlock: Math.max(1, v || 1),
                                })
                              }
                            />
                            <div className="bandList">
                              {bands.map((band, idx) => {
                                const stepStart = idx * curriculum.stepsPerBlock + 1;
                                const stepEnd = (idx + 1) * curriculum.stepsPerBlock;
                                return (
                                  <div key={idx} className="bandCard">
                                    <div className="bandCardHead">
                                      <span>
                                        קטע {idx + 1} · שלבים {stepStart}–{stepEnd}
                                      </span>
                                      {bands.length > 1 && (
                                        <button
                                          type="button"
                                          className="bandRemove"
                                          onClick={() => removeBand(gid, level, idx)}
                                        >
                                          הסר
                                        </button>
                                      )}
                                    </div>
                                    <div className="bandFields">
                                      {gid === "add" && (
                                        <>
                                          <SettingsNumberField
                                            label="סכום מינ׳"
                                            value={Number(band.minSum) || 0}
                                            onChange={(v) =>
                                              updateBandField(gid, level, idx, "minSum", v)
                                            }
                                          />
                                          <SettingsNumberField
                                            label="סכום מקס׳"
                                            value={Number(band.maxSum) || 0}
                                            onChange={(v) =>
                                              updateBandField(gid, level, idx, "maxSum", v)
                                            }
                                          />
                                        </>
                                      )}
                                      {gid === "sub" && (
                                        <>
                                          <SettingsNumberField
                                            label="מינ׳"
                                            value={Number(band.minTop) || 0}
                                            onChange={(v) =>
                                              updateBandField(gid, level, idx, "minTop", v)
                                            }
                                          />
                                          <SettingsNumberField
                                            label="מקס׳"
                                            value={Number(band.maxMin) || 0}
                                            onChange={(v) =>
                                              updateBandField(gid, level, idx, "maxMin", v)
                                            }
                                          />
                                        </>
                                      )}
                                      {gid === "find" && (
                                        <>
                                          <SettingsNumberField
                                            label="מספר עד"
                                            value={Number(band.maxNum) || 0}
                                            onChange={(v) =>
                                              updateBandField(gid, level, idx, "maxNum", v)
                                            }
                                          />
                                          <SettingsNumberField
                                            label="טווח נמוך"
                                            value={Number(band.qLo) || 0}
                                            onChange={(v) =>
                                              updateBandField(gid, level, idx, "qLo", v)
                                            }
                                          />
                                          <SettingsNumberField
                                            label="טווח גבוה"
                                            value={Number(band.qHi) || 0}
                                            onChange={(v) =>
                                              updateBandField(gid, level, idx, "qHi", v)
                                            }
                                          />
                                        </>
                                      )}
                                      {gid === "eng" && (
                                        <SettingsNumberField
                                          label="אורך מקס׳"
                                          value={Number(band.maxLen) || 0}
                                          onChange={(v) =>
                                            updateBandField(gid, level, idx, "maxLen", v)
                                          }
                                        />
                                      )}
                                    </div>
                                    {(gid === "add" || gid === "sub") && (
                                      <PillControl
                                        className="bandVisualControl"
                                        options={MATH_VISUAL_OPTIONS}
                                        value={normalizeMathVisual(band.visual, idx)}
                                        onChange={(visual) =>
                                          updateBandField(gid, level, idx, "visual", visual)
                                        }
                                        aria-label={`תצוגה לקטע ${idx + 1}`}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="btnRow bandActions">
                              <SettingsButton onClick={() => addBand(gid, level)}>
                                + הוסף קטע
                              </SettingsButton>
                              <SettingsButton onClick={() => resetCurriculum(gid)}>
                                איפוס לברירת מחדל
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
                <h2 className="settingsPaneTitle">משחקונים</h2>
                <p className="settingsPaneBlurb">
                  בין שלבי הלמידה מופיעה הפסקה קצרה עם משחקון — זה עוזר לשמור על
                  ריכוז, נותן ניצחונות קלים ומשהו לחכות לו. כאן קובעים כמה תכופות
                  היא מגיעה, ואילו משחקונים ייכנסו להגרלה (לפחות אחד פעיל).
                </p>

                <SettingsNumberField
                  id="playEverySteps"
                  label="הפסקה כל כמה שלבי למידה"
                  min={2}
                  max={20}
                  value={editorDraft.playEverySteps}
                  onChange={(v) =>
                    updateEditorDraft({
                      playEverySteps: Math.max(2, Math.min(20, v || 2)),
                    })
                  }
                />

                <div className="flabel mt-3">משחקונים פעילים</div>
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
                            נסו
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
                <h2 className="settingsPaneTitle">מתקדם</h2>
                <p className="settingsPaneBlurb">
                  כאן אפשר לשנות ידנית כמה XP יש לכל חיה — וכך גם באיזו צורה היא
                  נמצאת.
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
                        ? `צורה ${formNum} מתוך ${c.forms.length} · בוגר`
                        : `צורה ${formNum} מתוך ${c.forms.length} · הבאה ב־${nextAt} XP`;
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
              שמירה
            </SettingsButton>
            <SettingsButton
              id="profileCancel"
              onClick={() => setScreen("profiles")}
            >
              ביטול
            </SettingsButton>
            {existing && (
              <SettingsButton
                id="profileDelete"
                variant="danger"
                onClick={deleteProfileEditor}
              >
                מחיקה
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
              ✕ סגרו
            </button>
          </div>,
          document.body
        )}
    </Screen>
  );
}

function levelLabelHe(level: DifficultyLevel): string {
  return level === "hard" ? "קשה" : level === "medium" ? "בינוני" : "קל";
}
