---
id: modern-visual-style
title: Soft, rounded "candy" visual style with subject-coloured game tiles
status: accepted
date: 2026-09-24
tags: [product, ux, visual]
related: [player-gender-accent, target-age-range]
---

# Soft, rounded "candy" visual style

## Problem

The app read as dated: clip-art trees, rainbow and sun behind everything, a WordArt-style
outlined logo, the system font, OS emoji as game icons, and flat white boxes. With nine games
the home grid was also a wall of look-alike cards.

## Decision

- **Font:** Fredoka (rounded, has Hebrew) via `next/font` in [`app/layout.tsx`](../../web/app/layout.tsx).
- **Scene:** pastel sky, soft sun, a few faint clouds and layered SVG hills —
  [`BackgroundScene`](../../web/components/scene/BackgroundScene.tsx). No trees or rainbow.
- **Surfaces:** `.glass` (frosted white) for chips, headers and group panels; `.shadow-soft`
  for cards; both in [`globals.css`](../../web/app/globals.css).
- **Buttons:** chunky 3D "candy" fills (gradient + inner highlight + darker bottom edge) in
  [`KidButton`](../../web/design-system/components/KidButton.tsx). Answers are rounded
  squares; the boy/girl accent is unchanged.
- **Game tiles:** each subject owns a colour (`GAME_GROUPS[].color` in
  [`data/games.ts`](../../web/data/games.ts)) — math orange, reading purple, music pink — and
  each game shows a bold `glyph` (`123`, `+`, `אב`, `♪`) instead of an OS emoji.

## User impact

A child sees fewer competing pictures and can find a game by colour before they can read its
name. Parents get an app that looks current.

## Trade-offs

Glyphs are more abstract than emoji for pre-readers; the subject colour carries that load.
Settings, minigames, the evolve screen and overlays only inherited the font and panel style
so far.

## Signals to watch

Children hunting for a game they know (colour/glyph not recognisable), or the glyphs being
misread (`Aa` vs `ABC`).
