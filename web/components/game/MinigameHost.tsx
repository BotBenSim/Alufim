"use client";

import { useEffect, useRef } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { getMinigameUi } from "@/components/game/minigames/registry";
import { currentFormArt } from "@/lib/missions";
import type { ArtDescriptor, CharacterDef } from "@/lib/types";
import type { MinigameInput, MinigameOverlay } from "@/lib/minigames/types";
import { useAudio, type MinigameSfx } from "@/hooks/useAudio";
import { useConfetti } from "@/hooks/useConfetti";
import { useSpeech } from "@/hooks/useSpeech";
import { useStore } from "@/state/store";

type Props = {
  overlay: MinigameOverlay;
  character: CharacterDef;
  formArt: ArtDescriptor;
  totalXp: number;
};

export function MinigameHost({ overlay, character, formArt }: Props) {
  const minigameInput = useStore((s) => s.minigameInput);
  const audio = useAudio();
  const { burst } = useConfetti();
  const { speak } = useSpeech();
  const lastMissSpeak = useRef(0);
  const strategy = getMinigameUi(overlay.engineId);
  const View = strategy.View;

  useEffect(() => {
    if (!overlay.done) speak(overlay.session.promptHe);
  }, [overlay.session.skinId, overlay.done, overlay.session.promptHe, speak]);

  const playSfx = (sfx: MinigameSfx) => {
    audio.ensure();
    audio.playMinigameSfx(sfx, character.id);
  };

  const finishFx = () => {
    playSfx("fanfare");
    burst(90);
    speak(`ה${character.he} שיחק והתחזק!`);
  };

  const onInput = (input: MinigameInput, opts?: { good?: boolean }) => {
    audio.ensure();
    const isMiss =
      opts?.good === false ||
      (input.type === "action" && input.quality === "miss");
    const isGood = !isMiss && opts?.good !== false;

    if (isMiss) {
      playSfx(strategy.missSfx);
      const now = Date.now();
      if (now - lastMissSpeak.current > 1200) {
        lastMissSpeak.current = now;
        speak("עוד פעם!");
      }
    } else if (isGood) {
      playSfx(strategy.goodSfx);
      burst(14);
    }

    const before = useStore.getState().minigameOverlay;
    minigameInput(input);
    const after = useStore.getState().minigameOverlay;
    if (before && after?.done && !before.done) finishFx();
  };

  return (
    <div
      id="ovMinigame"
      className={
        overlay.preview
          ? "overlay show absolute inset-0 z-[1] flex items-center justify-center bg-transparent"
          : "overlay show absolute inset-0 z-[9] flex items-center justify-center bg-transparent"
      }
    >
      {/* Soft veil so score/prompt stay readable over the shared sky */}
      <div className="pointer-events-none absolute inset-0 bg-white/25" />
      <div className="relative z-[1] flex h-full w-full max-w-[960px] flex-col items-center justify-center gap-2 px-2 py-3">
        {!overlay.done && (
          <View
            session={overlay.session}
            formArt={formArt}
            character={character}
            onInput={onInput}
            playSfx={playSfx}
          />
        )}
        {overlay.done && (
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5">
            <div className="animate-[caughtBounce_1.4s_ease-in-out_infinite] text-[clamp(90px,22vw,170px)] drop-shadow-lg">
              <CharacterArt art={formArt} size={160} />
            </div>
            <div className="text-[clamp(40px,9vw,64px)]">✨</div>
            <div className="text-[clamp(24px,6vw,42px)] font-extrabold text-heading [text-shadow:0_1px_0_#fff]">
              ה{character.he} שיחק והתחזק!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function formArtFor(character: CharacterDef, totalXp: number) {
  return currentFormArt(character, totalXp);
}
