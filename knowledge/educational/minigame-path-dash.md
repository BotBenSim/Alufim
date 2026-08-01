---
id: minigame-path-dash
title: Path-dash play-beat engine — roof runner a five-year-old can beat
status: accepted
date: 2026-08-01
tags: [educational, minigame]
theory: Flow (challenge matched to skill) + Attention span
related: [play-beat-minigame-variety, minigame-provider-pattern, runner-jump-tuning, right-sized-difficulty]
---

# Path-dash play-beat engine — roof runner a five-year-old can beat

## Decision

Auto-run side scene: the animal runs across rooftops and the child taps to jump the gaps.
Score +1 per gap cleared, win at `targetCount`. A fall costs nothing but the gap — no lives,
no timer, and the roofs rebuild under the child so the run always continues.
`web/lib/minigames/pathDash.ts` + `PathDashView`.

The challenge is deliberately kept at "tap roughly at the right moment", never at
"execute a precise double jump":

- A single jump always reaches the next roof; wide gaps that need the second jump are rare
  (15%) and a mid-air tap still rescues them.
- Coyote time — a tap up to 180ms after leaving the edge still jumps, even mid-fall.
- A yellow arrow cue appears about half a second before each edge.

## Why it helps the child

Flow needs the challenge to sit just above the child's skill; a runner that punishes a
five-year-old's reaction time sits far above it and turns adventure into frustration. The
forgiveness features move the required precision down to what a preschooler's motor timing
can actually deliver, while keeping a real "I did it!" moment at each gap.

## How it works

Score +1 on landing after crossing a gap. A fall flashes "אופס…", pauses briefly, and drops
the runner onto a fresh safe roof — the child never restarts or loses ground.

## Watch-outs

Speed and gap width are coupled: making the world faster without re-checking the reach
envelope makes gaps unclearable. See
[runner-jump-tuning](../technical/runner-jump-tuning.md) — the tests enforce it. Never add
lives, a timer, or a total-restart fail state.
