---
id: start-from-first-form
title: Start animals at the first living form — not as an egg
status: proposed
date: 2026-07-20
tags: [backlog, educational, characters, nurture]
theory: Self-Determination Theory (relatedness) — choose and nurture
scope: S
source: agent
related:
  - choose-and-nurture-animal
  - celebrate-progress
  - play-beat-minigame-host
  - minigame-engine-tap-collect
  - minigame-engine-catch
  - minigame-engine-path-dash
  - minigame-engine-timing-bounce
  - minigame-engine-meter-burst
  - minigame-engine-slice-swipe
---

# Start animals at the first living form — not as an egg

## Problem / opportunity

Today `forms[0]` is an egg and `totalXp: 0` maps there via `formForXp`. Care and play-beat
micro-games land better when the child already sees *their* baby animal. The egg stage
delays relatedness and makes early sessions feel like waiting for the real friend to appear.

## Proposed feature

Drop the egg from the form ladder. XP `0` shows the first living form (baby → later forms).
Prefer removing or demoting egg art in `web/data/characters.ts` so existing saves with
`totalXp: 0` and `form: 0` keep working **without** new `alufim_state_v2` fields — only what
those values *mean* for art changes.

## Grounding

- Deepens [choose-and-nurture-animal](../knowledge/educational/choose-and-nurture-animal.md):
  autonomy and relatedness start on a visible creature, not a shell.
- Evolution celebrations in [celebrate-progress](../knowledge/educational/celebrate-progress.md)
  still mark real growth between living forms.

## Rough scope

- Adjust `CHARACTERS[].forms` (and any egg fallbacks) so index `0` is the baby animal.
- Confirm `formForXp`, evolve overlays, collection unlock art, and profile editor form labels
  still make sense with one fewer “placeholder” stage (or the same count with egg removed).
- No new persisted keys; document the visual change for returning players.

## Watch-outs

- Returning players at 0 XP will suddenly see a baby instead of an egg — intentional; mention
  in product OKF.
- Do not break `alufim_state_v2` shape; do not reset XP.
- Keep evolution milestones feeling earned; do not collapse all forms into one.

## OKF updates on ship

When this graduates to `accepted`:

1. New [`knowledge/educational/start-from-first-form.md`](../knowledge/educational/TEMPLATE.md)
   — Decision / Why it helps / How it works / Watch-outs; theory SDT relatedness.
2. New `knowledge/product/start-from-first-form.md` (or equivalent) — egg removed from
   presentation; returning-player note.
3. Rows in `knowledge/educational/index.md` and `knowledge/product/index.md`.
4. Dated line atop [`knowledge/log.md`](../knowledge/log.md).
5. Touch [celebrate-progress](../knowledge/educational/celebrate-progress.md) only if
   threshold/copy wording must change with the new ladder.
