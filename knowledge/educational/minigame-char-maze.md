---
id: minigame-char-maze
title: Character maze play-beat — reach the exit, never fail
status: accepted
date: 2026-07-20
tags: [educational, minigame]
theory: Attention span + novelty + spatial reasoning
related: [play-beat-minigame-variety, minigame-provider-pattern, no-time-pressure-no-fomo]
---

# Character maze play-beat — reach the exit, never fail

## Decision

Kids swipe, use arrows, or tap on-screen pads to walk their animal to a glowing exit.
Bumping a wall is a soft local “קיר!” only — no fail, no timer. `web/lib/minigames/charMaze.ts`
+ `CharMazeView`.

## Why it helps the child

A brief spatial goal (“get to the star”) with clear feedback. Soft walls keep curiosity higher
than frustration.

## How it works

Handcrafted compact layouts with a start and exit. Reaching the exit scores; win after N exits
(new layout each time). Wall bumps stay local so speech/SFX don’t spam.

## Watch-outs

Keep mazes short and always solvable. Never add fog, lives, or dead-end traps. Exit must stay
visually obvious (glow + emoji).
