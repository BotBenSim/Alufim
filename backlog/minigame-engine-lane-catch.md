---
id: minigame-engine-lane-catch
title: Mini-game engine — lane-catch (catch the falling food, let the junk drop)
status: accepted
date: 2026-08-01
tags: [backlog, educational, engagement, minigame]
theory: Attention span + novelty + inhibitory control (go/no-go) + visual tracking
scope: M
source: human
related:
  - minigame-lane-catch
  - minigame-engine-catch
  - play-beat-minigame-host
  - play-beat-minigame-variety
  - minigame-provider-pattern
  - no-time-pressure-no-fomo
  - always-gain-xp
  - audio-first
---

# Mini-game engine — lane-catch

## Problem / opportunity

Every shipped play-beat engine asks the child to act on *everything* on screen: cut it, slice
it, jump it, fling it. None asks the child to **hold back**. A three-lane catcher adds a new
kind of moment — decide whether to move at all — while giving the beat something it lacks
visually: a slow, trackable falling object the child can anticipate.

## Proposed feature

`MinigameEngine` `laneCatch` + `LaneCatchView`: the child's animal stands at the bottom of a
three-lane stage. Food falls one item at a time; the child drags, taps a lane, or uses the
arrow keys to walk the animal under it. Some drops are obviously inedible objects (a boot, a
rock, a sock) and should be allowed to fall past. Catching one is a yuck wobble and nothing
else — no score loss, no life, no game over. Five good catches wins.

## Grounding

- Novelty on the play beat
  ([play-beat-minigame-variety](../knowledge/educational/play-beat-minigame-variety.md)).
- Inhibitory control / go–no-go from executive-function research: choosing *not* to act on a
  salient cue is a distinct, trainable preschool skill.
- No-fail, always-gain
  ([always-gain-xp](../knowledge/educational/always-gain-xp.md),
  [no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md)).
- Spoken rule, no reading ([audio-first](../knowledge/educational/audio-first.md)).

## Relationship to the removed `catch` stub

This replaces the thin stub proposed in
[minigame-engine-catch](minigame-engine-catch.md) (`status: superseded`, deleted from the
product). That id stays dead: it ships under the **new** engine id `laneCatch` because
`web/lib/migrate.ts` copies previously-persisted per-id values, so reusing `catch` would
resurrect stale `catch: { enabled: false }` entries sitting in old `alufim_state_v2` saves and
silently ship the game switched off for returning players.

## Rough scope

- `web/lib/minigames/laneCatch.ts` — engine plus pure lane geometry, catch test, and spawn
  picker, with Vitest coverage in `laneCatch.test.ts`.
- `web/components/game/minigames/LaneCatchView.tsx` on `MinigameShell`.
- Five skins in `web/data/minigames.ts` (new optional `avoidItems`), one meta row.

## Watch-outs

- Inedible items must be *objects*, never another animal's food — a four-year-old cannot
  reason "a lion doesn't eat lettuce" in two seconds, and an unfair miss breaks the no-frustration
  rule.
- Golden rule: `avoidItems` is additive to `MinigameSkin`, and the new engine key reaches saves
  only through `defaultMinigameConfig()`. Nothing in `alufim_state_v2` changes shape.
- Never add bombs, lives, timers, or two items at once.

## Graduated to

[`knowledge/educational/minigame-lane-catch.md`](../knowledge/educational/minigame-lane-catch.md)
