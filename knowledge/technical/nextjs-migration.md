---
id: nextjs-migration
title: Migrate vanilla index.html to Next.js/React/TS in web/
status: accepted
date: 2026-06-22
tags: [migration, architecture, nextjs]
supersedes: []
related: [state-persistence, static-export-pages, design-system]
---

# Migrate vanilla index.html to Next.js/React/TS in web/

## Context

Alufim started as a single vanilla `index.html` with inline JS and CSS. It worked, but
grew hard to extend: no components, no type safety, no test seam, and layout logic was
tangled with game logic. We wanted to add games, a design system, and offline support
without the file becoming unmaintainable.

## Decision

Rebuild the app as a Next.js + React + TypeScript project living in the `web/`
subdirectory, keeping the vanilla version at the repo root only until parity was reached
(later removed).

## Why

- React gives us reusable components for repeated UI (cards, buttons, overlays).
- TypeScript catches shape errors at build time — critical when porting hand-written JS.
- Next.js has first-class static export, which fits GitHub Pages hosting.
- Keeping it in `web/` isolated the migration and let both versions coexist during porting.

## Alternatives rejected

- **Stay vanilla** — cheapest short-term, but every new feature compounded the mess.
- **Plain Vite + React (no Next.js)** — viable, but Next.js gave us static export, routing,
  metadata/manifest, and PWA conventions out of the box.
- **Svelte/Vue** — no strong reason to leave the React ecosystem for a kids' game.

## Consequences

- Two-step build: source in `web/`, static output in `web/out`.
- Porting hand-written logic required careful parity checks (see
  [pure-logic-in-lib](pure-logic-in-lib.md)).
- SSR/hydration introduced a new class of bug (see [hydration-gating](hydration-gating.md)).
- The vanilla `index.html` and root `assets/` were removed once the port was live.
