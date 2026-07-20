---
id: settings-sidebar
title: Profile settings use a sidebar with the child’s avatar
status: accepted
date: 2026-07-20
tags: [product, ux]
related: [per-profile-curriculum, parent-tuned-difficulty-bands, design-system]
---

# Profile settings use a sidebar with the child’s avatar

## Problem

Profile editing was one long scrolling card. Identity, learning games, break minigames,
and advanced XP competed for attention; curriculum tuning would have made it worse.

## Decision

The profile editor is a two-pane RTL settings shell: a sidebar headed by the child’s
avatar/photo and name, with nav for **פרופיל / משחקי למידה / משחקונים / מתקדם**, and
a main pane for the active section. Learning games and difficulty bands share one
category: enable a game, then press its row to expand curriculum controls below.
Lives in [`web/components/screens/ProfileEditor.tsx`](../../web/components/screens/ProfileEditor.tsx)
with styles in [`web/app/globals.css`](../../web/app/globals.css).

## User impact

Parents (and older kids) see whose settings they are editing at a glance and jump
between sections without losing context. Difficulty tuning is attached to each
game instead of a separate nav item.

## Trade-offs

- Slightly more chrome than a single card; on narrow screens the sidebar becomes a
  horizontal section strip.
- Still opened from the profile pencil (not a global app-settings hub).

## Signals to watch

Parents can’t find curriculum controls; confusion about which child’s settings are open;
mobile nav feeling cramped.
