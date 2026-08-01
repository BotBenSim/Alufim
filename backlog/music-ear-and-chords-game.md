---
id: music-ear-and-chords-game
title: Music game — echo the tune and hear happy/sad chords, by ear before symbol
status: proposed
date: 2026-08-01
tags: [backlog, educational, music, audio, listening]
theory: Music Learning Theory / audiation — sound before symbol (Gordon) + retrieval practice
scope: M
source: human
related:
  - audio-first
  - game-variety
  - play-beat-minigame-variety
  - always-gain-xp
  - no-time-pressure-no-fomo
  - right-sized-difficulty
---

# Music game — echo the tune and hear happy/sad chords, by ear before symbol

## Problem / opportunity

The app is already audio-first ([audio-first](../knowledge/educational/audio-first.md)) and already
synthesizes tones — [`web/lib/audio/characterMinigameSfx.ts`](../web/lib/audio/characterMinigameSfx.ts)
has a pure `ToneNote` model (frequency, time, duration, wave, volume) driving WebAudio oscillators,
with a different timbre per animal. But listening is used only for feedback noises and speech; no
part of the game trains the ear as a skill.

Musical listening is a genuine early-childhood learning domain — pitch direction, pattern memory,
and the happy/sad (major/minor) distinction are learnable well before reading notation — and it is a
different modality from everything currently on offer (numbers, words, perception), which is exactly
the kind of variety the game is built around. It also gives a non-verbal child a domain to shine in.

## Proposed feature

A music game built on a small **pentatonic** instrument (4–5 pads), so no combination of notes ever
sounds wrong. Two complementary modes:

1. **Echo the tune (call and response)** — the animal plays a short phrase (2 notes, growing to 4–5
   with difficulty), the child plays it back on the pads. Trains pitch memory and pattern length.
   This is retrieval practice in the auditory channel.
2. **Happy or sad chord** — a chord plays; the child picks between two/three pads or picture cards
   (☀️ / 🌧️). Trains the major/minor distinction using feeling words, not theory words. Later
   variants: loud/quiet, high/low, fast/slow.

Plus a **free-play instrument** as a play-beat toy: tap pads, the animal dances. No goal, no scoring —
the reward for a break, and the place a child discovers the pads before being asked to echo.

Deliberately **no notation** in a first version — sound before symbol. Staff/note reading is a later,
separate proposal if this lands.

## Grounding

- **Sound before symbol (Gordon's Music Learning Theory / audiation)** — the named theory: children
  build musical understanding by hearing and reproducing sound long before decoding written notation.
  This would be a *new* entry in `knowledge/educational/` if approved.
- **Retrieval practice + interleaving** from [game-variety](../knowledge/educational/game-variety.md):
  echoing a phrase is active recall, and the auditory domain interleaves with number/word/perception work.
- [always-gain-xp](../knowledge/educational/always-gain-xp.md) and
  [no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md): a wrong echo just
  replays the phrase; pentatonic tuning means every attempt still sounds musical, which is itself the
  no-punishment design.
- Free-play mode extends [play-beat-minigame-variety](../knowledge/educational/play-beat-minigame-variety.md).

## Rough scope

- **No new dependency needed.** Extend the existing `ToneNote` + WebAudio approach in
  `web/lib/audio/` — the sequencing model (notes, offsets, chords) is pure data and Vitest-testable,
  per [pure-logic-in-lib](../knowledge/technical/pure-logic-in-lib.md). A synthesis library such as
  Tone.js is well-adopted and actively maintained, but it is a large dependency for oscillators and
  gain envelopes we already have; skip it unless real sampled instruments become a requirement.
- Scales, chord tables, and per-animal instrument timbres as data in `web/data/`
  ([data-driven-content](../knowledge/technical/data-driven-content.md)), reusing the existing
  per-animal `VOICE` idea.
- Echo/chord modes as a learning game via [game-provider-pattern](../knowledge/technical/game-provider-pattern.md)
  (`GameId "music"` + provider + bands + card). Like the writing proposal, the echo mode needs a
  non-multiple-choice answer surface (the pad keyboard); the chord mode fits the existing option-button path.
- Free-play instrument as a minigame engine + skin under `web/lib/minigames/` and
  `web/components/game/minigames/`, per [minigame-provider-pattern](../knowledge/technical/minigame-provider-pattern.md).

## Watch-outs

- **Audio is mandatory here, unlike everywhere else.** With sound off, muted, or on a device in
  silent mode the game is unplayable. It needs a clear "turn on sound" state and must never be the
  only path to progress. iOS also requires a user gesture to unlock audio — the first pad tap has to
  double as the unlock.
- Don't let music notes collide with spoken prompts; the speech layer and the instrument need to take
  turns ([`web/lib/speakPrompt.ts`](../web/lib/speakPrompt.ts)).
- Keep phrases short. Auditory working memory at 5 is small; a 5-note echo is already hard, and
  length is the difficulty knob, not speed.
- "Happy/sad" is a feeling label, not a music-theory lesson — avoid מז'ור/מינור vocabulary with
  young kids.
- Golden rule: a new `GameId` adds a key to `profile.games`; additive default in
  [`web/lib/migrate.ts`](../web/lib/migrate.ts) only
  ([state-persistence](../knowledge/technical/state-persistence.md)).
- Accessibility: a deaf or hard-of-hearing child cannot play this game. It must stay one option among
  several, never a required step.

## Open questions

- **Learning game or play-beat toy first?** The free-play instrument is a fraction of the work and
  would validate whether kids enjoy the sound at all before building echo/chord modes.
- Synthesized tones (free, already in place, buzzy) or sampled instrument audio (much nicer for a
  music game, but real asset weight in a PWA that must work offline)?
- Which mode carries the learning claim — echo (memory + pitch) or chords (timbre/mood
  discrimination)? Echo has the stronger retrieval-practice grounding.
- Is there a path to rhythm (clap/tap back a pattern) that is easier than pitch, and should that come first?
