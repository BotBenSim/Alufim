---
id: minigame-cut-rope
title: Cut-rope play-beat — swipe ropes to feed, never fail
status: accepted
date: 2026-07-20
tags: [educational, minigame]
theory: Attention span + novelty + cause-and-effect
related: [play-beat-minigame-variety, minigame-provider-pattern, no-time-pressure-no-fomo]
---

# Cut-rope play-beat — swipe ropes to feed, never fail

## Decision

Kids swipe to cut 1–2 ropes holding a snack; it falls into their animal’s mouth
(Cutting the Rope–style, preschool-simple). Misses reload the same layout — no fail.
`web/lib/minigames/cutRope.ts` + `CutRopeView`.

## Why it helps the child

A clear cause-and-effect aim moment (“cut → snack drops → friend eats”) that stays playful
when the drop misses.

## How it works

Snack swings on a pendulum from 1–2 pegs. Swipe across a rope to cut it. With ropes left it
keeps swinging from the new pivot; when the last rope is cut it flies with that swing’s
velocity. Hitting the mouth scores; falling off-screen is a soft miss. Win at N feeds.

## Watch-outs

Keep mouth hitboxes generous; max two ropes. Never add spikes, bombs, or limited “lives.”
