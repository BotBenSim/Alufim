---
id: minigame-engine-catch
title: Mini-game engine — catch (falling treats / shrimp catch)
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
  - minigame-engine-tap-collect
  - minigame-engine-path-dash
  - minigame-engine-timing-bounce
  - minigame-engine-meter-burst
  - minigame-engine-slice-swipe
---

# Mini-game engine — catch (falling treats / shrimp catch)

> **Superseded / removed.** Stub engine deleted from the product — do not reintroduce.
> Live play-beat engines: path-dash, timing-bounce, slice-swipe, sling-shot, char-maze, cut-rope.

## Problem / opportunity

Feed taps feel static. A catch engine gives motion and anticipation — items appear or fall
and the child taps/moves to catch them — while staying a short, always-completable break.

## Proposed feature

Implement a `MinigameEngine` (`catch`):

- Items spawn or fall; child taps (or simple drag) to catch enough to complete.
- Misses do **not** fail the run; session ends happily after N catches or a short burst.
- Skins: e.g. rabbit “falling carrots”, shark “shrimp catch”, lion “floating meat treats”.
- First pack: lion + at least one other habitat; more skins data-only.

## Grounding

- No-fail interlude ([play-beat-interludes](../knowledge/educational/play-beat-interludes.md)).
- Always-gain XP; no lives or game-over
  ([always-gain-xp](../knowledge/educational/always-gain-xp.md),
  [no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md)).
- Host registry ([play-beat-minigame-host](play-beat-minigame-host.md)).

## Rough scope

- `web/lib/minigames/catch.ts` (+ Vitest for completion / XP floor).
- Data skins with spawn rates and item emoji; host dispatch case.
- Keep duration ≈5–12s; audio prompt per skin.

## Watch-outs

- Falling speed must stay gentle for preschoolers.
- Never end on a miss; never introduce bombs or lives.
- Do not outshine evolution celebrations.

## OKF updates on ship

1. New `knowledge/educational/minigame-catch.md`.
2. Row under Consequences in `knowledge/technical/minigame-provider-pattern.md`.
3. Educational `index.md` + `knowledge/log.md`.
4. Graduate only after `web/` ships.
