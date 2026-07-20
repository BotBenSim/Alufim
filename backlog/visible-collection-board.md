---
id: visible-collection-board
title: Visible collection board and near "next friend" goal
status: proposed
date: 2026-07-20
tags: [backlog, educational, engagement, collection]
theory: Curiosity gap (Zeigarnik) + goal-gradient + Self-Determination Theory (relatedness)
scope: M
source: agent
related:
  - celebrate-progress
  - choose-and-nurture-animal
  - always-gain-xp
  - varied-surprising-feed-beat
  - positive-bond-affection
  - session-quest-surprise-chest
---

# Visible collection board and near "next friend" goal

## Problem / opportunity

The long-term pull of the game is growing an animal and eventually unlocking the next one,
but that goal is almost invisible during play. Unlock is a short overlay; there is no lasting
gallery of friends met / still mystery. Kids who tire after a few turns lack a concrete
"almost there — one more friend" near goal. Celebrating evolution alone
([celebrate-progress](../knowledge/educational/celebrate-progress.md)) is strong for form
changes, but weak for the collection story.

## Proposed feature

- A read-only **collection board**: all animals shown; unlocked ones (key present in
  `profile.characters`) with current form art and progress; locked ones as silhouettes /
  mystery with a gentle hint ("grow your friend to meet the next one").
- A small **"next friend"** chip on home and/or during a run: silhouette + progress toward
  the unlock that grows out of nurturing the active animal.
- Entry from home and after the existing "new animal unlocked" moment so the win lands in a
  place kids can revisit.

Prefer deriving everything from existing progress — no new save fields required.

## Grounding

- Goal-gradient and frequent visible wins extend
  [celebrate-progress](../knowledge/educational/celebrate-progress.md).
- Collection / curiosity gap ("who's next?") fuels return play without daily-login FOMO.
- Reinforces [choose-and-nurture-animal](../knowledge/educational/choose-and-nurture-animal.md):
  autonomy and relatedness stay on *my* animal; unlocking expands the set of friends to care
  for, not a grind wall.

## Rough scope

- New `CollectionScreen` (or equivalent gallery) under `web/components/`.
- Pure selector in `web/lib/` (e.g. `nextUnlockProgress`) with Vitest coverage.
- Hook from profiles/home UI and after `_unlockNextCharacter` / collection overlay.
- Unlock status already implied by keys in `profile.characters` — keep `alufim_state_v2`
  shape unchanged.

## Watch-outs

- No locking animals behind payment or oppressive grind.
- Don't share or reset XP across animals (breaks attachment).
- Mystery silhouettes should spark curiosity, not anxiety ("you're missing out today").
- Optional later balance: first unlock may feel far at full final-form XP — treat threshold
  tuning as a separate deliberate change, not required for the board itself.
