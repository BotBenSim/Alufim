# Alufim (אלופים)

A Pokémon-style educational game for kids: raise an animal, earn XP through math, English,
and "find the..." games, and evolve it. Hebrew, RTL, audio-first, and playable offline.

The app is a Next.js + React + TypeScript project in [`web/`](web/).

## Knowledge base ("brain")

Decisions and the reasoning behind them live in [`knowledge/`](knowledge/), written in Open
Knowledge Format (Markdown + YAML frontmatter). Read [`AGENTS.md`](AGENTS.md) first, then
[`knowledge/index.md`](knowledge/index.md). It has three categories:

- [`technical/`](knowledge/technical/index.md) — engineering + design-pattern ADRs (incl. how
  to add a new game).
- [`educational/`](knowledge/educational/index.md) — the child-first game-design decisions.
- [`product/`](knowledge/product/index.md) — UX/product decisions.

Golden rule: never break the `alufim_state_v2` localStorage save shape.

## Run locally

```bash
make install    # or: cd web && npm install
make dev        # or: cd web && npm run dev
make test       # or: cd web && npm test
```

Open http://localhost:3000/Alufim/ (the app is served under the `/Alufim/` base path).

Note: don't run `npm run build` while the dev server is running — it can corrupt `.next`.

## How it works on the web

- The app is a **static export** (`output: export` in [`web/next.config.mjs`](web/next.config.mjs)),
  served under `/Alufim/`.
- On every push to `main`, [`.github/workflows/pages.yml`](.github/workflows/pages.yml) builds
  `web/out` and deploys it to **GitHub Pages** (repo is public so Pages can serve it).
- State is saved in the browser's `localStorage`; a Serwist service worker caches assets for
  **offline play**.
