"use client";

import { useCallback, useEffect } from "react";
import {
  cancelAllSpeech,
  primeSpeech,
  refreshVoices,
  speakEnglish,
  speakHebrew,
  synth,
} from "@/lib/speech";

export function useSpeech() {
  useEffect(() => {
    refreshVoices();
    const s = synth();
    if (!s) return;
    s.onvoiceschanged = refreshVoices;
    return () => {
      s.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string, queue = false) => {
    primeSpeech();
    speakHebrew(text, queue);
  }, []);

  const speakEn = useCallback((text: string, queue = false) => {
    primeSpeech();
    speakEnglish(text, queue);
  }, []);

  const cancel = useCallback(() => {
    cancelAllSpeech();
  }, []);

  return { speak, speakEn, cancel };
}
