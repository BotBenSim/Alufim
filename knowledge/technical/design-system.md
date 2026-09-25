---
id: design-system
title: Design system - tokens + primitives
status: accepted
date: 2026-06-22
updated: 2026-09-25
tags: [ui, design-system, tailwind, architecture]
supersedes: []
related: [nextjs-migration]
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

## Update 2026-09-25: moving to the shared design system

The workspace now has one shared shadcn design system for every game: the `@kids` registry in
`Development/design-system`, with a neutral base and a theme per game. Its segmented control
was ported from this repo, and a draft `theme-alufim` is in the registry. Pitputim runs fully
on it. Alufim follows after a Tailwind 4 upgrade, replacing these primitives with registry
items plus `theme-alufim`. Pin the release that includes `theme-alufim`, and fix the draft theme's contrast first: primary, secondary, success and info fail WCAG against their foreground text (about 2.6–2.8:1). Until then this file stands, and new reusable pieces go into the
registry first. Decision:
[Shared design system](/knowledge/decisions/shared-design-system.md).

