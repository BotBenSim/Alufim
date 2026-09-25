---
id: design-system
title: Design system - tokens + primitives
status: accepted
date: 2026-06-22
updated: 2026-09-25
tags: [ui, design-system, tailwind, shadcn, architecture]
supersedes: []
related: [nextjs-migration, modern-visual-style, player-gender-accent]
---

# Design system - tokens + primitives

## Context

The vanilla game repeated colors, radii, shadows, and button/card styles inline. As screens
multiplied (profiles, four games, evolution preview, about), inconsistency and copy-paste
styling became a risk.

## Decision

Build a small design system under [`web/design-system/`](../../web/design-system): shared
tokens plus reusable primitives (e.g. `Card`, `Panel`, `KidButton`, `XpBar`, `PillControl`,
`SettingsNumberField`), styled with Tailwind CSS. Screens compose these primitives instead
of ad-hoc markup.

Layout chrome:
- `Screen` — full-viewport scroll host; padding lives on an inner column (never `vw` widths).
- `Panel` — shared elevated white surface. `surface` for content (About); `shell` for
  multi-pane frames (settings). Always `width: 100%` of the Screen column.

Controls:
- `PillControl` / `LevelControl` — equal-width segmented pills.
- `SettingsNumberField` / `SettingsButton` — settings form controls; `.btnRow` siblings
  share equal width when stretched, or stay compact when not.

## Why

- One place to change the look; kids' UI stays consistent across screens.
- Primitives encode the playful visual language (big rounded cards, soft shadows) once.
- Tailwind keeps styling colocated and fast to iterate without a separate CSS sprawl.

## Alternatives rejected

- **Inline styles everywhere** — the original problem; drifts out of sync fast.
- **A heavy component library (MUI, etc.)** — wrong aesthetic for a kids' game and large.
- **CSS Modules per component** — workable, but more files and less shared vocabulary than
  a token + primitive set.

## Consequences

- New UI should reach for existing primitives before writing bespoke markup.
- Layout-specific composition (e.g. `GamePlayPanel` aligning XP bar, question, replay
  button) lives in feature components that consume the primitives.
- `as const` token/character definitions require `readonly` types in
  [`web/lib/types.ts`](../../web/lib/types.ts).

## Update 2026-09-25: on the shared `@kids` design system

Alufim now takes its theme and base primitives from the workspace's shared design system: the
`@kids` shadcn registry in `Development/design-system` (decision:
[Shared design system](/knowledge/decisions/shared-design-system.md)).

- **Tailwind 4.** The old `tailwind.config.ts` moved into `@theme` in
  [`globals.css`](../../web/app/globals.css); PostCSS uses `@tailwindcss/postcss`.
- **Pinned release.** [`components.json`](../../web/components.json) points `@kids` at tag
  `v0.3.0`. Install or upgrade with
  `GITHUB_TOKEN=$(gh auth token) npx shadcn@4.21.0 add @kids/<name> --overwrite` from `web/`.
  To upgrade, read the registry's `CHANGELOG.md`, move the tag, re-add every item below, and
  review the diff.
- **Installed items:** `theme-alufim` (writes the token `:root` and `@theme inline` blocks at
  the end of `globals.css`), and `button`, `badge`, `label`, `segmented-control` in
  [`components/ui/`](../../web/components/ui). `dialog`, `slider` and `switch` are still stock
  shadcn copies.
- **Local primitives stay, as Alufim game pieces.** [`web/design-system/`](../../web/design-system)
  keeps what is specific to this game (`KidButton`, picker `Card`, `Panel`, `XpBar`,
  `PillControl`, `MinigameShell`…). They are built on registry items where one fits
  (`KidButton`'s `play` is the `@kids` `play` button; `Badge` wraps `@kids/badge`) and use
  theme tokens only. The unused local `SegmentedControl` was removed; use
  `@/components/ui/segmented-control`.
- **Colours.** A raw colour lives only in a theme block of `globals.css`: the registry's
  `theme-alufim` tokens, or the Alufim-only `--boy` / `--girl` accents (see
  [player-gender-accent](../product/player-gender-accent.md)). Tints, edges and glows are
  `color-mix()` of a token, as in the registry. Illustration keeps its own colours: the sky
  scene, minigame art, the evolve glow, per-game tile colours in `data/games.ts`, and
  `tokens.confettiColors`.
- **Radius gotcha.** The theme sets `--radius: 1.75rem`, and Tailwind's `rounded-sm` … `rounded-4xl`
  scale from it. Illustration that needs an exact shape uses a pixel radius
  (`rounded-[10px]`), as the minigame maze and slingshot now do.
- **Colour changes from the move.** `theme-alufim` was darkened so white text passes WCAG AA
  large (≥3:1): primary `#f2582a`, secondary/info `#3a86f0`, success `#2e9e5b`; girl accent
  `#e8457f`. Settings text uses `--foreground` instead of several near-navy shades.

New reusable UI (anything another game could use) goes into the registry first, then gets
installed here. A fix to a registry item is made in the registry, never only in this copy.
