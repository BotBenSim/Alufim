---
id: pure-logic-in-lib
title: Pure, testable logic in lib/ — separate from React
status: accepted
date: 2026-07-20
tags: [architecture, pattern, testing, vitest]
supersedes: [parity-testing]
related: [game-provider-pattern, data-driven-content, question-dispatch-by-op]
---

# Pure, testable logic in lib/ — separate from React

## Context

The game's behaviour — XP, difficulty, rhythm, missions, question generation — was
hand-written vanilla JS. Re-implemented inside React components it would be hard to test and
prone to silent drift from the version players know.

## Decision

Keep all game-affecting logic in pure, side-effect-free modules under
[`web/lib/`](../../web/lib) (`xp.ts`, `difficulty.ts`, `rhythm.ts`, `missions.ts`, the
providers), and cover them with [Vitest](https://vitest.dev) unit tests (`*.test.ts`).
Components consume these functions; they do not embed the logic.

## Why

- Pure functions are cheap and reliable to test, giving a safety net for the port and future
  refactors.
- Separating logic from rendering keeps components thin and the rules reusable (the run loop,
  the About page, and tests all call the same functions).
- Tests pin intended game balance so changes are deliberate, not accidental.

## Alternatives rejected

- **Logic inside components** — untestable without rendering, and easy to duplicate.
- **Manual play-testing only** — slow, non-repeatable, misses edge cases.
- **End-to-end tests for logic** — heavier and slower than unit tests for pure functions.

## Consequences

- Behaviour changes must update the matching test deliberately. Example: `FORM_XP_STEP` is
  pinned to `50` (thresholds 50/150/300) in [`web/lib/xp.test.ts`](../../web/lib/xp.test.ts);
  the 70 -> 50 change was an explicit, tested balance decision.
- New game-affecting behaviour belongs in `web/lib/` with a test, not in a component.
