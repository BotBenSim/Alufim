# Alufim (אלופים)

A Pokémon-style educational game for kids: raise an animal, earn XP through short learning
games, and evolve it. Hebrew, RTL, audio-first, and playable offline.

The app is a Next.js + React + TypeScript project in [`web/`](web/).

## Status — WIP

**Quality is not approved.** The six newer learning games below are work in progress: the
ladders and pedagogy are still being reshaped from real play with kids. Treat them as
experimental, not as a finished curriculum.

Older games (חיבור, חיסור, אנגלית vocabulary) are more settled, but the product as a whole
is still evolving.

## Learning games

**Settled (older):**

- **חיבור** / **חיסור** — addition and subtraction with emoji → mixed → digits scaffold
- **אנגלית** — English word ↔ picture vocabulary

**WIP (six newer games — quality not approved):**

1. **מספרים** — digit recognition, quantity ↔ numeral, which is bigger, tens/hundreds
2. **כפל** — multiplication as equal groups
3. **חילוק** — division as fair sharing (no remainders)
4. **קריאה בעברית** — letter → nikud → syllable → word ladder
5. **קריאה באנגלית** — phonics ladder (sound → letter → blend → read)
6. **מוזיקה** — chords first (happy/sad, I/IV/V), then keys / solfège / phrases

## i18n / global language

There is a **design for internationalization** (global UI language, not only Hebrew), but it
**has not been implemented** yet. The live app is still Hebrew-first / RTL with hardcoded
copy. When that work lands it should be recorded under [`knowledge/technical/`](knowledge/technical/).

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

## Agent playbooks

New educational features flow through a git-based **propose -> curate -> implement** loop:

1. **Propose** — an agent reads the [`knowledge/`](knowledge/) brain and drafts theory-backed
   educational ideas into [`backlog/`](backlog/) (`status: proposed`).
2. **Curate** — you review, edit, add your own, and set `status: approved` (or `rejected`).
3. **Implement** — an agent builds one approved proposal, then graduates it into a
   `knowledge/educational/` decision (`status: accepted`).

The prompts that drive this are tool-agnostic and live once in [`playbooks/`](playbooks/) (the
single source of truth). Vendor-specific files (Cursor/Claude rules, slash commands, skills)
are **generated** from them and are gitignored:

```bash
make agents                    # generate all vendors' files from playbooks/
make agents VENDORS=cursor     # or a subset (space/comma separated)
```

Edit the playbook, never the generated file (`.cursor/`, `.claude/`, `CLAUDE.md`).

## How it works on the web

- The app is a **static export** (`output: export` in [`web/next.config.mjs`](web/next.config.mjs)),
  served under `/Alufim/`.
- On every push to `main`, [`.github/workflows/pages.yml`](.github/workflows/pages.yml) builds
  `web/out` and deploys it to **GitHub Pages** (repo is public so Pages can serve it).
- State is saved in the browser's `localStorage`; a Serwist service worker caches assets for
  **offline play**.
