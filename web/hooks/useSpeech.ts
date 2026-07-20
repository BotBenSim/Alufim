"use client";

import { useCallback, useEffect, useRef } from "react";

export function useSpeech() {
  const hebVoice = useRef<SpeechSynthesisVoice | null>(null);
  const enVoice = useRef<SpeechSynthesisVoice | null>(null);

  const loadVoices = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      const vs = speechSynthesis.getVoices();
      const hebs = vs.filter((v) => v.lang?.startsWith("he"));
      if (hebs.length) {
        hebVoice.current =
          hebs.find((v) => /enhanced|premium|natural|siri/i.test(v.name)) ?? hebs[0];
      }
      const ens = vs.filter((v) => v.lang?.startsWith("en"));
      if (ens.length) {
        enVoice.current =
          ens.find(
            (v) =>
              /enhanced|premium|natural|samantha|siri/i.test(v.name) &&
              /en-US|en-GB/i.test(v.lang)
          ) ??
          ens.find((v) => /en-US|en-GB/i.test(v.lang)) ??
          ens[0];
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [loadVoices]);

  const speak = useCallback((text: string, queue = false) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      if (!queue) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "he-IL";
      if (hebVoice.current) u.voice = hebVoice.current;
      u.rate = 0.82;
      u.pitch = 1.3;
      speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  }, []);

  const speakEn = useCallback((text: string, queue = false) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      if (!queue) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      if (enVoice.current) u.voice = enVoice.current;
      u.rate = 0.78;
      u.pitch = 1.15;
      speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  }, []);

  const cancel = useCallback(() => {
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }, []);

  return { speak, speakEn, cancel };
}
