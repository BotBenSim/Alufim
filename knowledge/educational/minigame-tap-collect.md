---
id: minigame-tap-collect
title: Tap-collect play-beat engine stays no-fail
status: accepted
date: 2026-07-20
tags: [educational, minigame]
theory: Attention span + novelty
related: [play-beat-minigame-variety, minigame-provider-pattern]
---

# Tap-collect play-beat engine stays no-fail

## Decision

The tap-collect engine scatters habitat treats to tap; the session always completes after
enough collects. Implemented in `web/lib/minigames/tapCollect.ts`.

## Why it helps the child

Simple motor play resets attention with clear, immediate success.

## How it works

Skins supply items and `targetCount`; each tap on a target marks it collected until done.

## Watch-outs

Targets must stay large for small fingers; never time out a miss as failure.
