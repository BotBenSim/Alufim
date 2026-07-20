"use client";

import { useEffect } from "react";
import { CharacterArt } from "@/components/art/CharacterArt";
import { evolveCelebrateLine } from "@/data/characters";
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
      speak("לחצו שוב ושוב — החבר הולך לגדול!");
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
  const revealing =
    overlay.phase === "filmstrip" && overlay.filmstripForm === overlay.formIdx;
  const celebrate = evolveCelebrateLine(c, overlay.formIdx);
  const progress = overlay.taps / Math.max(1, overlay.needed);
  const tapScale = 1 + progress * 0.28;

  return (
    <div
      id="ovEvolve"
      className="overlay show absolute inset-0 z-[11] flex items-center justify-center bg-[rgba(12,28,55,.55)] backdrop-blur-[4px]"
    >
      <div
        id="evolveScene"
        className="flex h-[88vh] w-[min(96vw,560px)] flex-col items-center justify-center gap-4 px-3"
      >
        {overlay.phase === "tap" && (
          <>
            <div className="text-center text-[clamp(22px,5.5vw,36px)] font-black text-white drop-shadow-lg">
              {c.he} מתחזק!
            </div>
            <div
              id="evolveHint"
              className="min-h-[1.2em] text-center text-[clamp(18px,5vw,28px)] font-extrabold text-[#FFE9A8] drop-shadow-md"
            >
              לחצו שוב ושוב! 👆
            </div>
            <div
              id="evolveMeterWrap"
              className="h-[34px] w-[min(78vw,440px)] overflow-hidden rounded-[20px] bg-white/30 shadow-[inset_0_2px_8px_rgba(0,0,0,.28)]"
            >
              <div
                id="evolveMeter"
                className="h-full rounded-[20px] bg-gradient-to-r from-[#FFD93D] via-[#FFB347] to-[#FF8A3D] transition-[width] duration-200"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <button
              type="button"
              id="evolveCreature"
              className="relative mx-auto aspect-square w-[min(78vw,340px)] origin-center border-none bg-transparent p-0"
              style={{
                transform: `scale(${tapScale})`,
                filter: `drop-shadow(0 0 ${12 + overlay.taps * 5}px #FFE9A8) brightness(${1 + progress * 0.35})`,
                transition: "transform 120ms ease-out, filter 120ms ease-out",
              }}
              onClick={() => {
                const before = useStore.getState().evolveOverlay?.taps ?? 0;
                evolveTap();
                const st = useStore.getState().evolveOverlay;
                if (!st || st.taps === before) return;
                if (st.phase === "tap") {
                  playXpGain(Math.min(8, 2 + st.taps));
                  burst(10 + Math.floor(st.taps * 1.5));
                }
                if (st.phase === "filmstrip") {
                  playFanfare();
                  burst(80);
                }
              }}
            >
              <span
                className="pointer-events-none absolute inset-[-8%] rounded-full bg-[radial-gradient(circle,rgba(255,233,168,.45)_0%,transparent_68%)]"
                style={{ opacity: 0.35 + progress * 0.55 }}
                aria-hidden
              />
              <CharacterArt art={fromArt} fill className="pointer-events-none relative" />
            </button>
          </>
        )}

        {(overlay.phase === "filmstrip" || overlay.phase === "done") && (
          <>
            <div
              id="evolveTitle"
              className="text-center text-[clamp(28px,7vw,52px)] font-black text-white drop-shadow-lg"
            >
              {overlay.phase === "done" || revealing ? "התפתח! ✨" : "גדל…"}
            </div>
            {(overlay.phase === "done" || revealing) && (
              <div className="max-w-[22ch] text-center text-[clamp(18px,4.5vw,28px)] font-extrabold leading-snug text-[#FFE9A8] drop-shadow-md">
                {celebrate}
              </div>
            )}
            <div id="evolveStrip" className="flex w-full items-center justify-center">
              <div
                key={`${overlay.phase}-${overlay.filmstripForm}`}
                className="evoCell solo popIn relative mx-auto aspect-square w-[min(84vw,64vh,460px)] animate-evoPop"
                style={{
                  filter:
                    overlay.phase === "done" || revealing
                      ? "drop-shadow(0 0 28px #FFE9A8) brightness(1.15)"
                      : undefined,
                }}
              >
                <CharacterArt art={showArt} fill />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
