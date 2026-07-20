---
id: state-persistence
title: Preserve alufim_state_v2 localStorage shape
status: accepted
date: 2026-06-22
tags: [state, migration, compatibility]
supersedes: []
related: [zustand-store, hydration-gating, nextjs-migration]
---

# Preserve alufim_state_v2 localStorage shape

## Context

The vanilla game saved player progress (profiles, characters, XP) to `localStorage`
under the key `alufim_state_v2` as a specific JSON shape. Real kids already had saves in
that key. The migration must not wipe or corrupt existing progress.

## Decision

Keep the exact `alufim_state_v2` key and its vanilla JSON structure. The Zustand store
reads and writes through a custom storage adapter (`alufimStorage`) in
[`web/state/store.ts`](../../web/state/store.ts) that maps the store to that shape,
rather than inventing a new key or format.

## Why

- Backward compatibility: a returning player keeps their profiles and XP with no migration
  prompt.
- The key is a public contract with the installed base; changing it silently loses data.
- Mapping at the storage boundary keeps the rest of the app free to use idiomatic React
  state.

## Alternatives rejected

- **New key + one-time migration** — extra code, and any bug risks data loss for real users.
- **Let Zustand persist its own default shape** — would have written an incompatible blob
  under a new key, orphaning existing saves.

## Consequences

- The adapter must stay in sync with the vanilla shape; changes to persisted fields need a
  deliberate, tested migration.
- This is the project's golden rule: never break `alufim_state_v2`.
