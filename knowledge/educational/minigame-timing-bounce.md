---
id: minigame-timing-bounce
title: Timing-bounce play-beat engine — cactus jump with generous hops
status: accepted
date: 2026-08-01
tags: [educational, minigame]
theory: Flow (challenge matched to skill) + Attention span
related: [play-beat-minigame-variety, minigame-provider-pattern, runner-jump-tuning, no-time-pressure-no-fomo]
---

# Timing-bounce play-beat engine — cactus jump with generous hops

## Decision

Chrome-dino style run: cacti slide in from the right and the child taps to hop over them.
Score +1 per cactus cleared, win at `targetCount`. A bump is a soft "אוי!" with a short pause
— never a lose, never a restart. `web/lib/minigames/timingBounce.ts` + `TimingBounceView`.

Generosity lives in the timing, not in a shrunken challenge:

- One hop clears every obstacle, tall ones included — the second jump is a bonus, not a
  requirement.
- The hop stays above the obstacle for roughly 0.45s, far wider than the moment of contact.
- Cacti always enter from off-screen and never take less than 0.8s to arrive, so a cactus
  can't appear on top of the child.

## Why it helps the child

Rhythm and anticipation are genuinely fun for preschoolers, but only when the window to act
is wider than their reaction time. Keeping the *approach* long while the world scrolls
briskly gives the excitement of speed with a target a five-year-old can actually hit.

## How it works

Good taps score and flash "יופי!"; a bump stuns for half a second and the run continues with
the same score. Spacing varies — close rushes, normal gaps, and the occasional breather —
so the beat never becomes a metronome.

## Watch-outs

Do not raise the scroll speed without pushing the spawn distances out to match, or the
reaction window shrinks below what a child can hit; the tests in `jumpConfig.test.ts` guard
this. Because this engine has `paceDriftRate: 0`, skin overrides must set `speedMin` and
`speedMax` to the same value. Never add a countdown or a fail state.
