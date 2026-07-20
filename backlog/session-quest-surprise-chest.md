---
id: session-quest-surprise-chest
title: Session quest with a surprise chest at the end
status: proposed
date: 2026-07-20
tags: [backlog, educational, engagement, goals]
theory: Goal-gradient effect + variable always-positive reward
scope: M
source: agent
related:
  - celebrate-progress
  - always-gain-xp
  - no-time-pressure-no-fomo
  - play-beat-interludes
  - varied-surprising-feed-beat
  - visible-collection-board
---

# Session quest with a surprise chest at the end

## Problem / opportunity

Evolution thresholds (50 / 150 / 300 XP) are real goals but often too far for a short
sitting. Within a run there is little short "almost done" pull — only step count and the
repeating feed. Kids who tire after a few turns lack a micro-goal that makes "one more"
feel concrete without pressure.

## Proposed feature

A tiny **per-run quest** that ends in a **surprise chest**:

- Examples: "feed your friend 3 times this run" or "reach the next form" — one clear target
  shown at the start or gently during play.
- Completing it opens a short surprise celebration (chest / flourish): cosmetic joy and/or a
  small always-positive bonus on top of normal XP.
- Incomplete quest is never a fail state — no "you lost," no streak break, no forced finish.
  Quitting mid-run stays fine.

## Grounding

- Goal-gradient within a session complements
  [celebrate-progress](../knowledge/educational/celebrate-progress.md) (reserve the biggest
  celebration for evolution; quest chest is smaller).
- Variable always-positive surprise aligns with
  [always-gain-xp](../knowledge/educational/always-gain-xp.md) and must not contradict
  [no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md) (no
  daily quests, no limited-time pressure).
- Can sit on top of [play-beat-interludes](../knowledge/educational/play-beat-interludes.md)
  and [varied-surprising-feed-beat](varied-surprising-feed-beat.md) (e.g. feed count toward
  the quest).

## Rough scope

- Run-local quest state (prefer ephemeral / not persisted across sessions).
- Pure helpers in `web/lib/` for quest pick + completion check, with Vitest coverage.
- Small UI chip + end-of-quest overlay; wire from store step/feed/evolve paths.
- Chest contents stay non-punishing and preferably cosmetic-first so economy doesn't become
  the point.

## Watch-outs

- No streaks to protect; no "daily quest" or login FOMO.
- Incomplete quest must feel optional, not failure.
- Don't celebrate the chest as hard as evolution — keep hierarchy of wins clear.
- Bonuses never go below existing XP floors; never take XP away.
- Avoid timers on the quest.
