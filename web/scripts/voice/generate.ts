/**
 * Records the clips listed in locales/he.voice.lock.json with OpenAI TTS.
 *
 *   npm run voice:sample                 # the sample lines in each sample voice
 *   npm run voice:record                 # every line without a clip yet
 *   npm run voice:record -- --limit 20   # just a few, to listen first
 *   npm run voice:record -- --prune      # also delete clips nothing uses
 *
 * Settings live in config.json, fixes for mispronounced lines in pronounce.json.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apiKey, clipFile, CLIPS, config, LOCK, spokenInput, type Lock } from "./shared";

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const has = (name: string) => process.argv.includes(name);

async function speech(key: string, input: string, voice: string): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        voice,
        input,
        instructions: config.instructions,
        response_format: "mp3",
      }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const retry = res.status === 429 || res.status >= 500;
    if (!retry || attempt >= 5) throw new Error(`OpenAI ${res.status} for "${input}": ${await res.text()}`);
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
}

/**
 * Speech-sized AAC: ~2.5× smaller than OpenAI's 128 kbps MP3 and still clear.
 * Uses macOS's afconvert, so recording runs on a Mac.
 */
export function encode(mp3: Buffer, out: string) {
  if (config.format === "mp3") return writeFileSync(out, mp3);
  const src = join(tmpdir(), `voice-${process.pid}-${Math.random().toString(36).slice(2)}.mp3`);
  writeFileSync(src, mp3);
  try {
    const { bitrate, channels } = config.encode;
    execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", String(bitrate), "-c", String(channels), src, out]);
  } finally {
    unlinkSync(src);
  }
}

/** Run `work` over `items` with at most `n` in flight. */
async function pool<T>(items: T[], n: number, work: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) await work(items[next++]);
    })
  );
}

async function sample(key: string) {
  const dir = join(__dirname, "samples");
  mkdirSync(dir, { recursive: true });
  for (const voice of config.sample.voices) {
    const parts: Buffer[] = [];
    for (const line of config.sample.lines) parts.push(await speech(key, spokenInput(line), voice));
    // MP3 frames concatenate cleanly: one file per voice plays every line in turn.
    const file = join(dir, `${voice}.mp3`);
    writeFileSync(file, Buffer.concat(parts));
    console.log(`  ${voice} → ${file}`);
  }
}

async function record() {
  if (!existsSync(LOCK)) throw new Error("No voice lock yet — run npm run voice:lines first");
  const lock: Lock = JSON.parse(readFileSync(LOCK, "utf8"));
  mkdirSync(CLIPS, { recursive: true });

  const todo = Object.entries(lock).filter(([, e]) => !existsSync(clipFile(e.clip)));
  const batch = todo.slice(0, Number(arg("--limit") ?? Infinity));
  console.log(
    `${Object.keys(lock).length} lines, ${Object.keys(lock).length - todo.length} recorded, ` +
      `recording ${batch.length} with ${config.model} / ${config.voice}`
  );

  // Only needs the key when something is left to record.
  const key = batch.length ? apiKey() : "";
  let done = 0;
  const failed: string[] = [];
  await pool(batch, config.concurrency, async ([text, e]) => {
    try {
      encode(await speech(key, spokenInput(text), config.voice), clipFile(e.clip));
    } catch (err) {
      failed.push(text);
      console.error(String(err));
    }
    if (++done % 50 === 0 || done === batch.length) console.log(`  ${done}/${batch.length}`);
  });

  // The app's lookup table: only lines that have a clip, so the rest fall back
  // to the browser voice instead of failing.
  const clips = Object.fromEntries(
    Object.entries(lock)
      .filter(([, e]) => existsSync(clipFile(e.clip)))
      .map(([text, e]) => [text, e.clip])
  );
  writeFileSync(join(CLIPS, "manifest.json"), JSON.stringify({ format: config.format, clips }) + "\n");
  console.log(`manifest: ${Object.keys(clips).length}/${Object.keys(lock).length} lines have a clip`);

  if (has("--prune")) {
    const keep = new Set(Object.values(lock).map((e) => `${e.clip}.${config.format}`));
    const stale = readdirSync(CLIPS).filter((f) => f.endsWith(`.${config.format}`) && !keep.has(f));
    stale.forEach((f) => unlinkSync(join(CLIPS, f)));
    console.log(`pruned ${stale.length} unused clips`);
  }
  if (failed.length) {
    console.error(`${failed.length} lines failed — run again to retry them`);
    process.exitCode = 1;
  }
}

(has("--sample") ? sample(apiKey()) : record()).catch((e) => {
  console.error(e);
  process.exit(1);
});
