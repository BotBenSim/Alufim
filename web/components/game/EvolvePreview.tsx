"use client";

import { useEffect } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { useAudio } from "@/hooks/useAudio";
import { useConfetti } from "@/hooks/useConfetti";
import { useSpeech } from "@/hooks/useSpeech";
import { useStore } from "@/state/store";

export function EvolvePreview() {
  const run = useStore((s) => s.run);
  const overlay = useStore((s) => s.evolveOverlay);
  const evolveTap = useStore((s) => s.evolveTap);
  const { playXpGain, playFanfare } = useAudio();
  const { burst } = useConfetti();
  const { speak } = useSpeech();

  useEffect(() => {
    if (overlay?.phase === "tap" && overlay.taps === 0) {
      speak("לחצו כדי להתפתח!");
    }
  }, [overlay?.phase, overlay?.taps, speak]);

  if (!run || !overlay) return null;

  const c = run.character;
  const fromIdx = Math.max(0, overlay.formIdx - 1);
  const fromArt = c.forms[fromIdx];
  const showArt =
    overlay.phase === "filmstrip" || overlay.phase === "done"
      ? c.forms[overlay.filmstripForm]
      : fromArt;

  return (
    <div
      id="ovEvolve"
      className="overlay show absolute inset-0 z-[11] flex items-center justify-center bg-[rgba(20,40,70,.45)] backdrop-blur-[3px]"
    >
      <div id="evolveScene" className="flex h-[84vh] w-[96vw] flex-col items-center justify-center gap-5">
        {overlay.phase === "done" && (
          <div id="evolveTitle" className="text-center text-[clamp(26px,7vw,48px)] font-black text-white drop-shadow-lg">
            התפתח! ✨
          </div>
        )}

        {overlay.phase === "tap" && (
          <>
            <div id="evolveHint" className="min-h-[1.2em] text-center text-[clamp(18px,5vw,30px)] font-extrabold text-white drop-shadow-md">
              לחצו שוב ושוב! 👆
            </div>
            <div id="evolveMeterWrap" className="h-[30px] w-[min(74vw,420px)] overflow-hidden rounded-[18px] bg-white/35 shadow-[inset_0_2px_6px_rgba(0,0,0,.25)]">
              <div
                id="evolveMeter"
                className="h-full rounded-[18px] bg-gradient-to-r from-[#FFD93D] to-[#FF8A3D] transition-[width] duration-200"
                style={{ width: `${Math.round((overlay.taps / overlay.needed) * 100)}%` }}
              />
            </div>
            <button
              type="button"
              id="evolveCreature"
              className="charArt h-[clamp(150px,44vw,300px)] w-[clamp(150px,44vw,300px)] border-none bg-transparent p-0 transition-transform"
              style={{
                transform: `scale(${1 + overlay.taps * 0.05})`,
                filter: `drop-shadow(0 0 ${8 + overlay.taps * 4}px #FFE9A8) brightness(${1 + overlay.taps * 0.06})`,
              }}
              onClick={() => {
                evolveTap();
                const st = useStore.getState().evolveOverlay;
                if (st?.phase === "tap") {
                  playXpGain(Math.min(7, 2 + st.taps));
                  burst(8);
                }
                if (st?.phase === "filmstrip") {
                  playFanfare();
                  burst(60);
                }
              }}
            >
              <CharacterArt art={fromArt} size={280} className="h-full w-full" />
            </button>
          </>
        )}

        {(overlay.phase === "filmstrip" || overlay.phase === "done") && (
          <div id="evolveStrip" className="flex w-full items-center justify-center">
            <div className="evoCell solo popIn h-[min(80vw,62vh,440px)] w-[min(80vw,62vh,440px)] animate-evoPop">
              <CharacterArt art={showArt} size={420} className="h-full w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
