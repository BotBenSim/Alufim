"use client";

import { useCallback, useEffect } from "react";

/** Chrome GC's utterances without a live ref — keep until end/error. */
const alive = new Set<SpeechSynthesisUtterance>();

let heVoice: SpeechSynthesisVoice | null = null;
let enVoice: SpeechSynthesisVoice | null = null;

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

function speakUtterance(
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice | null,
  rate: number,
  pitch: number,
  queue: boolean
) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return;
  loadVoices();
  try {
    speechSynthesis.resume();
    if (!queue) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    if (voice) u.voice = voice;
    u.rate = rate;
    u.pitch = pitch;
    alive.add(u);
    u.onend = () => alive.delete(u);
    u.onerror = () => alive.delete(u);
    speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

export function useSpeech() {
  useEffect(() => {
    loadVoices();
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const speak = useCallback((text: string, queue = false) => {
    speakUtterance(text, "he-IL", heVoice, 0.82, 1.3, queue);
  }, []);

  const speakEn = useCallback((text: string, queue = false) => {
    speakUtterance(text, "en-US", enVoice, 0.78, 1.15, queue);
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
