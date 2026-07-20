"use client";

import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import {
  AddProfileCard,
  ProfileCard,
} from "@/components/cards/ProfileCard";
import { CharacterCard } from "@/components/cards/CharacterCard";
import { CharacterPreviewOverlay } from "@/components/cards/CharacterPreviewOverlay";
import { GameCard } from "@/components/cards/GameCard";
import { Brand, BrandTitle, KidButton, Screen } from "@/design-system";
import { CHARACTERS } from "@/data/characters";
import { GAME_ORDER, GAMES } from "@/data/games";
import type { GameId } from "@/lib/types";
import { useStore } from "@/state/store";
import { useAudio } from "@/hooks/useAudio";
import { useSpeech } from "@/hooks/useSpeech";

export function ProfilesScreen() {
  const app = useStore((s) => s.app);
  const homeCharSection = useStore((s) => s.homeCharSection);
  const homeGameSection = useStore((s) => s.homeGameSection);
  const selectedGameId = useStore((s) => s.selectedGameId);
  const selectProfile = useStore((s) => s.selectProfile);
  const selectCharacter = useStore((s) => s.selectCharacter);
  const selectGame = useStore((s) => s.selectGame);
  const startGame = useStore((s) => s.startGame);
  const openProfileEditor = useStore((s) => s.openProfileEditor);
  const setScreen = useStore((s) => s.setScreen);

  const { ensure } = useAudio();
  const { speak } = useSpeech();
  const [previewCharacterId, setPreviewCharacterId] = useState<string | null>(null);

  const profile = useMemo(
    () => app.profiles.find((p) => p.id === app.lastProfileId) ?? null,
    [app]
  );

  const enabledGames = useMemo(
    () => GAME_ORDER.filter((g) => profile?.games[g]?.enabled),
    [profile]
  );

  const handleSelectProfile = (id: string, name: string) => {
    selectProfile(id);
    speak(`שלום ${name}`);
    ensure();
  };

  const handleSelectCharacter = (id: string, he: string) => {
    if (previewCharacterId === id) return;
    selectCharacter(id);
    if (previewCharacterId) {
      flushSync(() => setPreviewCharacterId(null));
    }
    speak(he);
    ensure();
    setPreviewCharacterId(id);
  };

  const handleSelectGame = (id: GameId) => {
    selectGame(id);
    speak(GAMES[id].title);
    ensure();
  };

  return (
    <Screen id="scrProfiles" scroll className="gap-10 pb-8">
      <button
        type="button"
        id="aboutBtn"
        className="textbtn fixed right-3 top-2.5 z-[5] rounded-2xl bg-white/55 px-3 py-1 text-[13px] font-bold text-heading opacity-65 shadow-sm"
        onClick={() => setScreen("about")}
      >
        ℹ️ אודות
      </button>

      <BrandTitle className="brandWrap">
        <Brand>Alufim</Brand>
      </BrandTitle>

      <section className="w-full">
        <div id="profileCards" className="cards mx-auto grid w-[min(94vw,620px)] grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-3.5">
          {app.profiles.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              selected={p.id === app.lastProfileId}
              onSelect={() => handleSelectProfile(p.id, p.name)}
              onEdit={() => openProfileEditor(p.id)}
            />
          ))}
          <AddProfileCard onClick={() => openProfileEditor(null)} />
        </div>
      </section>

      {homeCharSection && profile && (
        <section id="charSection" className="show flex w-full flex-col items-center gap-10">
          <h2 className="text-center text-[clamp(24px,5vw,36px)] font-extrabold text-heading">
            בחרו חיה
          </h2>
          <div
            id="charGrid"
            className="charGrid grid w-[min(94vw,620px)] grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-3.5"
          >
            {CHARACTERS.map((c) => {
              const owned = !!profile.characters[c.id];
              const prog = profile.characters[c.id];
              return (
                <CharacterCard
                  key={c.id}
                  character={c}
                  owned={owned}
                  totalXp={prog?.totalXp}
                  picked={profile.activeCharacterId === c.id}
                  onClick={() => owned && handleSelectCharacter(c.id, c.he)}
                />
              );
            })}
          </div>
        </section>
      )}

      {homeGameSection && profile && (
        <section id="gameSection" className="show flex w-full flex-col items-center gap-10">
          <h2 className="text-center text-[clamp(24px,5vw,36px)] font-extrabold text-heading">
            בחרו משחק
          </h2>
          <div
            id="gameCardsHome"
            className="grid w-[min(94vw,620px)] grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-3.5"
          >
            {enabledGames.map((gid) => (
              <GameCard
                key={gid}
                gameId={gid}
                selected={selectedGameId === gid}
                onClick={() => handleSelectGame(gid)}
              />
            ))}
          </div>
          <KidButton
            id="gamePlay"
            variant="play"
            disabled={!selectedGameId}
            onClick={() => {
              ensure();
              startGame();
            }}
          >
            ▶️ שחקו!
          </KidButton>
        </section>
      )}
      <CharacterPreviewOverlay
        characterId={previewCharacterId}
        onClose={() => setPreviewCharacterId(null)}
      />
    </Screen>
  );
}
