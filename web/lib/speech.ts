/**
 * Browser TTS — shared module (Chrome GC + cancel-wedge safe).
 * Speak synchronously inside click handlers; never clear utterance refs before cancel.
 */

const held = new Set<SpeechSynthesisUtterance>();
let heVoice: SpeechSynthesisVoice | null = null;
let enVoice: SpeechSynthesisVoice | null = null;

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

function refreshVoices() {
  const s = synth();
  if (!s) return;
  const vs = s.getVoices();
  const hebs = vs.filter((v) => v.lang?.toLowerCase().startsWith("he"));
  heVoice =
    hebs.find((v) => v.localService) ??
    hebs.find((v) => /carmit/i.test(v.name)) ??
    hebs[0] ??
    null;
  const ens = vs.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  enVoice =
    ens.find((v) => v.localService && /en-us|en-gb/i.test(v.lang)) ??
    ens.find((v) => /en-us|en-gb/i.test(v.lang)) ??
    ens[0] ??
    null;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  refreshVoices();
  speechSynthesis.onvoiceschanged = refreshVoices;
}

function interrupt(s: SpeechSynthesis) {
  if (held.size === 0 && !s.speaking && !s.pending) return;
  try {
    if (s.speaking) s.pause();
    s.cancel();
    s.resume();
  } catch {
    /* ignore */
  }
}

function speak(
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice | null,
  rate: number,
  pitch: number,
  queue: boolean
) {
  const s = synth();
  if (!s || !text.trim()) return;

  refreshVoices();
  try {
    s.resume();
  } catch {
    /* ignore */
  }

  if (!queue) interrupt(s);

  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  if (voice) u.voice = voice;
  u.rate = rate;
  u.pitch = pitch;
  held.add(u);
  u.onend = () => held.delete(u);
  u.onerror = () => held.delete(u);
  s.speak(u);
}

export function speakHebrew(text: string, queue = false) {
  speak(text, "he-IL", heVoice, 0.82, 1.3, queue);
}

export function speakEnglish(text: string, queue = false) {
  speak(text, "en-US", enVoice, 0.78, 1.15, queue);
}

export function cancelAllSpeech() {
  const s = synth();
  if (s) interrupt(s);
}

/** @internal */
export function resetSpeechForTests() {
  held.clear();
}
