import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const WEB = join(__dirname, "..", "..");
export const LOCK = join(WEB, "locales", "he.voice.lock.json");
export const CLIPS = join(WEB, "public", "audio", "voice");

export type VoiceConfig = {
  provider: "openai";
  model: string;
  voice: string;
  /** What the app loads. OpenAI returns MP3; afconvert re-encodes it to this. */
  format: "m4a" | "mp3";
  encode: { codec: "aac"; bitrate: number; channels: number };
  instructions: string;
  concurrency: number;
  sample: { voices: string[]; lines: string[] };
};

export type LockEntry = { keys: string[]; clip: string };
export type Lock = Record<string, LockEntry>;

export const config: VoiceConfig = JSON.parse(readFileSync(join(__dirname, "config.json"), "utf8"));

/** Hand fixes for lines TTS gets wrong: app text → what the voice should read. */
export const pronunciations: Record<string, string> = (() => {
  const f = join(__dirname, "pronounce.json");
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : {};
})();

/** What is sent to the voice for a line. */
export const spokenInput = (text: string) => pronunciations[text] ?? text;

/**
 * A clip is named by everything that shapes how it sounds — the text, the
 * pronunciation fix, the model, voice, style and encoding — so changing any of
 * them gives a new name and the old clip is re-recorded.
 */
export function clipId(text: string, voice = config.voice): string {
  const { model, instructions, encode } = config;
  return createHash("sha1")
    .update(JSON.stringify({ model, voice, instructions, encode, input: spokenInput(text) }))
    .digest("hex")
    .slice(0, 16);
}

export const clipFile = (id: string) => join(CLIPS, `${id}.${config.format}`);

export function apiKey(): string {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const envFile = join(WEB, ".env.local");
  if (existsSync(envFile)) {
    const m = /^OPENAI_API_KEY=(.+)$/m.exec(readFileSync(envFile, "utf8"));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  throw new Error("OPENAI_API_KEY is not set — `export OPENAI_API_KEY=sk-...` or add it to web/.env.local");
}
