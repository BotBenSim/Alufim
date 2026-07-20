"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { MinigameHost } from "@/components/game/MinigameHost";
import { Brand, KidButton, Screen, SegmentedControl, Toggle } from "@/design-system";
import { CHARACTERS, characterById } from "@/data/characters";
import { GAMES, GAME_ORDER } from "@/data/games";
import { MINIGAME_META } from "@/data/minigameMeta";
import { PHOTOS } from "@/data/photos";
import { currentFormArt } from "@/lib/missions";
import { formForXp } from "@/lib/xp";
import type { DifficultyLevel, GameId } from "@/lib/types";
import type { MinigameEngineId } from "@/lib/minigames/types";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";

const LEVEL_OPTIONS = [
  ["easy", "קל"],
  ["medium", "בינוני"],
  ["hard", "קשה"],
] as const;

const AVATAR_EMOJIS = ["🦄", "🦖", "🚀", "🐬", "🦁", "🐶", "🐱", "🐉", "🐧", "🐼", "🦊", "🐢"];

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

  const setAvatar = (avatar: string) => updateEditorDraft({ avatar });

  const toggleGame = (gid: GameId) => {
    const games = { ...editorDraft.games };
    games[gid] = { ...games[gid], enabled: !games[gid].enabled };
    updateEditorDraft({ games });
  };

  const toggleMinigame = (id: MinigameEngineId) => {
    const minigames = { ...editorDraft.minigames };
    const nextOn = !minigames[id]?.enabled;
    // Keep at least one mini-game on so the play beat never soft-locks
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

  return (
    <Screen id="scrProfileEdit" scroll>
      <Brand className="text-[clamp(30px,6vw,52px)] text-heading">Alufim</Brand>
      <div className="formCard mx-auto w-[min(94vw,520px)]">
        <h2 id="profileEditTitle" className="text-center text-2xl font-extrabold text-heading">
          {existing ? `עריכת ${existing.name}` : "פרופיל חדש"}
        </h2>

        <label className="flabel" htmlFor="profileName">
          שם
        </label>
        <input
          id="profileName"
          className="finput"
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
                editorDraft.avatar === e ? "border-[#2E9E5B] shadow-[0_0_0_3px_rgba(46,158,91,.25)]" : "border-transparent"
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

        <div className="flabel">משחקי למידה</div>
        <div id="gameRows">
          {GAME_ORDER.map((gid) => {
            const cfg = editorDraft.games[gid];
            const g = GAMES[gid];
            return (
              <div key={gid} className="gameRow flex flex-wrap items-center gap-2 border-t border-[#E2ECF5] py-2">
                <div className="gName flex-1 text-base font-extrabold text-heading">
                  {g.icon} {g.title}
                </div>
                <Toggle
                  on={cfg.enabled}
                  onClick={() => toggleGame(gid)}
                />
                <SegmentedControl
                  options={LEVEL_OPTIONS.map(([value, label]) => ({ value, label }))}
                  value={cfg.level}
                  onChange={(level) => setLevel(gid, level as DifficultyLevel)}
                  disabled={!cfg.enabled}
                />
              </div>
            );
          })}
        </div>

        <div className="flabel mt-3">משחקונים בהפסקה</div>
        <p className="mb-1 text-sm font-bold text-[#456]">
          איזה משחקונים יופיעו כל כמה שאלות (לפחות אחד חייב להיות דלוק)
        </p>
        <div id="minigameRows">
          {MINIGAME_META.map((m) => {
            const on = !!editorDraft.minigames[m.id]?.enabled;
            return (
              <div
                key={m.id}
                className="gameRow flex flex-wrap items-center gap-2 border-t border-[#E2ECF5] py-2"
              >
                <div className="gName min-w-0 flex-1">
                  <div className="text-base font-extrabold text-heading">
                    {m.icon} {m.title}
                  </div>
                  <div className="text-sm font-bold text-[#5A7A94]">{m.blurb}</div>
                </div>
                <KidButton
                  variant="text"
                  className="shrink-0 px-2 text-[15px] font-extrabold"
                  onClick={() => previewMinigame(m.id)}
                >
                  נסו ▶
                </KidButton>
                <Toggle on={on} onClick={() => toggleMinigame(m.id)} />
              </div>
            );
          })}
        </div>

        {existing && (
          <div id="advSection" className="mt-2">
            <div className="flabel">מתקדם — XP לחיות</div>
            <div id="advChars">
              {CHARACTERS.filter((c) => existing.characters[c.id]).map((c) => {
                const xp = editorDraft.charXp[c.id] ?? 0;
                const form = formForXp(xp, c.forms.length) + 1;
                return (
                  <div key={c.id} className="gameRow flex flex-wrap items-center gap-2 border-t border-[#E2ECF5] py-2">
                    <div className="gName flex-1 font-extrabold text-heading">{c.he}</div>
                    <input
                      className="finput w-[100px]"
                      type="number"
                      min={0}
                      step={1}
                      value={xp}
                      onChange={(e) => setCharXp(c.id, parseInt(e.target.value, 10) || 0)}
                    />
                    <span className="advForm text-sm font-bold text-[#2F6B9E]">
                      צורה {form}/{c.forms.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="btnRow mt-4 flex flex-wrap justify-center gap-3">
          <KidButton variant="panel" id="profileSave" onClick={() => saveProfileEditor(name)}>
            💾 שמרו
          </KidButton>
          <KidButton variant="text" id="profileCancel" onClick={() => setScreen("profiles")}>
            ביטול
          </KidButton>
          {existing && (
            <KidButton variant="panelRed" id="profileDelete" onClick={deleteProfileEditor}>
              🗑️ מחקו
            </KidButton>
          )}
        </div>
      </div>

      {typeof document !== "undefined" &&
        minigameOverlay?.preview &&
        previewCharacter &&
        previewFormArt &&
        createPortal(
          <>
            <MinigameHost
              overlay={minigameOverlay}
              character={previewCharacter}
              formArt={previewFormArt}
              totalXp={previewXp}
            />
            <button
              type="button"
              className="fixed left-3 top-3 z-[20] rounded-[18px] border-none bg-white/95 px-3.5 py-2 text-[17px] font-extrabold text-heading shadow-[0_4px_12px_rgba(0,0,0,.2)]"
              onClick={closeMinigamePreview}
            >
              ✕ סגרו
            </button>
          </>,
          document.body
        )}
    </Screen>
  );
}
