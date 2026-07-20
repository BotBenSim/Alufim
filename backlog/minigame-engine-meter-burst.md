---
id: minigame-engine-meter-burst
title: Mini-game engine — meter-burst (roar / splash / cheer)
status: proposed
date: 2026-07-20
tags: [backlog, educational, engagement, minigame]
theory: Attention span + novelty / curiosity (no-fail interlude)
scope: M
source: agent
related:
  - play-beat-minigame-host
  - start-from-first-form
  - play-beat-interludes
  - always-gain-xp
  - no-time-pressure-no-fomo
  - audio-first
  - data-driven-content
  - celebrate-progress
  - minigame-engine-tap-collect
  - minigame-engine-catch
  - minigame-engine-path-dash
  - minigame-engine-timing-bounce
  - minigame-engine-slice-swipe
---

# Mini-game engine — meter-burst (roar / splash / cheer)

## Problem / opportunity

Evolve already uses mash-to-fill taps; kids enjoy that agency. Generalizing it into a play-beat
engine (roar / splash / cheer) reuses a proven no-fail interaction with animal flavor —
without waiting for a rare evolution.

## Proposed feature

Implement a `MinigameEngine` (`meter-burst`):

- Mash or hold to fill a meter; on full, play a character-themed burst (roar, splash, cheer)
  and complete.
- Always completable; award ≥ play XP.
- Skins: lion “mighty roar”, shark “splash burst”, dragon “ember cheer”.
- First pack: lion + at least one other; more skins data-only.
- Keep the flourish **smaller** than full evolution
  ([celebrate-progress](../knowledge/educational/celebrate-progress.md)).

## Grounding

- Familiar, no-fail motor play as attention reset.
- Positive reinforcement only ([always-gain-xp](../knowledge/educational/always-gain-xp.md)).
- Host registry ([play-beat-minigame-host](play-beat-minigame-host.md)).

## Rough scope

- `web/lib/minigames/meterBurst.ts` (+ tests); may share tap-count ideas with evolve overlay
  but must stay a separate registered engine.
- Data: taps needed, burst VFX/copy, `promptHe`.
- Speak prompt; confetti/fanfare lighter than evolve.

## Watch-outs

- Do not confuse kids with evolve — different copy/scene, smaller celebration.
- No hold-to-fail or timeout fail.
- Accessible tap targets; avoid requiring long precise holds for the youngest.

## OKF updates on ship

1. New `knowledge/educational/minigame-meter-burst.md`.
2. Consequences row in `knowledge/technical/minigame-provider-pattern.md`.
3. Educational `index.md` + `knowledge/log.md`.
4. Graduate only after `web/` ships.
