"use client";

import { useCallback } from "react";
import { cancelAllSpeech, speakEnglish, speakHebrew } from "@/lib/speech";

export function useSpeech() {
  const speak = useCallback((text: string, queue = false) => {
    speakHebrew(text, queue);
  }, []);

  const speakEn = useCallback((text: string, queue = false) => {
    speakEnglish(text, queue);
  }, []);

  const cancel = useCallback(() => {
    cancelAllSpeech();
  }, []);

  return { speak, speakEn, cancel };
}
