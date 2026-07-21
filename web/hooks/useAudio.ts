"use client";

import { useCallback, useRef } from "react";
import {
  characterMinigameNotes,
  type MinigameSfx,
} from "@/lib/audio/characterMinigameSfx";

export type { MinigameSfx };

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  const ensure = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = new Ctx();
      } catch {
        return null;
      }
    }
    const ctx = ctxRef.current;
    if (ctx?.state === "suspended") {
      void ctx.resume().catch(() => {});
    }
    return ctx;
  }, []);

  const tone = useCallback(
    (freq: number, t0: number, dur: number, type: OscillatorType = "sine", vol = 0.25) => {
      const ctx = ensure();
      if (!ctx) return;
      const attack = 0.018;
      const playDur = Math.max(dur, attack + 0.05);
      const start = ctx.currentTime + Math.max(0, t0);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      // linearRamp — exponentialRamp is easy to kill on short / soft notes
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(Math.max(0.0001, vol), start + attack);
      g.gain.linearRampToValueAtTime(0.0001, start + playDur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(start);
      o.stop(start + playDur + 0.05);
    },
    [ensure]
  );

  const playCorrect = useCallback(() => {
    tone(523, 0, 0.15, "triangle", 0.22);
    tone(659, 0.08, 0.15, "triangle", 0.22);
    tone(784, 0.16, 0.15, "triangle", 0.22);
    tone(1046, 0.24, 0.3, "triangle", 0.25);
    tone(1568, 0.3, 0.25, "sine", 0.12);
  }, [tone]);

  const playWrong = useCallback(() => {
    tone(392, 0, 0.16, "sine", 0.15);
    tone(311, 0.18, 0.25, "sine", 0.15);
  }, [tone]);

  const playFanfare = useCallback(() => {
    tone(523, 0, 0.2);
    tone(659, 0.12, 0.2);
    tone(784, 0.24, 0.2);
    tone(1046, 0.36, 0.45);
  }, [tone]);

  const playXpGain = useCallback(
    (n: number) => {
      const base = 440 + Math.min(n, 7) * 45;
      tone(base, 0, 0.09, "sine", 0.16);
      tone(base * 1.26, 0.08, 0.11, "triangle", 0.14);
      if (n >= 4) tone(base * 1.5, 0.16, 0.14, "triangle", 0.12);
      if (n >= 6) tone(base * 1.75, 0.24, 0.16, "sine", 0.1);
    },
    [tone]
  );

  /** Minigame SFX voiced for the active animal (jump, knife cut, …). */
  const playMinigameSfx = useCallback(
    (sfx: MinigameSfx, characterId: string) => {
      const ctx = ensure();
      if (!ctx) return;
      const play = () => {
        for (const n of characterMinigameNotes(characterId, sfx)) {
          tone(n.freq, n.t0, n.dur, n.type, n.vol);
        }
      };
      if (ctx.state === "suspended") {
        void ctx.resume().then(play).catch(() => {});
      } else {
        play();
      }
    },
    [ensure, tone]
  );

  return {
    ensure,
    playCorrect,
    playWrong,
    playFanfare,
    playXpGain,
    playMinigameSfx,
  };
}
