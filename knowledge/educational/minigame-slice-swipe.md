---
id: minigame-slice-swipe
title: Slice-swipe play-beat engine — no bomb fail
status: accepted
date: 2026-07-20
tags: [educational, minigame]
theory: Attention span + novelty
related: [play-beat-minigame-variety, minigame-provider-pattern, no-time-pressure-no-fomo]
---

# Slice-swipe play-beat engine — no bomb fail

## Decision

Snacks arc across the screen; a real finger swipe must cross them (DOM hit-test). Flyers that
leave without a slice just respawn — no bombs, no punish. Original names only.
`web/lib/minigames/sliceSwipe.ts` + `SliceSwipeView`.

## Why it helps the child

High-energy aiming novelty without anxiety or shame for missing.

## How it works

Good swipe/tap-on-flyer scores; win at N slices. Continuous spawn keeps the session winnable.

## Watch-outs

Never add bomb-fail or combo-break shame; keep hit padding generous.
