---
id: minigame-path-dash
title: Path-dash play-beat engine — short no-fail dash
status: accepted
date: 2026-07-20
tags: [educational, minigame]
theory: Attention span + novelty
related: [play-beat-minigame-variety, minigame-provider-pattern]
---

# Path-dash play-beat engine — short no-fail dash

## Decision

Auto-run side scene: treats scroll past; the child taps to jump when a treat is in a generous
collect window. Miss / early jump only skips that treat — never a lose. Original titles only.
`web/lib/minigames/pathDash.ts` + `PathDashView`.

## Why it helps the child

Adventure *feel* with a real timing moment, without a hard platformer or fail state.

## How it works

Score +1 on a good jump-in-window; win at `targetCount`. Treats that float by respawn.

## Watch-outs

Keep the collect window wide; stay shorter than learning steps; never add lives.
