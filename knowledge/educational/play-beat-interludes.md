---
id: play-beat-interludes
title: A play/feed break every few steps
status: accepted
date: 2026-07-20
tags: [educational, pacing, engagement]
theory: Attention span + spaced practice
related: [always-gain-xp, celebrate-progress, no-time-pressure-no-fomo]
---

# A play/feed break every few steps

## Decision

The learning loop is broken up by a light "play" beat (feed/care for the animal) at a
fixed cadence, so the child gets a satisfying, no-fail interlude between learning items.
Defined by the rhythm presets in [`web/lib/rhythm.ts`](../../web/lib/rhythm.ts).

## Why it helps the child

Young children can't sustain focused practice for long. A frequent, easy, rewarding break
resets attention and keeps the session feeling like play, not drilling — which sustains
more total practice.

## How it works

`RHYTHM_PRESETS` map a `play` beat to "every N steps" (`every2`, `every3`, `every4`); the
active preset is `ACTIVE_RHYTHM = "every3"`. `buildBeat` returns `play` on those steps and
`learn` otherwise. The play beat is a simple care action, not a graded question.

## Watch-outs

- Too rare a beat and the child tires before the reward; too frequent and learning stalls.
- The interlude must stay no-fail — turning it into another test defeats its purpose.
