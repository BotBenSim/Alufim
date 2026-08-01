---
id: number-sense-ladder
title: A numeral is on screen from the first question — the child learns what numbers look like
status: accepted
date: 2026-08-01
tags: [educational, numbers, math]
theory: Numeral recognition before cardinality mapping; Concrete-Representational-Abstract (Bruner)
related: [faded-scaffold-ladder, track-skill-ladders, multiplication-as-equal-groups, target-age-range]
---

# A numeral is on screen from the first question — the child learns what numbers look like

## Decision

The `nums` game opens on digit recognition: hear "חמש", press `5`. Matching two piles of
emoji with no numeral on screen was removed — it does not teach what a number looks like,
which is the gap a three-year-old who "doesn't know how 5 looks" actually has.

Quantity arrives next, once the shape is already being practised. Lives in
`web/lib/providers/nums.ts` with bands in `web/data/nums.ts`.

## Why it helps the child

A child who cannot pick out `5` needs the glyph in front of them and a spoken name to attach
to it. Asking them to match two groups of five apples tests matching, not numeral knowledge.
`100` is still taught as a shape (against `10` and `1000`), not as a bigger pile to count.

## How it works

1. **Recognise the numeral** — hear the name, pick the digit among near neighbours.
2. **Quantity → numeral** — count the apples, pick `5`.
3. **Numeral → quantity** — see `5`, pick the matching group.
4. **Which is bigger** — three piles or three numerals; pick the largest (magnitude).
5. **Tens and hundreds** — bundles of ten plus loose ones; landmarks `10` / `100` by shape.

Counting stages never speak the answer ("כמה יש?" only). Stage 5 distractors include the
swapped twin (34 vs 43).

## Watch-outs

- Speaking the number on a counting stage turns it into a listening test.
- Drawing more than ten loose items is unreadable; above ten, bundle into tens.
- Raising `maxNum` is not the same as advancing a stage.
