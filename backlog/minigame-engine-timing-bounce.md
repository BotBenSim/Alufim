---
id: minigame-engine-timing-bounce
title: Mini-game engine — timing-bounce (happy hops)
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
  - minigame-engine-path-dash
  - minigame-engine-meter-burst
  - minigame-engine-slice-swipe
---

# Mini-game engine — timing-bounce (happy hops)

## Problem / opportunity

A gentle platformer *feel* (Mario-like timing joy) refreshes attention without teaching a
hard skill. Timing-bounce is tap-on-window hops that always land happily.

## Proposed feature

Implement a `MinigameEngine` (`timing-bounce`):

- Character hops; child taps in a generous timing window (or simply taps to hop N times).
- Missed windows do not fail — next hop still comes; session completes after N hops or a
  short sequence with celebration.
- Skins: rabbit “happy hops”, lion “pride pounces”, dragon “ember hops”.
- First pack: lion + at least one other; more skins data-only.
- Original names only — no Mario/Nintendo IP.

## Grounding

- No-fail interlude; generous windows for young kids
  ([play-beat-interludes](../knowledge/educational/play-beat-interludes.md)).
- No countdown fail / lives
  ([no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md)).
- Host registry ([play-beat-minigame-host](play-beat-minigame-host.md)).

## Rough scope

- `web/lib/minigames/timingBounce.ts` + Vitest for completion rules.
- Data: hop count, window size, habitat VFX; host dispatch.
- Audio-first short prompt.

## Watch-outs

- Timing windows must be wide; never punish “almost.”
- Keep motion calm — not twitchy competitive platforming.
- Reserve big celebrations for evolution.

## OKF updates on ship

1. New `knowledge/educational/minigame-timing-bounce.md`.
2. Consequences row in `knowledge/technical/minigame-provider-pattern.md`.
3. Educational `index.md` + `knowledge/log.md`.
4. Graduate only after `web/` ships.
