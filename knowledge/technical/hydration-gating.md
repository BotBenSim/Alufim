---
id: hydration-gating
title: Gate UI until the persisted store rehydrates
status: accepted
date: 2026-07-20
tags: [hydration, ssr, state, bugfix]
supersedes: []
related: [zustand-store, state-persistence, nextjs-migration]
---

# Gate UI until the persisted store rehydrates

## Context

Next.js static export pre-renders HTML on the server, where `localStorage` does not exist.
Zustand's persisted state only loads on the client, after mount. When the server rendered
the game shell and the client then rehydrated with real state, the UI appeared twice — the
"Alufim title and child selection twice on screen" bug.

## Decision

Introduce [`web/components/StoreHydration.tsx`](../../web/components/StoreHydration.tsx),
which starts `ready = false` on both server and client and renders `children` only after
Zustand reports hydration finished (`onFinishHydration` / `hasHydrated`).

## Why

- The static HTML must never contain the stateful shell, or it duplicates after hydration.
- Gating at one wrapper is simpler and less error-prone than guarding every screen.
- It keeps the persisted store as the single source of truth for what renders.

## Alternatives rejected

- **`useEffect` guard per screen** — repetitive and easy to miss, leading to flicker.
- **Disable SSR entirely for the app** — loses the static-export benefits we deploy with.
- **Initialize `ready = true` on server** — this was the original bug: it baked the shell
  into static HTML.

## Consequences

- A brief blank frame before hydration completes (acceptable for this app).
- Any component that depends on persisted state should render under `StoreHydration`.
