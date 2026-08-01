---
id: reasoning-and-comparison-games
title: Re-home the two skills that died with מצא את — categorisation and comparison
status: proposed
date: 2026-08-01
tags: [backlog, educational, reasoning, numbers]
theory: Categorisation and semantic networks (Rosch, prototype theory); magnitude comparison as number sense (Siegler)
scope: S
source: agent
related: [game-variety, number-sense-ladder, target-age-range]
---

# Re-home the two skills that died with מצא את — categorisation and comparison

## Problem / opportunity

מצא את was removed because it shuffled seven unrelated question types inside one card, so no
skill in it could be practised deliberately. Five of the seven were already covered better
elsewhere. Two were not, and left with it:

- **Categorisation and world knowledge** — "מי יכול לעוף?", "מצאו את הירק", "מה נוסע בכביש?".
  Eight sets of yes/no exemplars. This was the app's only non-literacy, non-arithmetic
  thinking content, and the only place a three-year-old met plain vocabulary.
- **Magnitude comparison** — which group has more, which numeral is bigger. Comparing
  quantities is a core piece of number sense, and the numbers ladder has no rung for it: it
  matches, counts, names and reads numerals, but never asks which is larger.

The content itself is recoverable from git history (`FIND_REASON` and the `qLo`/`qHi`/
`bignum` band params in `web/data/find.ts` and `web/lib/providers/find.ts`, removed on the
branch that deleted the game).

## Proposed feature

Two small, separate additions rather than one grab-bag:

1. **A comparison rung in מספרים.** Extend the numbers ladder rather than making a new game.
   Natural placement is between the current stage 3 and stage 4: compare two drawn amounts
   first (more/fewer, no numerals), then two numerals. Above ten this doubles as place-value
   practice, since 34 against 43 can only be settled by reading the tens.
2. **A thinking/vocabulary game** built from the categorisation sets, with its own ladder:
   pick the member of a named category, then the odd one out, then name the category from
   three members. The colour/shape/animal packs (`FIND_PACKS`, still live and used by the
   mission beat) are the natural stage 1.

## Grounding

Comparison belongs to [number-sense-ladder](../knowledge/educational/number-sense-ladder.md):
knowing that 7 is more than 5 is a different skill from reading either numeral, and it is the
one that predicts later arithmetic. Categorisation rests on prototype theory — a child sorts
by best example before they sort by rule — and is the vocabulary work that the reading ladders
assume but never teach. Both must respect
[game-variety](../knowledge/educational/game-variety.md): one game, one domain, deliberately
practisable.

## Rough scope

Comparison: a stage in `web/lib/providers/nums.ts` plus a band in `web/data/nums.ts`, using
the existing `answerGroup` and `answerFind` variants — no new UI. The thinking game: a new
provider and data file behind the `StageProvider` contract, so it renders and speaks through
the shared branch.

## Watch-outs

- Adding a stage renumbers the numbers ladder. Existing saves store band arrays, not stage
  numbers, so `alufim_state_v2` survives — but a parent who pinned "stage 4" in settings would
  silently land on a different rung. Prefer appending, or migrate the pinned value.
- The category sets are small (eight). Without more, a child exhausts them in two runs and the
  no-repeat logic starts recycling.
- Comparison questions are guessable at 50% with two options. Use three amounts, or ask for
  the largest of three.
