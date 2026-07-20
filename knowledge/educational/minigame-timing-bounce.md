---
id: minigame-timing-bounce
title: Timing-bounce play-beat engine — generous hops
status: accepted
date: 2026-07-20
tags: [educational, minigame]
theory: Attention span + novelty
related: [play-beat-minigame-variety, minigame-provider-pattern]
---

# Timing-bounce play-beat engine — generous hops

## Decision

A marker slides on a bar; tap while it is in a wide green sweet zone to hop. Tap outside the
zone is a soft “try again” — never lose. `web/lib/minigames/timingBounce.ts` + `TimingBounceView`.

## Why it helps the child

Timing *joy* with a clear target, still safe for preschoolers (wide band).

## How it works

Good taps in the zone score; win at N good hops. Marker keeps looping after misses.

## Watch-outs

Do not shrink the sweet zone into a punishing fail; never add a countdown fail.
