---
id: minigame-catch
title: Catch play-beat engine — misses never fail
status: accepted
date: 2026-07-20
tags: [educational, minigame]
theory: Attention span + novelty
related: [play-beat-minigame-variety, minigame-provider-pattern]
---

# Catch play-beat engine — misses never fail

## Decision

Falling/appearing treats are caught by tap; empty taps spawn more items instead of ending the
run. `web/lib/minigames/catch.ts`.

## Why it helps the child

Motion keeps the break lively while staying safe to try.

## How it works

Complete after N catches; always award play XP.

## Watch-outs

Keep spawn speed gentle; no lives or countdown fail.
