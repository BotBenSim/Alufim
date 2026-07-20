---
id: data-driven-content
title: Content and tuning live in data/, not in code
status: accepted
date: 2026-07-20
tags: [architecture, pattern, content, data]
supersedes: []
related: [game-provider-pattern, pure-logic-in-lib, per-profile-curriculum]
---

# Content and tuning live in data/, not in code

## Context

Games, characters, vocabulary, "find" packs, and difficulty ranges change often and are
edited by intent (game design), not by algorithm. Baking them into logic would make tuning a
code-surgery task and bloat the providers.

## Decision

Keep declarative content and tuning in [`web/data/`](../../web/data) and difficulty tables in
[`web/lib/difficulty.ts`](../../web/lib/difficulty.ts), separate from the logic that consumes
them. Providers read parameters; they do not hardcode ranges.

- `web/data/games.ts` — game metadata (title, icon, provider link).
- `web/data/characters.ts`, `vocab`, `find` — characters and question content.
- `GAME_DIFFICULTY` — per-game, per-level, per-block ranges, read via `diffParams(...)`.

```ts
// providers ask for parameters instead of hardcoding them
const p = diffParams<{ minSum: number; maxSum: number }>("add", ctx.level, ctx.step);
```

## Why

- Game designers can retune difficulty or add content by editing data, not logic.
- Difficulty scales by both level and step from one table, keeping the curve consistent.
- Providers stay small and focused on generation, not configuration.

## Alternatives rejected

- **Hardcoded ranges inside each provider** — tuning means hunting through code, and the
  difficulty curve drifts per game.
- **A runtime config service / CMS** — overkill for a static, offline kids' game.

## Consequences

- New content is usually a data edit, not a logic change.
- The shape of a difficulty block is per-game (`AddBlock`, `SubBlock`, …); keep the type and
  the provider's `diffParams<T>()` in sync.
