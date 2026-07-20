---
id: minigame-provider-pattern
title: Play-beat minigames are pluggable engines + UI strategies
status: accepted
date: 2026-07-20
tags: [architecture, pattern, minigames, extensibility]
supersedes: []
related: [game-provider-pattern, data-driven-content, pure-logic-in-lib, play-beat-minigame-variety]
---

# Play-beat minigames are pluggable engines + UI strategies

## Context

The play beat every N steps needed many short no-fail micro-games without rewriting the run
loop for each one. Learning games already use a provider registry; play interludes needed the
same additive pattern. Views also drifted (score/hint placement, sounds), so the UI side needed
the same strategy discipline.

## Decision

**Logic:** every play-beat mini-game is a `MinigameEngine` with pure `start`, `applyInput`, and
`isComplete`, registered in `MINIGAME_ENGINES`. Skins live in
[`web/data/minigames.ts`](../../web/data/minigames.ts).

**UI:** every engine has a view strategy in
[`web/components/game/minigames/registry.ts`](../../web/components/game/minigames/registry.ts)
(`View` + `goodSfx` / `missSfx`). [`MinigameHost`](../../web/components/game/MinigameHost.tsx)
looks up the strategy — no per-engine switch. All views share
[`MinigameShell`](../../web/design-system/components/MinigameShell.tsx) so prompt / score /
stage / hint stay in one place.

**Jump feel:** double-jump, pace, gaps, and hints are not hardcoded in views. Defaults live in
[`JUMP_CONFIG_BY_ENGINE`](../../web/lib/minigames/jumpConfig.ts); skins may override via
`skin.jump`. Engines stash the resolved config on `session.state.jump`.

```ts
type MinigameEngine = {
  id: MinigameEngineId;
  start: (ctx: MinigameContext) => MinigameSession;
  applyInput: (session: MinigameSession, input: MinigameInput) => MinigameSession;
  isComplete: (session: MinigameSession) => boolean;
};

type MinigameUiStrategy = {
  View: ComponentType<MinigameViewProps>; // onInput + playSfx
  goodSfx: MinigameSfx;
  missSfx: MinigameSfx;
};
```

## Why

- The run loop stays engine-agnostic.
- Each mechanic is isolated and Vitest-tested.
- Chrome (score + stage) is consistent; no instruction text to read — prompts are spoken.
- Sounds are mechanic-specific (`jump`, `land`, `slice`, `bonk`, `pop`) via `useAudio`.

## Alternatives rejected

- **Hard-coded feed overlay only** — no variety; kids tire quickly.
- **One giant switch in the store / host** — every new game edits the engine.
- **Per-view bespoke score/hint layout** — inconsistent and hard to teach.

## Consequences: how to add an engine

1. Add the id to `MinigameEngineId` in `web/lib/minigames/types.ts`.
2. Create `web/lib/minigames/<id>.ts` exporting a `MinigameEngine`.
3. Register it in `MINIGAME_ENGINES` in `web/lib/minigames/index.ts`.
4. Add skins in `web/data/minigames.ts` (+ `minigameMeta` defaults).
5. Add a view under `web/components/game/minigames/` that uses `MinigameShell` and
   `MinigameViewProps`, then register it in `MINIGAME_UI`.

Registered engines: `pathDash`, `timingBounce`, `sliceSwipe`, `slingShot`, `charMaze`,
`cutRope`.
