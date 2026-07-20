"use client";

import { useEffect, useRef } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { CatchView } from "@/components/game/minigames/CatchView";
import { MeterBurstView } from "@/components/game/minigames/MeterBurstView";
import { PathDashView } from "@/components/game/minigames/PathDashView";
import { SliceSwipeView } from "@/components/game/minigames/SliceSwipeView";
import { TapCollectView } from "@/components/game/minigames/TapCollectView";
import { TimingBounceView } from "@/components/game/minigames/TimingBounceView";
import { currentFormArt } from "@/lib/missions";
import type { ArtDescriptor, CharacterDef } from "@/lib/types";
import type { MinigameInput, MinigameOverlay } from "@/lib/minigames/types";
import { useAudio } from "@/hooks/useAudio";
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
  const { ensure, playCorrect, playWrong, playFanfare } = useAudio();
  const { burst } = useConfetti();
  const { speak } = useSpeech();
  const lastMissSpeak = useRef(0);

  useEffect(() => {
    if (!overlay.done) speak(overlay.session.promptHe);
  }, [overlay.session.skinId, overlay.done, overlay.session.promptHe, speak]);

  const finishFx = () => {
    playFanfare();
    burst(90);
    speak(`ה${character.he} שיחק והתחזק!`);
  };

  const send = (input: MinigameInput, opts?: { good?: boolean }) => {
    ensure();
    const good = opts?.good !== false && !(input.type === "action" && input.quality === "miss");
    if (input.type === "action" && input.quality === "miss") {
      playWrong();
      const now = Date.now();
      if (now - lastMissSpeak.current > 1200) {
        lastMissSpeak.current = now;
        speak("עוד פעם!");
      }
    } else if (good) {
      playCorrect();
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
          ? "overlay show z-[19] flex items-center justify-center backdrop-blur-[3px]"
          : "overlay show absolute inset-0 z-[9] flex items-center justify-center backdrop-blur-[3px]"
      }
      style={{
        position: overlay.preview ? "fixed" : undefined,
        inset: overlay.preview ? 0 : undefined,
        background: `radial-gradient(circle at 50% 40%, ${character.sky}, ${character.accent})`,
      }}
    >
      <div className="relative flex h-[84vh] w-[96vw] flex-col items-center justify-start gap-2 pt-[2%]">
        {!overlay.done && (
          <>
            <div className="w-full text-center text-[clamp(22px,5.5vw,40px)] font-extrabold text-heading">
              {overlay.session.promptHe}
            </div>
            {overlay.engineId === "pathDash" && (
              <PathDashView
                session={overlay.session}
                formArt={formArt}
                onJump={(quality) =>
                  send({ type: "action", action: "jump", quality }, { good: quality === "good" })
                }
              />
            )}
            {overlay.engineId === "timingBounce" && (
              <TimingBounceView
                session={overlay.session}
                formArt={formArt}
                onHop={(quality) =>
                  send({ type: "action", action: "hop", quality }, { good: quality === "good" })
                }
              />
            )}
            {overlay.engineId === "sliceSwipe" && (
              <SliceSwipeView
                session={overlay.session}
                onSlice={(quality, emoji) =>
                  send(
                    { type: "action", action: "slice", quality, targetId: emoji },
                    { good: quality === "good" }
                  )
                }
              />
            )}
            {overlay.engineId === "meterBurst" && (
              <MeterBurstView session={overlay.session} onTap={() => send({ type: "tap" })} />
            )}
            {overlay.engineId === "tapCollect" && (
              <TapCollectView
                session={overlay.session}
                onTapTarget={(targetId) => send({ type: "tap", targetId })}
              />
            )}
            {overlay.engineId === "catch" && (
              <CatchView
                session={overlay.session}
                onTapTarget={(targetId) => send({ type: "tap", targetId })}
                onMiss={() => send({ type: "tap" }, { good: false })}
              />
            )}
          </>
        )}
        {overlay.done && (
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5">
            <div className="animate-[caughtBounce_1.4s_ease-in-out_infinite] text-[clamp(90px,22vw,170px)] drop-shadow-lg">
              <CharacterArt art={formArt} size={160} />
            </div>
            <div className="text-[clamp(40px,9vw,64px)]">✨</div>
            <div className="text-[clamp(24px,6vw,42px)] font-extrabold text-heading">
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
