"use client";

import { useEffect, useRef } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { MINIGAME_UI } from "@/components/game/minigames/registry";
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
};

export function MinigameHost({ overlay, character, formArt }: Props) {
  const minigameInput = useStore((s) => s.minigameInput);
  const audio = useAudio();
  const { burst } = useConfetti();
  const { speak } = useSpeech();
  const lastMissSpeak = useRef(0);
  const strategy = MINIGAME_UI[overlay.engineId];
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

  const onInput = (input: MinigameInput) => {
    audio.ensure();
    const isMiss = input.quality === "miss";

    if (isMiss) {
      playSfx(strategy.missSfx);
      const now = Date.now();
      if (now - lastMissSpeak.current > 1200) {
        lastMissSpeak.current = now;
        speak("עוד פעם!");
      }
    } else {
      playSfx(strategy.goodSfx);
      burst(14);
    }

    const before = useStore.getState().minigameOverlay;
    minigameInput(input);
    const after = useStore.getState().minigameOverlay;
    if (before && after?.done && !before.done) finishFx();
  };

  // Preview (settings): full overlay. In-run: sits in the question-card slot under the XP bar.
  const shellClass = overlay.preview
    ? "overlay show absolute inset-0 z-[1] flex items-center justify-center bg-transparent"
    : "relative w-full";

  return (
    <div id="ovMinigame" className={shellClass}>
      <div
        className={
          overlay.preview
            ? "relative z-[1] flex h-full w-full max-w-[520px] flex-col items-center justify-center gap-2 px-2 py-3"
            : "relative w-full"
        }
      >
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
          <div className="flex min-h-[min(42vh,360px)] w-full flex-col items-center justify-center gap-1.5 rounded-[26px] bg-white/90 px-3 py-4 shadow-[0_8px_22px_rgba(29,78,122,.18)]">
            <div className="animate-[caughtBounce_1.4s_ease-in-out_infinite] text-[clamp(72px,18vw,140px)] drop-shadow-lg">
              <CharacterArt art={formArt} size={120} />
            </div>
            <div className="text-center text-[clamp(20px,4.5vw,34px)] font-extrabold text-heading [text-shadow:0_1px_0_#fff]">
              ה{character.he} שיחק והתחזק!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
