---
id: minigame-engine-path-dash
title: Mini-game engine — path-dash (savanna dash / reef swim)
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
  - minigame-engine-tap-collect
  - minigame-engine-catch
  - minigame-engine-timing-bounce
  - minigame-engine-meter-burst
  - minigame-engine-slice-swipe
---

# Mini-game engine — path-dash (savanna dash / reef swim)

## Problem / opportunity

Kids love a short “run with my animal” moment. Path-dash gives Lion King / adventure *feel*
without building a real platformer or using IP — a brief lane dash collecting along a path.

## Proposed feature

Implement a `MinigameEngine` (`path-dash`):

- Short auto-run or tap-to-advance along a simple path/lane; collect pickups.
- Always completes (end of path or N collects); obstacles (if any) are soft — bounce/skip,
  never game-over.
- Skins: lion “savanna dash”, shark “reef swim”, turtle “leaf trail”.
- First pack: lion + at least one other; more skins data-only.
- Original titles only (no trademarked adventure names).

## Grounding

- Attention reset + novelty; no-fail
  ([play-beat-interludes](../knowledge/educational/play-beat-interludes.md)).
- No timers-as-fail, no lives
  ([no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md)).
- Plugs into [play-beat-minigame-host](play-beat-minigame-host.md).

## Rough scope

- `web/lib/minigames/pathDash.ts` + registry entry + Vitest.
- Skins: path length, pickup set, habitat colors from character sky/ground/accent.
- Overlay with simple motion; spoken one-liner.

## Watch-outs

- Must stay shorter and easier than learning steps — not a second game to master.
- Avoid complex controls (one tap / auto-run preferred).
- No IP assets or names.

## OKF updates on ship

1. New `knowledge/educational/minigame-path-dash.md`.
2. Consequences row in `knowledge/technical/minigame-provider-pattern.md`.
3. Educational `index.md` + `knowledge/log.md`.
4. Graduate only after `web/` ships.
