---
id: per-profile-curriculum
title: Difficulty curriculum is copied into each profile
status: accepted
date: 2026-07-20
tags: [state, difficulty, curriculum, settings]
supersedes: []
related: [data-driven-content, state-persistence, right-sized-difficulty, settings-sidebar]
---

# Difficulty curriculum is copied into each profile

## Context

Difficulty bands (`GAME_DIFFICULTY`) and the steps-per-band cadence lived only in code.
Parents could pick easy/medium/hard, but not retune “steps 1–4 up to sum 8” without a
deploy. Returning players already persist progress under `alufim_state_v2`.

## Decision

Keep a **factory** table in [`web/lib/difficulty.ts`](../../web/lib/difficulty.ts). On
profile create and migrate, **deep-copy** that factory into
`profile.games[gameId].curriculum` (`stepsPerBlock` + full `bands` for easy/medium/hard).
Gameplay and the settings UI always read/write that stored copy. **איפוס לברירת מחדל**
re-copies the current factory explicitly.

## Why

- Each player owns their numbers; siblings can differ.
- Factory updates do not silently rewrite customized saves.
- Additive field on the existing save shape — no new localStorage key.

## Alternatives rejected

- **Live merge / optional overrides** — settings would not clearly “own” the values; harder
  to reason about what a child will see.
- **Global app settings only** — conflicts with per-player tuning.

## Consequences

- `diffParams(curriculum, level, step)` takes the profile curriculum, not `gameId`.
- Migrate must `ensureCurriculum` for older saves missing the field.
- Changing the factory only affects new profiles and explicit resets.
- Profiles also store `playEverySteps` (default 3): minigame cadence is a number, built via
  `rhythmFromPlayEvery` — not named presets like `every2`.
