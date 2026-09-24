"use client";

import { useCallback, useEffect } from "react";
import { loadVoiceManifest, say, stopVoice, unlockVoiceOnGesture } from "@/lib/voice/player";

let heVoice: SpeechSynthesisVoice | null = null;
let enVoice: SpeechSynthesisVoice | null = null;
let started = false;

function loadVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const vs = speechSynthesis.getVoices();
  const hebs = vs.filter((v) => v.lang?.startsWith("he"));
  if (hebs.length) {
    heVoice =
      hebs.find((v) => /enhanced|premium|natural|siri|carmit/i.test(v.name)) ?? hebs[0];
  }
  const ens = vs.filter((v) => v.lang?.startsWith("en"));
  if (ens.length) {
    enVoice =
      ens.find(
        (v) =>
          /enhanced|premium|natural|samantha|siri/i.test(v.name) &&
          /en-US|en-GB/i.test(v.lang)
      ) ??
      ens.find((v) => /en-US|en-GB/i.test(v.lang)) ??
      ens[0];
  }
}

export function useSpeech() {
  useEffect(() => {
    if (!started) {
      started = true;
      void loadVoiceManifest();
      unlockVoiceOnGesture();
    }
    loadVoices();
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  /** Hebrew: a recorded clip when there is one, else the browser voice. */
  const speak = useCallback((text: string, queue = false) => {
    loadVoices();
    say({ text, lang: "he-IL", voice: heVoice, rate: 0.9, pitch: 1.05 }, true, queue);
  }, []);

  const speakEn = useCallback((text: string, queue = false) => {
    loadVoices();
    say({ text, lang: "en-US", voice: enVoice, rate: 0.85, pitch: 1.05 }, false, queue);
  }, []);

  const cancel = useCallback(() => stopVoice(), []);

  return { speak, speakEn, cancel };
}
