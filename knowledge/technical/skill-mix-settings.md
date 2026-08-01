---
id: skill-mix-settings
title: Parents set how many questions each stage gets, per game
status: proposed
date: 2026-08-01
tags: [architecture, curriculum, settings, difficulty]
supersedes: []
related: [per-profile-curriculum, curriculum-tracks, track-skill-ladders, parent-tuned-difficulty-bands, state-persistence]
---

# Parents set how many questions each stage gets, per game

## Context

Today a profile's curriculum is `{ stepsPerBlock, bands[] }`
([per-profile-curriculum](per-profile-curriculum.md)). `stepsPerBlock` is a single number — every
band gets the same number of steps (default 4) before the run ramps to the next one, and the ramp
restarts each run.

That is too blunt for a stage ladder ([track-skill-ladders](../educational/track-skill-ladders.md)).
A child who is solid on "hear the difference" but shaky on "letter + nikud" should not get four of
each. The parent needs to say: ten of stage 1, then ten of stage 2.

## Decision (proposed)

Let the parent set a **per-stage count** instead of one uniform number, for every game and track:

```ts
type GameCurriculum = {
  stepsPerBlock: number;      // kept: fallback when counts is absent
  counts?: number[];          // new, optional: questions per band, in order
  bands: Record<DifficultyLevel, DifficultyBand[]>;
};
```

A run walks `counts` in order — `counts[0]` questions from band 0, then `counts[1]` from band 1, and
so on, staying on the last band once the list is exhausted. A `0` skips a stage entirely, which is
how a parent turns off a stage the child has outgrown or is not ready for.

UI lives beside the existing per-band curriculum editor in the settings sidebar: one small number
field per band, labelled with the stage name.

## Why

- It makes the ladder genuinely parent-tunable rather than a fixed ramp, which is the point of
  [parent-tuned-difficulty-bands](../educational/parent-tuned-difficulty-bands.md).
- `0` gives a skip/disable control for free, without a second mechanism.
- It generalizes cleanly: the existing four games get the same control, so there is one concept to
  learn rather than "tracks work differently".

## Alternatives rejected

- **Per-band `stepsPerBlock` only** — same expressiveness, but no way to skip a stage.
- **Automatic mastery-based advancement** — better in theory, but it needs per-skill mastery state
  and tuning we have no data for yet. `counts` is the manual version of the same idea and does not
  block adding mastery later.

## Consequences

- `counts` is optional and additive; absent means today's uniform behaviour, so existing saves are
  untouched ([state-persistence](state-persistence.md)).
- `blockForStep` gains a counts-aware sibling in [`web/lib/xp.ts`](../../web/lib/xp.ts); pure and
  unit-testable, with the existing function kept for the fallback path.
- Validation matters: an all-zero `counts` must not produce a run with no questions.
