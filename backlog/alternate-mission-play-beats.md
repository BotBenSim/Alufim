---
id: alternate-mission-play-beats
title: Alternate feed and find-mission interludes in the rhythm
status: proposed
date: 2026-07-20
tags: [backlog, educational, engagement, pacing]
theory: Attention span + spaced practice + interleaving
scope: S
source: agent
related:
  - play-beat-interludes
  - game-variety
  - play-beat-minigame-host
  - minigame-engine-tap-collect
  - visible-collection-board
---

# Alternate feed and find-mission interludes in the rhythm

## Problem / opportunity

The rhythm already defines a play beat every N steps, and the store already has a `mission`
path (quick "find / tap the …" overlay), but the active rhythm never schedules `mission` —
so every interlude is the same feed tap. Variety between *kinds* of break is unused
capacity that would refresh attention without adding a new drill.

## Proposed feature

Teach the rhythm to schedule light interludes of more than one type:

- Add a `mission` beat (alongside `play`) to the active rhythm preset so kids sometimes get
  a quick find-mission instead of (or alternating with) feed.
- Keep both interludes no-fail / low-stakes: mission stays a tap-to-find care beat, not a
  graded quiz with punishment.
- Learning steps still dominate the cadence (e.g. still roughly every 3rd step is a break).

## Grounding

- Directly improves [play-beat-interludes](../knowledge/educational/play-beat-interludes.md)
  by varying the break type, not removing it.
- Aligns with [game-variety](../knowledge/educational/game-variety.md): interleaving kinds of
  activity keeps attention fresher than one repeated micro-loop.
- Does not introduce timers, lives, or FOMO
  ([no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md)).

## Rough scope

- Adjust `RHYTHM_PRESETS` / beat scheduling in `web/lib/rhythm.ts` (and tests).
- Reuse existing mission overlay + `nextMission` in `web/lib/missions.ts` and `GameScreen`.
- Optional: coordinate copy/tone with [varied-surprising-feed-beat](varied-surprising-feed-beat.md)
  so feed and mission feel like one family of care moments.

## Watch-outs

- Don't turn mission into another hard graded test — that defeats the interlude purpose.
- Too-frequent breaks stall learning; keep the "every N" balance deliberate.
- Mission XP should stay small and positive (existing `XP_BEAT.mission`).
