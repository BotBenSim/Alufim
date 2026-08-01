---
id: runner-jump-tuning
title: Runner minigames — jump reach envelope + coyote time
status: accepted
date: 2026-08-01
tags: [technical, minigame, tuning]
supersedes: []
related: [minigame-provider-pattern, minigame-path-dash, minigame-timing-bounce, right-sized-difficulty]
---

# Runner minigames — jump reach envelope + coyote time

## Context

Both auto-runners — `pathDash` (roof to roof, "גג לגג") and `timingBounce` (cactus jump,
"דילוג קקטוס") — scrolled slowly enough to feel like waiting, and the roof runner was too
hard for a five-year-old. Two causes:

- Wide gaps (`gapWide` up to 0.4 screen widths at a 35% rate) were unreachable with a single
  jump, so most gaps silently demanded a mid-air double jump.
- Stepping off an edge dropped the runner instantly. A tap a few frames late did nothing.

Speed and gap sizes are independent knobs in `JumpPlayConfig`, and per-skin overrides could
push either out of range without anyone noticing.

## Decision

Tune the two runners against an explicit **reach envelope**, and add **coyote time**.

Jump reach is `airtime x scroll speed` (`jumpReach()` in `web/lib/minigames/jumpConfig.ts`).
For `pathDash`, every config — engine default and every skin override — must satisfy:

- `reach(slowest pace) > gapEasy[1]` — a jump taken at the edge always makes it across.
- `reach(fastest pace) < gapEasy[0] + roofWidth[0]` — you cannot fly clean over a short roof
  and land back in the next gap.
- `maxJumps <= 1` implies `hardChance === 0` — a single-jump skin never gets a gap that only
  a double jump can clear.

`jumpConfig.test.ts` asserts all three per skin. Raising the pace therefore forces a matching
gravity/gap change instead of silently breaking the game.

Coyote time (`coyoteMs`, 180ms) lets a tap land a full jump for a moment after the runner has
left the edge, including once the drop has begun; the fall is cancelled mid-air. Landing is
now only detected while descending, so a rescue jump starting below roof level still works.

For `timingBounce`, obstacles now always spawn past the right edge (`spawnNear[0] > 1`) and
every skin keeps at least 0.8s of travel before the cactus reaches the runner.

## Why

The two complaints pull in opposite directions — faster world, easier game — and the naive
fix for one breaks the other. Anchoring gaps to reach rather than to absolute numbers lets the
pace rise (~45% on both runners) while the timing window actually gets *wider*, and encodes
the relationship so the next tuning pass can't quietly regress it.

## Alternatives rejected

- **Only lower the speed of wide gaps** — leaves the real failure (a late tap is unrecoverable)
  in place, and slow is the thing the child noticed first.
- **Remove the fall entirely (pure no-fail)** — the gap is the whole point of the roof runner;
  without it, the jump has no meaning.
- **Clamp `hardChance` to 0 for single-jump skins inside `resolveJumpConfig`** — `hardChance`
  also picks *tall* cacti in `timingBounce`, which a single jump clears fine, so a shared
  clamp would remove variety for no reason. Kept as a per-skin data rule with a test.

## Consequences

- Skin overrides for `pathDash` must set `speedMin`/`speedMax` as a pair inside the envelope;
  the test names the offending skin when they don't.
- `timingBounce` has `paceDriftRate: 0`, so its `speedMin`/`speedMax` must be set to the same
  value — a lone `speedMax` silently averages with the base and slows the game down (this had
  already happened to the shark and dragon skins).
- `feetHalf` and `cueLead` moved from hardcoded view constants into `JumpPlayConfig`, so
  landing stickiness and cue lead time are now tunable per skin.
