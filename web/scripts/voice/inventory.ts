/**
 * Writes locales/he.voice.lock.json: every Hebrew line the app speaks, the copy
 * key(s) it comes from, and the clip it plays. Commit it — its diff is the list
 * of lines to re-record.
 *
 *   npm run voice:lines          # rewrite the lock
 *   npm run voice:check          # fail if the lock is stale or a clip is missing
 *
 * Fixed lines are listed below. Question prompts are built at runtime, so they
 * are collected by running the real providers across every game, level, band
 * and stage until no new line turns up.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { CHARACTERS, evolveCelebrateLine } from "@/data/characters";
import { FIND_CATS, FIND_PACKS } from "@/data/find";
import { GAME_ORDER, GAMES } from "@/data/games";
import { MINIGAME_SKINS } from "@/data/minigames";
import { VOCAB, VOCAB_ORDER } from "@/data/vocab";
import { defaultCurriculum, hasStageBands, MAX_STAGE } from "@/lib/difficulty";
import { groupKeys, onRender, t, type MsgKey } from "@/lib/i18n";
import { MISSION_ASKS } from "@/lib/missions";
import { getProvider } from "@/lib/providers";
import { HEB_NUM } from "@/data/hebrew";
import { addSpeakPrompt, type AddQuestion } from "@/lib/providers/add";
import { subSpeakPrompt, type SubQuestion } from "@/lib/providers/sub";
import { speakQuestion } from "@/lib/speakPrompt";
import { normalizeSpoken } from "@/lib/voice/normalize";
import { splitSpoken } from "@/lib/voice/segments";
import type { DifficultyLevel, GameCurriculum, GameId } from "@/lib/types";
import { clipFile, clipId, LOCK, type Lock } from "./shared";

const LEVELS: DifficultyLevel[] = ["easy", "medium", "hard"];

// Seeded, so two runs over the same code write the same lock.
let seed = 0x9e3779b9;
Math.random = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};

/** Settings allow add/sub numbers up to this (clampBand in lib/difficulty). */
const MATH_MAX = 200;
const lines = new Map<string, Set<string>>();

/** Keys rendered since the last `take()` — which copy produced a line. */
let rendered: string[] = [];
onRender((key) => rendered.push(key));
const take = () => {
  const keys = rendered;
  rendered = [];
  return keys;
};

function add(text: string, keys: string[]) {
  const line = normalizeSpoken(text);
  if (!line) return;
  const parts = splitSpoken(line);
  if (parts) return parts.forEach((p) => add(p, keys.map((k) => `${k}#part`)));
  if (!lines.has(line)) lines.set(line, new Set());
  keys.forEach((k) => lines.get(line)!.add(k));
}

/** Speak through the collector; lines with no copy key are content (data/). */
function say(text: string, content?: string) {
  const keys = take();
  add(text, keys.length ? keys : [`content:${content ?? "unknown"}`]);
}

// ---- Fixed lines ----------------------------------------------------------
[...groupKeys("praise"), ...groupKeys("mission.success")].forEach((key) => say(t(key)));
(["game.almost", "game.tryAgain", "game.again", "game.newAnimal", "evolve.tapAgainSpoken"] as MsgKey[]).forEach(
  (key) => say(t(key))
);
for (const gid of GAME_ORDER) say(GAMES[gid].title);
for (const skin of MINIGAME_SKINS) say(skin.promptHe, "minigames");
for (const c of CHARACTERS) {
  say(c.he, "characters");
  say(t("game.playedStronger", { name: c.he }));
  say(t("mission.feed", { name: c.he }));
  say(t("mission.fed", { name: c.he }));
  for (let f = 1; f < c.forms.length; f++) say(evolveCelebrateLine(c, f));
}

const words = new Set<string>();
VOCAB_ORDER.forEach((topic) => VOCAB[topic].words.forEach((w: { he: string }) => words.add(w.he)));
FIND_CATS.forEach((cat) => FIND_PACKS[cat].forEach((it) => words.add(it.he)));
for (const word of words) {
  for (const ask of MISSION_ASKS) say(t(`mission.ask.${ask}`, { item: word }));
  // The English game names the Hebrew word around the English one.
  say(t("eng.word", { word }));
  say(t("eng.correct", { word }));
  say(t("eng.sayIt", { word }));
}

