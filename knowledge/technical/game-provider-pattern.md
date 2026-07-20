---
id: game-provider-pattern
title: Games are pluggable providers
status: accepted
date: 2026-07-20
tags: [architecture, pattern, games, extensibility]
supersedes: []
related: [data-driven-content, question-dispatch-by-op, pure-logic-in-lib]
---

# Games are pluggable providers

## Context

Alufim has four games (add, sub, eng, find) and will likely gain more. Each game generates
questions differently, but the run loop, XP, rhythm, and UI should not care which game is
active. We needed a way to add a game without editing the engine.

## Decision

Model every game as a `Provider` — an object with two pure functions — and register it in a
single map. The engine only ever talks to the `Provider` interface, never to a specific game.

```ts
// web/lib/types.ts
type Provider = {
  generate: (ctx: ProviderContext) => Question;  // make the next question
  key: (q: Question) => string;                  // stable id for de-duping
};
```

Providers live in [`web/lib/providers/`](../../web/lib/providers) and are wired in
[`web/lib/providers/index.ts`](../../web/lib/providers/index.ts):

```ts
export const PROVIDERS: Record<GameId, Provider> = { add, sub, eng, find };
export function getProvider(gameId: GameId): Provider { return PROVIDERS[gameId]; }
```

## Why

- The run loop stays game-agnostic: it calls `generate(ctx)` and `key(q)` and nothing else.
- Each game's logic is isolated and independently testable.
- Adding a game is additive — new files plus registrations — not surgery on the engine.

## Alternatives rejected

- **A big `switch (gameId)` in the run loop** — every new game would edit the engine and grow
  the switch; poor isolation.
- **Class hierarchy / inheritance** — heavier than two pure functions need to be.

## Consequences: how to add a new game

1. Add the id to `GameId` in [`web/lib/types.ts`](../../web/lib/types.ts).
2. Create `web/lib/providers/<id>.ts` exporting a `Provider` (`generate` + `key`) and its
   question type; add render/speak helpers as the other providers do.
3. Register it in [`web/lib/providers/index.ts`](../../web/lib/providers/index.ts).
4. Add difficulty blocks under the id in
   [`web/lib/difficulty.ts`](../../web/lib/difficulty.ts) (see
   [data-driven-content](data-driven-content.md)).
5. Add a `case` for the id where questions are rendered and spoken (see
   [question-dispatch-by-op](question-dispatch-by-op.md)).
6. Add the game's metadata to `GAMES` in [`web/data/games.ts`](../../web/data/games.ts).

The engine, XP, and rhythm need no changes.
