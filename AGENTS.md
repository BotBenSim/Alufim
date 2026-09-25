# AGENTS.md

Tool-agnostic entry point for any agent or contributor (Cursor, Claude, Codex, or a human).

## What this repo is

Alufim is a Pokémon-style educational math/reading game for kids. The live application is a
Next.js + React + TypeScript app in [`web/`](web/) and deploys as a static export to GitHub
Pages under the `/Alufim/` base path.

## Read this before making architectural changes

The project's knowledge base ("brain") lives in [`knowledge/`](knowledge/). Start at
[`knowledge/index.md`](knowledge/index.md) — it lists the categories and links every
recorded decision. Read the relevant file before changing that area. It is split into three
categories, each with its own `index.md` and `TEMPLATE.md`:

- [`knowledge/technical/`](knowledge/technical/index.md) — engineering decisions (how we built it).
- [`knowledge/educational/`](knowledge/educational/index.md) — the learning theory behind each
  learning-facing feature (why it helps kids learn).
- [`knowledge/product/`](knowledge/product/index.md) — UX/product decisions (why the experience
  is shaped this way).

## Golden rule

Never break the persisted `localStorage` key `alufim_state_v2` or its JSON shape. Returning
players carry their save data there. See
[`knowledge/technical/state-persistence.md`](knowledge/technical/state-persistence.md).

## When you make a significant decision

1. Pick the category and copy its template (`knowledge/<category>/TEMPLATE.md`) to
   `knowledge/<category>/<kebab-id>.md`, then fill in that category's sections. A single
   feature may warrant files in more than one category, cross-linked via `related`.
2. Add a row to that category's `index.md`.
3. Add a dated one-line entry to the top of [`knowledge/log.md`](knowledge/log.md).

Rule: every learning-facing feature must be backed by a named educational theory in
`knowledge/educational/`.

## Backlog and playbooks

New educational features flow through a git-based loop: **propose -> curate -> implement**.

- [`backlog/`](backlog/) holds educational feature proposals as OKF files, each with a
  `status` in its frontmatter. See [`backlog/index.md`](backlog/index.md).
- [`playbooks/`](playbooks/) are the tool-agnostic, single-source-of-truth prompts that drive
  the loop: `propose-educational-features`, `curate-backlog`, `implement-proposal`, and the
  always-on `knowledge-brain` rule.
- Status shares one lifecycle across `knowledge/` and `backlog/`:
  `proposed -> approved -> in-progress -> accepted` (plus `rejected`, `superseded`). An
  approved proposal graduates into a `knowledge/educational/` decision when it ships.
- All vendor-specific files (Cursor/Claude rules, slash commands, and skills) are **generated**
  from `playbooks/` by `make agents` and are gitignored. Edit the playbook, never the
  generated file. Run `make agents` (optionally `VENDORS=cursor`) to (re)build them.

## Shared design system (planned move)

Alufim's own [`web/design-system/`](web/design-system/) is being replaced by the workspace's
shared design system: the `@kids` shadcn registry in `Development/design-system`, with a
neutral base and one theme per game. Pitputim already runs on it; Alufim moves in its own PR
after upgrading to Tailwind 4. A draft `theme-alufim` (sky, orange, sunshine) is already in
the registry. See the workspace decision
[Shared design system](/knowledge/decisions/shared-design-system.md).

Until then:
- **A new UI piece that another game could use** (a button style, a control, a game piece) goes
  into the registry first, then gets installed here. Don't add it only to
  `web/design-system/`.
- **When moving:** pin the design-system release that includes `theme-alufim` (games install
  from a release tag, never the dev server). Fix contrast first: in the draft theme, primary,
  secondary, success and info fail WCAG against their foreground text (about 2.6–2.8:1; the
  registry's `/tokens` docs page shows it).
- **Raw colours** belong only in the theme (`tokens.ts` today, `theme-alufim` after the move),
  not in components.
- Commit subjects and PR titles follow
  [Conventional Commits](/knowledge/decisions/conventional-commits.md) (already the habit here).

## Working in the app

- App code and commands live in `web/` (`npm run dev`, `npm run build`, `npm test`).
- Don't run `npm run build` while the dev server is running (it can corrupt `.next`).
- Keep game-affecting logic in pure modules under `web/lib/` with Vitest coverage.