// ---- Question prompts -----------------------------------------------------
function curricula(gid: GameId): GameCurriculum[] {
  const base = defaultCurriculum(gid);
  if (!hasStageBands(gid)) return [base];
  const out = [base];
  // Every stage, whatever the factory bands happen to include.
  for (let stage = 1; stage <= MAX_STAGE; stage++) {
    for (const maxNum of gid === "nums" ? [10, 20, 100] : [undefined]) {
      const band = maxNum ? { stage, maxNum } : { stage };
      out.push({ ...base, bands: { easy: [band], medium: [band], hard: [band] } });
    }
  }
  return out;
}

const counts = CHARACTERS.map((c) => c.counts);
const noop = () => {};

// Addition and subtraction are split into two recorded halves, so every number
// a parent can configure is listed outright rather than hoping sampling hits it.
for (let a = 0; a <= MATH_MAX; a++) {
  say(addSpeakPrompt({ a, b: a } as AddQuestion, HEB_NUM));
  say(subSpeakPrompt({ a, b: a } as SubQuestion, HEB_NUM));
}

for (const gid of GAME_ORDER.filter((g) => g !== "add" && g !== "sub")) {
  const provider = getProvider(gid);
  for (const curriculum of curricula(gid)) {
    for (const level of LEVELS) {
      const bands = curriculum.bands[level]?.length ?? 1;
      const last = curriculum.stepsPerBlock * bands + 1;
      const stride = Math.max(1, Math.floor(curriculum.stepsPerBlock / 2));
      for (let step = 1; step <= last; step += stride) {
        // Sample until 300 draws in a row add nothing new.
        for (let stale = 0; stale < 300; ) {
          const before = lines.size;
          take(); // drop keys rendered while building the question itself
          const q = provider.generate({
            gameId: gid,
            level,
            step,
            usedKeys: [],
            recent: [],
            countEmoji: counts[Math.floor(Math.random() * counts.length)],
            curriculum,
          });
          take();
          speakQuestion(q, (text) => say(text, gid), noop);
          stale = lines.size === before ? stale + 1 : 0;
        }
      }
    }
  }
}

// ---- Write or check -------------------------------------------------------
const lock: Lock = {};
for (const text of [...lines.keys()].sort((a, b) => a.localeCompare(b, "he"))) {
  lock[text] = { keys: [...lines.get(text)!].sort(), clip: clipId(text) };
}

if (process.argv.includes("--check")) {
  const committed: Lock = existsSync(LOCK) ? JSON.parse(readFileSync(LOCK, "utf8")) : {};
  const added = Object.keys(lock).filter((k) => !committed[k]);
  const removed = Object.keys(committed).filter((k) => !lock[k]);
  const missing = Object.entries(committed).filter(([, e]) => !existsSync(clipFile(e.clip)));
  const show = (title: string, xs: string[]) =>
    xs.length && console.log(`${title} (${xs.length}):\n${xs.slice(0, 20).map((x) => `  ${x}`).join("\n")}`);
  show("Spoken but not in the lock — run npm run voice:lines", added);
  show("In the lock but no longer spoken — run npm run voice:lines", removed);
  show("No clip recorded — run npm run voice:record", missing.map(([k]) => k));
  if (added.length || removed.length || missing.length) process.exit(1);
  console.log(`voice lock is current: ${Object.keys(lock).length} lines, all recorded`);
} else {
  // One entry per line keeps the diff readable: a changed line is one - and one +.
  const body = Object.entries(lock)
    .map(([text, e]) => `  ${JSON.stringify(text)}: ${JSON.stringify(e)}`)
    .join(",\n");
  writeFileSync(LOCK, `{\n${body}\n}\n`);
  const recorded = Object.values(lock).filter((e) => existsSync(clipFile(e.clip))).length;
  console.log(`${Object.keys(lock).length} spoken lines → ${LOCK}`);
  console.log(`${recorded} recorded, ${Object.keys(lock).length - recorded} to record`);
}
