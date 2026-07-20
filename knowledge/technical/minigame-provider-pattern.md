---
id: minigame-provider-pattern
title: Play-beat minigames are pluggable engines
status: accepted
date: 2026-07-20
tags: [architecture, pattern, minigames, extensibility]
supersedes: []
related: [game-provider-pattern, data-driven-content, pure-logic-in-lib, play-beat-minigame-variety]
---

# Play-beat minigames are pluggable engines

## Context

The play beat every N steps needed many short no-fail micro-games without rewriting the run
loop for each one. Learning games already use a provider registry; play interludes needed the
same additive pattern.

## Decision

Model every play-beat mini-game as a `MinigameEngine` with pure `start`, `applyInput`, and
`isComplete`, registered in a single map. Skins (prompts, items, character tags) live in
[`web/data/minigames.ts`](../../web/data/minigames.ts). The store picks a skin, starts a
session, and forwards inputs; [`MinigameHost`](../../web/components/game/MinigameHost.tsx)
dispatches UI by `engineId`.

```ts
type MinigameEngine = {
  id: MinigameEngineId;
  start: (ctx: MinigameContext) => MinigameSession;
  applyInput: (session: MinigameSession, input: MinigameInput) => MinigameSession;
  isComplete: (session: MinigameSession) => boolean;
};
```

Engines live in [`web/lib/minigames/`](../../web/lib/minigames/) and are wired in
`index.ts` as `MINIGAME_ENGINES`.

## Why

- The run loop stays engine-agnostic.
- Each mechanic is isolated and Vitest-tested.
- Adding an engine is additive: new file + registry entry + data skins + host view case.

## Alternatives rejected

- **Hard-coded feed overlay only** — no variety; kids tire quickly.
- **One giant switch in the store** — every new game edits the engine.

## Consequences: how to add an engine

1. Add the id to `MinigameEngineId` in `web/lib/minigames/types.ts`.
2. Create `web/lib/minigames/<id>.ts` exporting a `MinigameEngine`.
3. Register it in `MINIGAME_ENGINES` in `web/lib/minigames/index.ts`.
4. Add skins in `web/data/minigames.ts`.
5. Add a view under `web/components/game/minigames/` and a case in `MinigameHost.tsx`.

Registered engines: `tapCollect`, `catch`, `pathDash`, `timingBounce`, `meterBurst`,
`sliceSwipe`.
