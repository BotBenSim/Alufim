"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AddProfileCard,
  ProfileCard,
} from "@/components/cards/ProfileCard";
import { CharacterCard } from "@/components/cards/CharacterCard";
import { CharacterPreviewOverlay } from "@/components/cards/CharacterPreviewOverlay";
import { GameCard } from "@/components/cards/GameCard";
import { Brand, BrandTitle, KidButton, Screen } from "@/design-system";
import { CHARACTERS } from "@/data/characters";
import { GAME_GROUPS, GAMES } from "@/data/games";
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
  const charSectionRef = useRef<HTMLElement>(null);
  const gameSectionRef = useRef<HTMLElement>(null);
  const playBtnRef = useRef<HTMLDivElement>(null);

  const profile = useMemo(
    () => app.profiles.find((p) => p.id === app.lastProfileId) ?? null,
    [app]
  );

  const enabledGroups = useMemo(
    () =>
      GAME_GROUPS.map((group) => ({
        ...group,
        games: group.games.filter((g) => profile?.games[g]?.enabled),
      })).filter((group) => group.games.length > 0),
    [profile]
  );

  // After each pick, jump the viewport to the next choice.
  useEffect(() => {
    if (!homeCharSection || homeGameSection) return;
    charSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [homeCharSection, homeGameSection, app.lastProfileId]);

  useEffect(() => {
    if (!selectedGameId) return;
    playBtnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedGameId]);

  const handleSelectProfile = (id: string, name: string) => {
    ensure();
    selectProfile(id);
    speak(`שלום ${name}`);
  };

  const handleSelectCharacter = (id: string, he: string) => {
    ensure();
    selectCharacter(id);
    if (previewCharacterId === id) return;
    speak(he);
    setPreviewCharacterId(id);
  };

  const handlePreviewClose = () => {
    setPreviewCharacterId(null);
    // After the animal show, jump to choosing a game.
    window.requestAnimationFrame(() => {
      gameSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSelectGame = (id: GameId) => {
    ensure();
    selectGame(id);
    speak(GAMES[id].title);
  };

  return (
    <Screen id="scrProfiles" scroll contentClassName="gap-7 pb-8">
      <button
        type="button"
        id="aboutBtn"
        className="textbtn glass fixed right-3 top-3 z-5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-heading/80 shadow-soft"
        onClick={() => setScreen("about")}
      >
        ℹ️ אודות
      </button>

      <BrandTitle className="brandWrap">
        <Brand>Alufim</Brand>
      </BrandTitle>

      <section className="flex w-full flex-col items-center">
        <div id="profileCards" className="cards grid w-full max-w-[540px] grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2.5">
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
        <section
          ref={charSectionRef}
          id="charSection"
          className="show flex w-full scroll-mt-4 flex-col items-center gap-6"
        >
          <h2 className="text-center text-[clamp(24px,5vw,32px)] font-bold text-heading">
            בחרו חיה
          </h2>
          <div
            id="charGrid"
            className="charGrid grid w-full max-w-[540px] grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2.5"
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
        <section
          ref={gameSectionRef}
          id="gameSection"
          className="show flex w-full scroll-mt-4 flex-col items-center gap-6"
        >
          <h2 className="text-center text-[clamp(24px,5vw,32px)] font-bold text-heading">
            בחרו משחק
          </h2>
          <div id="gameCardsHome" className="flex w-full max-w-[540px] flex-col gap-4">
            {enabledGroups.map((group) => (
              <div
                key={group.id}
                className="glass flex flex-col gap-3 rounded-panel p-3 shadow-soft"
              >
                <h3 className="flex items-center gap-2 px-1.5 text-[clamp(16px,3.2vw,19px)] font-semibold text-heading">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: `linear-gradient(180deg, ${group.color.from}, ${group.color.to})` }}
                  />
                  {group.title}
                </h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2.5">
                  {group.games.map((gid) => (
                    <GameCard
                      key={gid}
                      gameId={gid}
                      selected={selectedGameId === gid}
                      onClick={() => handleSelectGame(gid)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div ref={playBtnRef} className="scroll-mt-6">
            <KidButton
              id="gamePlay"
              variant="play"
              disabled={!selectedGameId}
              onClick={() => {
                ensure();
                startGame();
              }}
            >
              ▶ שחקו
            </KidButton>
          </div>
        </section>
      )}
      <CharacterPreviewOverlay
        characterId={previewCharacterId}
        onClose={handlePreviewClose}
      />
    </Screen>
  );
}
