---
id: technical-index
title: Technical - Engineering Decisions
type: manifest
format: OKF/1.0
updated: 2026-07-21
tags: [technical, engineering, architecture, manifest]
---

# Technical - Engineering Decisions

Architecture Decision Records: *how* we built the app and why, at the engineering level.
For *why a feature helps kids learn*, see [`../educational/`](../educational/index.md); for
UX/product choices, see [`../product/`](../product/index.md).

## File shape

Shared OKF frontmatter (`id`, `title`, `status`, `date`, `tags`) plus `supersedes` and
`related`, with sections: **Context -> Decision -> Why -> Alternatives rejected ->
Consequences**. See [`TEMPLATE.md`](TEMPLATE.md).

## Design patterns

The core patterns that keep the app extensible — start here to understand the architecture.

| ID | Title | Status |
| --- | --- | --- |
| [game-provider-pattern](game-provider-pattern.md) | Games are pluggable providers (how to add a game) | accepted |
| [minigame-provider-pattern](minigame-provider-pattern.md) | Play-beat minigames: engines + UI strategies | accepted |
| [data-driven-content](data-driven-content.md) | Content + tuning live in `data/`, not code | accepted |
| [per-profile-curriculum](per-profile-curriculum.md) | Difficulty curriculum copied into each profile | accepted |
| [question-dispatch-by-op](question-dispatch-by-op.md) | Dispatch render/speech by `Question.op` | accepted |
| [pure-logic-in-lib](pure-logic-in-lib.md) | Pure, testable logic in `lib/`, split from React | accepted |
| [design-system](design-system.md) | Design system: tokens + primitives | accepted |

## Platform and state

| ID | Title | Status |
| --- | --- | --- |
| [nextjs-migration](nextjs-migration.md) | Migrate vanilla index.html to Next.js/React/TS in `web/` | accepted |
| [static-export-pages](static-export-pages.md) | Static export to GitHub Pages via Actions (public repo) | accepted |
| [pr-preview-pages](pr-preview-pages.md) | Per-PR staging previews under `/Alufim/pr/<n>/` | accepted |
| [pwa-serwist](pwa-serwist.md) | Offline play via Serwist PWA | accepted |
| [state-persistence](state-persistence.md) | Preserve `alufim_state_v2` localStorage shape | accepted |
| [zustand-store](zustand-store.md) | Zustand + persist for app state | accepted |
| [hydration-gating](hydration-gating.md) | Gate UI until store rehydrates | accepted |
