---
id: reasoning-and-comparison-games
title: Re-home categorisation after מצא את (comparison now in מספרים)
status: proposed
date: 2026-08-01
tags: [backlog, educational, reasoning, numbers]
theory: Categorisation and semantic networks (Rosch, prototype theory); magnitude comparison as number sense (Siegler)
scope: S
source: agent
related: [game-variety, number-sense-ladder, target-age-range]
---

# Re-home the skill that died with מצא את — categorisation

## Problem / opportunity

מצא את was removed because it shuffled seven unrelated question types inside one card, so no
skill in it could be practised deliberately. Magnitude comparison has since landed as stage 4
of מספרים ([number-sense-ladder](../knowledge/educational/number-sense-ladder.md)). What is
still missing:

- **Categorisation and world knowledge** — "מי יכול לעוף?", "מצאו את הירק", "מה נוסע בכביש?".
  Eight sets of yes/no exemplars. This was the app's only non-literacy, non-arithmetic
  thinking content, and the only place a three-year-old met plain vocabulary.

The content itself is recoverable from git history (`FIND_REASON` and the `qLo`/`qHi`/
`bignum` band params in `web/data/find.ts` and `web/lib/providers/find.ts`, removed on the
branch that deleted the game).

## Proposed feature

A **thinking/vocabulary game** built from the categorisation sets, with its own ladder: pick
the member of a named category, then the odd one out, then name the category from three
members. The colour/shape/animal packs (`FIND_PACKS`, still live and used by the mission beat)
are the natural stage 1.

## Grounding

Categorisation rests on prototype theory — a child sorts by best example before they sort by
rule — and is the vocabulary work that the reading ladders assume but never teach. Respect
[game-variety](../knowledge/educational/game-variety.md): one game, one domain, deliberately
practisable.

## Rough scope

A new provider and data file behind the `StageProvider` contract, so it renders and speaks
through the shared branch.

## Watch-outs

- The category sets are small (eight). Without more, a child exhausts them in two runs and the
  no-repeat logic starts recycling.
