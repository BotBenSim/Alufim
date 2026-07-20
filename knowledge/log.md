---
id: log
title: Decision Log
type: log
updated: 2026-07-20
tags: [log, changelog]
---

# Decision Log

Reverse-chronological. Newest first. One line per decision; link to the file.

- 2026-07-20 — play-beat heroes rebuilt with real skill moments (path-dash jump window, timing-bounce sweet zone, slice-swipe hit-test); stubs out of picker — see [play-beat-minigame-variety](educational/play-beat-minigame-variety.md).
- 2026-07-20 — play-beat minigames: [minigame-provider-pattern](technical/minigame-provider-pattern.md), [play-beat-minigame-variety](educational/play-beat-minigame-variety.md), six engine educational decisions; [start-from-first-form](educational/start-from-first-form.md) + [product/start-from-first-form](product/start-from-first-form.md).
- 2026-07-20 — technical: added design-pattern ADRs (game-provider-pattern, data-driven-content, question-dispatch-by-op, pure-logic-in-lib); folded public-repo into [static-export-pages](technical/static-export-pages.md) and parity-testing into [pure-logic-in-lib](technical/pure-logic-in-lib.md).
- 2026-07-20 — [educational](educational/index.md): reshaped from theory essays into concrete game-design decisions (always-gain-xp, play-beat interludes, no-time-pressure/FOMO, right-sized difficulty, celebrate-progress, choose-and-nurture, audio-first, game-variety).
- 2026-07-20 — knowledge base: reorganized into categories — `technical/`, `educational/`, `product/` — each with its own index and template.
- 2026-07-20 — [educational](educational/index.md): add learning-decision category (sourced from the About page and game mechanics).
- 2026-07-20 — [pure-logic-in-lib](technical/pure-logic-in-lib.md): keep game logic in pure, Vitest-tested `lib/` modules; pin `FORM_XP_STEP = 50` to match vanilla.
- 2026-07-20 — [static-export-pages](technical/static-export-pages.md): keep the repo public so GitHub Pages can serve it.
- 2026-07-20 — [hydration-gating](technical/hydration-gating.md): render nothing until the persisted store rehydrates, fixing duplicated UI.
- 2026-06-22 — [pwa-serwist](technical/pwa-serwist.md): add offline play via Serwist.
- 2026-06-22 — [design-system](technical/design-system.md): introduce tokens + primitives under `web/design-system/`.
- 2026-06-22 — [static-export-pages](technical/static-export-pages.md): ship as a static export deployed by GitHub Actions.
- 2026-06-22 — [zustand-store](technical/zustand-store.md): manage state with Zustand + persist.
- 2026-06-22 — [state-persistence](technical/state-persistence.md): preserve the `alufim_state_v2` JSON shape via a custom storage adapter.
- 2026-06-22 — [nextjs-migration](technical/nextjs-migration.md): migrate the vanilla game to Next.js/React/TS in `web/`.
