---
id: play-beat-minigame-variety
title: Varied no-fail micro-games on the play beat
status: accepted
date: 2026-07-20
tags: [educational, pacing, engagement, minigame]
theory: Attention span + spaced practice + novelty / curiosity
related: [play-beat-interludes, always-gain-xp, no-time-pressure-no-fomo, minigame-provider-pattern, audio-first]
---

# Varied no-fail micro-games on the play beat

## Decision

Every play beat picks a short micro-game from a pluggable engine registry (with animal-flavored
skins), not a single repeated feed animation. Sessions always complete; reward is at least
`XP_BEAT.play`. See [`web/lib/minigames/`](../../web/lib/minigames/) and
[`MinigameHost`](../../web/components/game/MinigameHost.tsx).

## Why it helps the child

Young children need attention resets that feel new. Novelty keeps the break rewarding so they
return to learning longer — without timers, fails, or FOMO.

## How it works

`pickMinigameSkin` prefers skins tagged for the active animal and avoids recent repeats. The
host runs `start` / `applyInput` until `isComplete`, then awards play XP and returns to learn.

## Watch-outs

- Micro-games must stay shorter and easier than learning steps.
- Never introduce fail states, lives, or bomb punishments (especially slice-swipe).
- Do not celebrate every micro-win as hard as evolution.
- Each active engine needs a real skill moment (timing or aim); miss means “try again,” never lose.
- Only skill engines ship: city roofs, dino race, ninja slice, sling-shot snack feed,
  character maze, and cut-rope (`ACTIVE_ENGINES`). Stub engines (`meterBurst`, `tapCollect`,
  `catch`) were removed rather than left half-built.
