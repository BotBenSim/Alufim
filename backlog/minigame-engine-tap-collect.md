---
id: minigame-engine-tap-collect
title: Mini-game engine — tap-collect (savanna sparkles / reef gems)
status: superseded
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
  - alternate-mission-play-beats
  - minigame-engine-catch
  - minigame-engine-path-dash
  - minigame-engine-timing-bounce
  - minigame-engine-meter-burst
  - minigame-engine-slice-swipe
---

# Mini-game engine — tap-collect (savanna sparkles / reef gems)

## Problem / opportunity

The play beat is one repeated feed tap. Kids need distinct, short care/play moments.
Tap-collect is the simplest extendable engine: scatter habitat treats and tap them away —
also a natural home for find-in-scene style skins
([alternate-mission-play-beats](alternate-mission-play-beats.md)).

## Proposed feature

Implement a `MinigameEngine` (`tap-collect`):

- Session places N collectible targets (data-driven emoji/art) in the habitat scene.
- Child taps targets until complete; always succeeds; award ≥ play XP.
- Skins: e.g. lion “savanna sparkles”, shark “reef gems”, plus a find-the-food variant.
- First pack: lion + at least one other habitat; more skins are data-only later.

## Grounding

- No-fail attention reset ([play-beat-interludes](../knowledge/educational/play-beat-interludes.md)).
- Novelty without FOMO ([no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md)).
- Plugs into [play-beat-minigame-host](play-beat-minigame-host.md) via the shared registry.

## Rough scope

- `web/lib/minigames/tapCollect.ts` (+ tests) registered in the host map.
- Skins in `web/data/minigames*.ts` with `characterTags`, `promptHe`, target lists.
- Overlay: tap targets; short spoken prompt; completion flourish.

## Watch-outs

- Targets must be large enough for young fingers; no timed miss penalty.
- Find-in-scene skins stay care beats, not graded quizzes.
- Original names only.

## OKF updates on ship

1. New `knowledge/educational/minigame-tap-collect.md` — no-fail tap-collect interlude rule.
2. List this engine under Consequences in
   `knowledge/technical/minigame-provider-pattern.md` (create via host if missing).
3. Educational `index.md` row + `knowledge/log.md` line.
4. Do not graduate OKF until the engine ships in `web/`.
