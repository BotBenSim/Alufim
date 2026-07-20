---
id: technical-index
title: Technical - Engineering Decisions
type: manifest
format: OKF/1.0
updated: 2026-07-20
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

## Decisions

| ID | Title | Status |
| --- | --- | --- |
| [nextjs-migration](nextjs-migration.md) | Migrate vanilla index.html to Next.js/React/TS in `web/` | accepted |
| [state-persistence](state-persistence.md) | Preserve `alufim_state_v2` localStorage shape | accepted |
| [zustand-store](zustand-store.md) | Zustand + persist for app state | accepted |
| [hydration-gating](hydration-gating.md) | Gate UI until store rehydrates | accepted |
| [static-export-pages](static-export-pages.md) | Static export to GitHub Pages via Actions | accepted |
| [public-repo](public-repo.md) | Repo stays public for GitHub Pages | accepted |
| [pwa-serwist](pwa-serwist.md) | Offline play via Serwist PWA | accepted |
| [design-system](design-system.md) | Design system: tokens + primitives | accepted |
| [parity-testing](parity-testing.md) | Vitest parity tests for ported logic | accepted |
