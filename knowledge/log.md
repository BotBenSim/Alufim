---
id: log
title: Decision Log
type: log
updated: 2026-07-20
tags: [log, changelog]
---

# Decision Log

Reverse-chronological. Newest first. One line per decision; link to the file.

- 2026-07-20 — [educational](educational/index.md): reshaped from theory essays into concrete game-design decisions (always-gain-xp, play-beat interludes, no-time-pressure/FOMO, right-sized difficulty, celebrate-progress, choose-and-nurture, audio-first, game-variety).
- 2026-07-20 — knowledge base: reorganized into categories — `technical/`, `educational/`, `product/` — each with its own index and template.
- 2026-07-20 — [educational](educational/index.md): add learning-decision category (sourced from the About page and game mechanics).
- 2026-07-20 — [parity-testing](technical/parity-testing.md): lock ported pure logic with Vitest; set `FORM_XP_STEP = 50` to match vanilla.
- 2026-07-20 — [public-repo](technical/public-repo.md): keep the repo public so GitHub Pages can serve it.
- 2026-07-20 — [hydration-gating](technical/hydration-gating.md): render nothing until the persisted store rehydrates, fixing duplicated UI.
- 2026-06-22 — [pwa-serwist](technical/pwa-serwist.md): add offline play via Serwist.
- 2026-06-22 — [design-system](technical/design-system.md): introduce tokens + primitives under `web/design-system/`.
- 2026-06-22 — [static-export-pages](technical/static-export-pages.md): ship as a static export deployed by GitHub Actions.
- 2026-06-22 — [zustand-store](technical/zustand-store.md): manage state with Zustand + persist.
- 2026-06-22 — [state-persistence](technical/state-persistence.md): preserve the `alufim_state_v2` JSON shape via a custom storage adapter.
- 2026-06-22 — [nextjs-migration](technical/nextjs-migration.md): migrate the vanilla game to Next.js/React/TS in `web/`.
