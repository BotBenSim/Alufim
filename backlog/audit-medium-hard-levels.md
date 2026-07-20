---
id: audit-medium-hard-levels
title: Playtest and fix medium/hard levels across all learning games
status: proposed
date: 2026-07-20
tags: [backlog, educational, difficulty, qa]
theory: Zone of Proximal Development + flow (right-sized difficulty)
scope: M
source: human
related:
  - right-sized-difficulty
  - parent-tuned-difficulty-bands
  - per-profile-curriculum
  - math-visual-scaffold
---

# Playtest and fix medium/hard levels across all learning games

## Problem / opportunity

Most hands-on play and tuning so far has focused on **easy**. Medium and hard bands exist
in the factory curriculum (add, sub, find, eng) and parents can select them, but they have
not been systematically played as a child would. Gaps may include: jumps that are too
harsh, bands that feel same-y as easy, bad option ranges, eng vocab length that is
unreadable, find kinds that appear too early/late, or visual modes that skip the CRA
scaffold.

Without a deliberate pass, “בינוני / קשה” risks being a label that does not actually
right-size challenge.

## Proposed feature

A focused **curriculum playtest + fix pass** for every learning game at medium and hard:

1. Play each game (add, sub, find, eng) on medium and hard for several blocks of steps.
2. Note where questions feel too easy, too hard, confusing, or broken (speech, options,
   visuals, pacing).
3. Adjust factory bands / params / visuals in `GAME_DIFFICULTY` (and any provider quirks)
   so medium is a clear step up from easy, and hard is a clear step up from medium — still
   always-win, no punishment.
4. Spot-check that per-profile curriculum customize UI still makes sense after factory
   tweaks (reset-to-default path).

Deliverable is better medium/hard defaults, not a new game mode.

## Grounding

[`right-sized-difficulty`](../knowledge/educational/right-sized-difficulty.md) and
[`parent-tuned-difficulty-bands`](../knowledge/educational/parent-tuned-difficulty-bands.md)
assume levels and bands place the child in a workable ZPD. That only holds if medium/hard
were actually exercised. Related: math visual scaffold on add/sub bands.

## Rough scope

- Play: in-app, all four games × medium + hard (use a throwaway profile or settings level).
- Likely edits: [`web/lib/difficulty.ts`](../web/lib/difficulty.ts) factory bands;
  possibly provider generators under `web/lib/providers/` if a level exposes a bug;
  light Vitest updates if band fixtures change.
- No new UI required unless a band field is missing for a game.

## Watch-outs

- Do **not** rewrite existing profiles’ customized curricula — factory changes affect new
  profiles and “איפוס לברירת מחדל” only ([per-profile-curriculum](../knowledge/technical/per-profile-curriculum.md)).
- Keep always-gain-XP / no fail states; harder ≠ punitive timers or lives.
- Avoid making hard unplayable for the younger end of the audience; parent level pick is
  the gate.
