---
id: zustand-store
title: Zustand + persist for app state
status: accepted
date: 2026-06-22
tags: [state, zustand, architecture]
supersedes: []
related: [state-persistence, hydration-gating]
---

# Zustand + persist for app state

## Context

The app needs shared state across screens: which profile/character/game is active, the UI
screen, and the live game run. That state must also persist to `localStorage` in the
`alufim_state_v2` shape.

## Decision

Use [Zustand](https://github.com/pmndrs/zustand) with its `persist` middleware as the
single store, defined in [`web/state/store.ts`](../../web/state/store.ts).

## Why

- Zustand is tiny, unopinionated, and hook-based — low ceremony for a small app.
- Its `persist` middleware has a pluggable storage adapter, which is exactly the seam we
  need to keep the vanilla JSON shape (see [state-persistence](state-persistence.md)).
- No provider-tree boilerplate like Context, and far less machinery than Redux.
- It is a mature, widely adopted library (well over the popularity bar for dependencies).

## Alternatives rejected

- **React Context** — re-render and boilerplate pain for frequently-updated game state,
  and no built-in persistence.
- **Redux Toolkit** — more structure than this app warrants.
- **Local component state only** — cannot share the run/profile across screens cleanly.

## Consequences

- Persistence runs through the custom `alufimStorage` adapter.
- Rehydration is asynchronous on the client, which forced the gating pattern in
  [hydration-gating](hydration-gating.md).
- State updates that must be atomic (e.g. starting a run) need a single `set()` call to
  avoid intermediate null states.
