---
id: minigame-lane-catch
title: Lane-catch play-beat — catch the food, let the junk fall
status: accepted
date: 2026-08-01
tags: [educational, minigame]
theory: Attention span + novelty, inhibitory control (go/no-go), visual tracking + anticipatory timing
related:
  - play-beat-minigame-variety
  - minigame-provider-pattern
  - no-time-pressure-no-fomo
  - always-gain-xp
  - audio-first
  - minigame-engine-lane-catch
---

# Lane-catch play-beat — catch the food, let the junk fall

## Decision

The child's animal stands at the bottom of a three-lane stage; one item falls at a time and the
child walks the animal under it. Food is caught; obviously inedible objects (boot, rock, sock,
log, brick) are meant to fall past. Catching an inedible object costs nothing at all — a yuck
wobble, the soft miss chime, and a score that does not move. `web/lib/minigames/laneCatch.ts` +
`LaneCatchView`.

The inedible items are **objects, never another animal's food**. A four-year-old cannot reliably
reason "a lion doesn't eat lettuce" in the two seconds an item is falling; "that isn't food" is
readable at a glance.

## Why it helps the child

Two things the other play-beat engines don't ask for. First, **inhibitory control** — a go/no-go
choice, where the win sometimes means deliberately *not* acting on something moving and
interesting; executive-function research treats that restraint as its own preschool skill, and
here it costs nothing to get wrong. Second, **visual tracking and anticipatory timing** — a slow
falling object plus an early cue in the target lane lets the child predict where to be, rather
than react once it is too late.

## How it works

Three lanes; the animal's x eases toward the tapped, dragged, or arrow-keyed lane at 0.9
normalized units per second, so it walks instead of teleporting, and clamps at the edge lanes.
Each drop opens with a ~0.55 s sparkle in its lane, then falls the height of the stage in 2.6 s.
A catch registers in a generous band (y 0.70–0.98) with 0.22 of horizontal slack — wider than
the half-lane of 0.167, so being mid-walk still counts. The first two drops are always food;
after that roughly one in three is inedible, and never two in a row. Five good catches wins, so
a round lands near fifteen seconds. Missing food and catching junk both report
`quality: "miss"`, which the engine ignores outright — the score only ever rises.

## Watch-outs

- Swapping an `avoidItems` entry for a real food (lettuce for a lion) turns a fair glance
  judgement into a knowledge quiz and will produce unfair-feeling misses.
- Speeding up the fall, dropping two items at once, or trimming the telegraph removes the
  anticipation window that makes the game learnable rather than reflexive.
- Any score penalty, life, or timer on the inedible items would break
  [always-gain-xp](always-gain-xp.md) and [no-time-pressure-no-fomo](no-time-pressure-no-fomo.md).
- Letting an inedible object fall past is deliberately silent. If that ever reads as "nothing
  happened", add a quiet positive cue — never a scoring one.
