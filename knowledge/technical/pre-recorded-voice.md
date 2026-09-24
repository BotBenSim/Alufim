---
id: pre-recorded-voice
title: Hebrew speech plays pre-recorded OpenAI TTS clips, browser voice as fallback
status: accepted
date: 2026-09-24
tags: [technical, audio, voice, tts]
supersedes: []
related: [i18n-locale-files]
---

# Pre-recorded Hebrew voice

## Context

The app spoke through the browser's speech synthesis. On macOS/iOS the Hebrew voice is
"Carmit" — flat and robotic, and the app raised its pitch 30% on top. Children who
cannot read yet depend on hearing the question, so an unclear voice blocks learning.

## Decision

- Every Hebrew line the app can say is listed in
  [`web/locales/he.voice.lock.json`](../../web/locales/he.voice.lock.json) by
  `npm run voice:lines`, which runs the real providers (seeded) plus the fixed lines.
  Each entry names its copy key and its clip.
- `npm run voice:record` records missing clips with OpenAI `gpt-4o-mini-tts` into
  `web/public/audio/voice/`. Settings are in
  [`scripts/voice/config.json`](../../web/scripts/voice/config.json); how-to in its
  [README](../../web/scripts/voice/README.md).
- A clip's name is a hash of text + pronunciation fix + model + voice + style +
  encoding, so any change re-records exactly the affected lines.
- Clips are stored as 32 kbps mono AAC (`.m4a`), re-encoded from OpenAI's 128 kbps MP3
  with macOS `afconvert`: ~34 MB for ~1,950 lines instead of 89 MB. Voice is `nova`
  with Hebrew-language style instructions — the closest to native of OpenAI's voices,
  though still not fully native.
- Addition/subtraction prompts are recorded as two halves split before the second
  number, keeping ~10,700 sentences down to ~600 clips.
- [`web/lib/voice/player.ts`](../../web/lib/voice/player.ts) queues clips through Web
  Audio (iOS allows timer-started playback once a tap has resumed the context) and falls
  back to the browser voice for any line without a clip. English stays on the browser
  voice.
- The service worker caches clips as they play (`voice-clips`, cache-first); they are
  excluded from the install-time precache.

## Why

The lines are a finite, known set, so recording once gives a natural, cheerful voice
with no runtime cost, works offline, and lets a person listen to and fix every line.

## Alternatives rejected

- **Runtime TTS API** — needs a server or exposes a key, costs per play, fails offline.
- **Azure / Google voices** — possibly more native Hebrew; OpenAI was chosen because a
  key was at hand. Swapping providers only touches `generate.ts`.
- **Human recording** — most natural, but ~2,000 lines; still possible later with the
  same lock and manifest.

## Consequences

- A copy change needs `voice:lines` + `voice:record` before merge; `voice:check` fails
  otherwise. Lines with runtime names (`שלום {{name}}`) always use the browser voice.
- OpenAI's Hebrew accent should be judged by ear (`voice:sample`) before the full run.
