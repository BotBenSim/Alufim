/**
 * One queue for everything the app says. Hebrew lines play a pre-recorded clip
 * (scripts/voice, see its README) when one exists and fall back to the browser's
 * speech voice otherwise; English always uses the browser voice.
 *
 * Clips play through Web Audio rather than <audio>, because iOS only lets an
 * AudioContext make sound after a tap has resumed it — once it has, clips
 * started later from timers still play.
 */
import { voiceDebug } from "@/lib/devFlags";
import { assetPath } from "@/lib/utils";
import { normalizeSpoken } from "./normalize";
import { splitSpoken } from "./segments";

const BASE = assetPath("audio/voice");

type Tts = { text: string; lang: string; voice: SpeechSynthesisVoice | null; rate: number; pitch: number };
type Item = { kind: "clip"; id: string } | ({ kind: "tts" } & Tts);

let clips: Record<string, string> | null = null;
let format = "mp3";
let manifestLoad: Promise<void> | null = null;
let ctx: AudioContext | null = null;
const buffers = new Map<string, Promise<AudioBuffer | null>>();

let queue: Item[] = [];
let busy = false;
/** Bumped by stop(), so callbacks from a cancelled item cannot advance the queue. */
let generation = 0;
let source: AudioBufferSourceNode | null = null;

/** Chrome garbage-collects utterances without a live reference, dropping `onend`. */
const alive = new Set<SpeechSynthesisUtterance>();

export function loadVoiceManifest(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  manifestLoad ??= fetch(`${BASE}/manifest.json`)
    .then((r) => (r.ok ? r.json() : null))
    .then((m: { format?: string; clips?: Record<string, string> } | null) => {
      clips = m?.clips ?? {};
      format = m?.format ?? format;
    })
    .catch(() => {
      clips = {};
    });
  return manifestLoad;
}

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new Ctx();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

/**
 * Unlock audio on the first real tap. Browsers disagree on which events count
 * (Safari ignores pointerdown for this), so listen to all of them, and play one
 * silent sample inside the gesture — iOS only unlocks a context that actually
 * started a sound from a tap. Listeners stay until the context is running.
 */
const UNLOCK_EVENTS = ["pointerdown", "pointerup", "touchend", "click", "keydown"] as const;

export function unlockVoiceOnGesture() {
  if (typeof window === "undefined") return;
  const unlock = () => {
    const ac = audioContext();
    if (!ac) return;
    try {
      const silent = ac.createBufferSource();
      silent.buffer = ac.createBuffer(1, 1, ac.sampleRate);
      silent.connect(ac.destination);
      silent.start();
    } catch {
      /* ignore */
    }
    if (ac.state === "running") {
      UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, unlock, true));
    } else {
      void ac.resume().then(() => {
        if (ac.state === "running") {
          UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, unlock, true));
        }
      });
    }
  };
  UNLOCK_EVENTS.forEach((e) => window.addEventListener(e, unlock, true));
}

function buffer(id: string): Promise<AudioBuffer | null> {
  let p = buffers.get(id);
  if (!p) {
    const ac = audioContext();
    p = !ac
      ? Promise.resolve(null)
      : fetch(`${BASE}/${id}.${format}`)
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
          .then((data) => ac.decodeAudioData(data))
          .catch(() => null);
    buffers.set(id, p);
    // Keep memory bounded; clips are small and the HTTP cache holds the rest.
    if (buffers.size > 60) buffers.delete(buffers.keys().next().value!);
  }
  return p;
}

/** Clip ids for a Hebrew line, or null when any piece is missing. */
function clipIds(text: string): string[] | null {
  if (!clips) return null;
  const key = normalizeSpoken(text);
  if (clips[key]) return [clips[key]];
  const parts = splitSpoken(key);
  if (!parts) return null;
  const ids = parts.map((p) => clips![p]);
  return ids.every(Boolean) ? ids : null;
}

function next() {
  const item = queue.shift();
  if (!item) {
    busy = false;
    return;
  }
  busy = true;
  const gen = generation;
  const done = () => {
    if (gen === generation) next();
  };
  if (item.kind === "clip") playClip(item.id, done);
  else playTts(item, done);
}

function playClip(id: string, done: () => void) {
  const gen = generation;
  void buffer(id).then((buf) => {
    if (gen !== generation) return;
    const ac = audioContext();
    if (voiceDebug()) console.info(`[voice] play ${id}: ${buf ? `${buf.duration.toFixed(1)}s` : "failed to load"} · audio ${ac?.state}`);
    if (!buf || !ac) return done();
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.connect(ac.destination);
    src.onended = () => {
      if (source === src) source = null;
      done();
    };
    source = src;
    src.start();
  });
}

function playTts(t: Tts, done: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis || !t.text.trim()) return done();
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    done();
  };
  try {
    speechSynthesis.resume();
    const u = new SpeechSynthesisUtterance(t.text);
    u.lang = t.lang;
    if (t.voice) u.voice = t.voice;
    u.rate = t.rate;
    u.pitch = t.pitch;
    alive.add(u);
    u.onend = u.onerror = () => {
      alive.delete(u);
      finish();
    };
    speechSynthesis.speak(u);
    // Some browsers never fire onend; don't let the queue stall behind them.
    window.setTimeout(finish, 1500 + t.text.length * 140);
  } catch {
    finish();
  }
}

export function stopVoice() {
  generation++;
  queue = [];
  busy = false;
  try {
    source?.stop();
  } catch {
    /* already stopped */
  }
  source = null;
  try {
    speechSynthesis.cancel();
  } catch {
    /* no speech synthesis */
  }
}

/** Queue a line; without `queue`, whatever is playing is cut off first. */
export function say(t: Tts, hebrew: boolean, append: boolean) {
  if (!append) stopVoice();
  const ids = hebrew ? clipIds(t.text) : null;
  if (voiceDebug()) {
    console.info(
      `[voice] ${ids ? `clip ${ids.join("+")}` : clips ? "no clip → browser voice" : "manifest not loaded → browser voice"}` +
        ` · audio ${ctx?.state ?? "not created"} · "${t.text}"`
    );
  }
  if (ids) {
    ids.forEach((id) => void buffer(id)); // start fetching every piece now
    queue.push(...ids.map((id) => ({ kind: "clip" as const, id })));
  } else {
    queue.push({ kind: "tts", ...t });
  }
  if (!busy) next();
}
