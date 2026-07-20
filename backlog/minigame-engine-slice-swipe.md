---
id: minigame-engine-slice-swipe
title: Mini-game engine — slice-swipe (fruit toss / snack slash)
status: accepted
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
  - minigame-engine-path-dash
  - minigame-engine-timing-bounce
  - minigame-engine-meter-burst
---

# Mini-game engine — slice-swipe (fruit toss / snack slash)

## Problem / opportunity

Swipe-to-slice flying snacks delivers Fruit Ninja–like *feel* kids already love, as a short
care/play burst for the animal’s habitat — without cloning that product or adding fail bombs.

## Proposed feature

Implement a `MinigameEngine` (`slice-swipe`):

- Foods/habitat treats arc across the screen; child swipes/drags through them for juicy
  slice VFX.
- Session ends happily after N successful slices or a short burst; always awards ≥ play XP.
- **No bomb-fail:** missed items do not punish; any “skip” objects bounce away or are
  ignorable — never end the run, never combo-shame.
- Skins: e.g. lion “snack slash”, rabbit “carrot toss”, shark “kelp fruit toss” (original
  names only — no “Fruit Ninja” branding).
- First pack: lion + at least one other habitat; more skins data-only.

## Grounding

- High novelty motor play as attention reset
  ([play-beat-interludes](../knowledge/educational/play-beat-interludes.md)).
- Strictly no-fail / no FOMO
  ([no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md),
  [always-gain-xp](../knowledge/educational/always-gain-xp.md)).
- Host registry ([play-beat-minigame-host](play-beat-minigame-host.md)).

## Rough scope

- `web/lib/minigames/sliceSwipe.ts` — session model + completion rules (+ Vitest).
- Pointer/touch swipe hit-testing in the overlay; keep physics gentle.
- Data skins: item sets, spawn arcs, prompts; register in host map.

## Watch-outs

- No bombs, blades-as-violence framing, or fail states — keep it playful snack/treat slicing.
- Swipe hitboxes generous for small hands; works on touch and mouse.
- No trademarked names, logos, or assets.
- Keep shorter than learning steps; celebration below evolution tier.

## OKF updates on ship

1. New `knowledge/educational/minigame-slice-swipe.md` — include the no-bomb / no-fail rule
   explicitly.
2. Consequences row in `knowledge/technical/minigame-provider-pattern.md`.
3. Optional `knowledge/product/` note if swipe chrome is distinctive.
4. Educational (and product if used) `index.md` + `knowledge/log.md`.
5. Graduate only after `web/` ships.
