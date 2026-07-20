---
id: minigame-sling-shot
title: Sling-shot play-beat — fling food to the character, never fail
status: accepted
date: 2026-07-20
tags: [educational, minigame]
theory: Attention span + novelty + motor planning
related: [play-beat-minigame-variety, minigame-provider-pattern, no-time-pressure-no-fomo]
---

# Sling-shot play-beat — fling food to the character, never fail

## Decision

Kids pull a slingshot and launch a snack at their animal (feed-by-aim). The character stays
put as a generous catch target. Misses reload a new snack — no lives, bombs, or shame.
`web/lib/minigames/slingShot.ts` + `SlingShotView`.

## Why it helps the child

A short motor-planning / aim novelty that still feels nurturing (feed the friend). Missing
stays playful (“עוד פעם!”), so curiosity stays higher than anxiety.

## How it works

Drag to aim (trajectory dots), release food under gravity. Hitting the character’s catch zone
scores (“טעים!”); win at N feeds. Soft miss only when a flight ends without a catch.

## Watch-outs

Keep pull radius and catch zone generous for little fingers. Never add a fail state or timer.
Food is the projectile; character art stays the catcher — don’t reverse that again.
