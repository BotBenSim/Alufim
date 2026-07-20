---
id: varied-surprising-feed-beat
title: Varied, surprising feed beat — never the same food and line
status: superseded
date: 2026-07-20
tags: [backlog, educational, engagement, pacing]
theory: Variable-ratio reinforcement (always positive) + novelty / curiosity
scope: S
source: agent
related:
  - play-beat-minigame-host
  - minigame-engine-tap-collect
  - minigame-engine-catch
  - minigame-engine-path-dash
  - minigame-engine-timing-bounce
  - minigame-engine-meter-burst
  - minigame-engine-slice-swipe
  - play-beat-interludes
  - always-gain-xp
---

# Varied, surprising feed beat — never the same food and line

## Status

**Superseded** by the play-beat mini-game host and engine set
([play-beat-minigame-host](play-beat-minigame-host.md) and the `minigame-engine-*` proposals).
Varied foods/reactions alone were too thin; the replacement is an extendable micro-game
library with animal skins.

## Problem / opportunity

The play/feed interlude every few steps is meant to reset attention
([play-beat-interludes](../knowledge/educational/play-beat-interludes.md)), but today it is
identical every time: tap the same `character.food` emoji a fixed number of times, hear the
same line (`ה{animal} אכל והתחזק!`), and get a flat play XP. Kids notice the sameness quickly
and the break stops feeling like a reward — so sessions feel tiring rather than "one more."

## Proposed feature

*(Original idea — kept for history.)* Make each feed interlude feel fresh while staying
no-fail and always-gain: per-animal food/reaction pools and an always-positive surprise
bonus.

## Grounding

- Extends [play-beat-interludes](../knowledge/educational/play-beat-interludes.md).
- Respects [always-gain-xp](../knowledge/educational/always-gain-xp.md).

## Rough scope

See [play-beat-minigame-host](play-beat-minigame-host.md) and the engine proposals.

## Watch-outs

- Do not implement this thin feed-only variant alongside the host; use the mini-game path.
