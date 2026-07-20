---
id: parity-testing
title: Vitest parity tests for ported logic
status: accepted
date: 2026-07-20
tags: [testing, vitest, migration, game-balance]
supersedes: []
related: [nextjs-migration, state-persistence]
---

# Vitest parity tests for ported logic

## Context

The migration re-implemented hand-written vanilla JS game logic (XP thresholds, question
generation, form evolution) in TypeScript. Silent behavior drift would change gameplay and
possibly break the feel players are used to.

## Decision

Port pure logic into `web/lib/` and cover it with [Vitest](https://vitest.dev) unit tests
(e.g. [`web/lib/xp.test.ts`](../../web/lib/xp.test.ts)) that pin the vanilla behavior. As
part of this, `FORM_XP_STEP` is set to `50` (thresholds 50/150/300) to match the vanilla
game, and the tests assert those thresholds.

## Why

- Pure functions are cheap and reliable to test, giving a safety net for the port.
- Pinning exact thresholds documents intended game balance and prevents accidental drift.
- Fast tests keep future refactors of the logic honest.

## Alternatives rejected

- **Manual play-testing only** — slow, non-repeatable, and misses edge cases.
- **End-to-end tests for logic** — heavier and slower than unit tests for pure functions.

## Consequences

- Logic changes must update the corresponding tests deliberately, making balance changes
  explicit (e.g. the 70 -> 50 step change).
- Keeps game-affecting logic in testable, side-effect-free modules under `web/lib/`.
