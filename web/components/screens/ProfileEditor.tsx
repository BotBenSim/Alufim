"use client";

import { useState } from "react";
import { Brand, KidButton, Screen, SegmentedControl, Toggle } from "@/design-system";
import { CHARACTERS } from "@/data/characters";
import { GAMES, GAME_ORDER } from "@/data/games";
import { PHOTOS } from "@/data/photos";
import { formForXp } from "@/lib/xp";
import type { DifficultyLevel, GameId } from "@/lib/types";
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
  const updateEditorDraft = useStore((s) => s.updateEditorDraft);
  const saveProfileEditor = useStore((s) => s.saveProfileEditor);
  const deleteProfileEditor = useStore((s) => s.deleteProfileEditor);
  const setScreen = useStore((s) => s.setScreen);

  const existing = app.profiles.find((p) => p.id === editingProfileId);
  const [name, setName] = useState(existing?.name ?? "");

  if (!editorDraft) return null;

  const setAvatar = (avatar: string) => updateEditorDraft({ avatar });

  const toggleGame = (gid: GameId) => {
    const games = { ...editorDraft.games };
    games[gid] = { ...games[gid], enabled: !games[gid].enabled };
    updateEditorDraft({ games });
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
          {[PHOTOS.ellie, PHOTOS.ethan, PHOTOS.nova, PHOTOS.uni].map((ph) => (
            <button
              key={ph.slice(0, 32)}
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

        <div className="flabel">משחקים</div>
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
    </Screen>
  );
}
