---
id: number-sense-ladder
title: A numeral is taught as the name of a quantity the child has already seen
status: accepted
date: 2026-08-01
tags: [educational, numbers, math]
theory: Cardinality and the Concrete-Representational-Abstract progression (Bruner); subitizing (Clements & Sarama)
related: [sound-before-symbol, faded-scaffold-ladder, track-skill-ladders, multiplication-as-equal-groups, target-age-range]
---

# A numeral is taught as the name of a quantity the child has already seen

## Decision

The `nums` game never introduces the shape `5` cold. Every numeral arrives attached to an
amount the child just counted, and the ladder walks both directions between amount and
symbol before it asks for the symbol alone. This is `sound-before-symbol` applied to
counting: quantity is the sound, the numeral is the letter.

Lives in `web/lib/providers/nums.ts` with its stage table and bands in `web/data/nums.ts`.

## Why it helps the child

A three-year-old who cannot pick out `5` usually can count five things. The gap is not
counting, it is that the glyph has never been tied to the amount. Teaching the glyph on its
own produces a child who recites "one two three four five" and still cannot read a `5`.
The same gap reappears at `100`: it is not a bigger amount to count, it is a *shape made of
place value*, so it gets its own rung rather than being treated as "a number up to 100".

## How it works

Five stages, each selectable per band from settings:

1. **How many** — match a group to a group. No numerals appear at all.
2. **Quantity to numeral** — count the apples, pick `5`. This is the rung that answers
   "my kid doesn't know what 5 looks like".
3. **Numeral to quantity** — the reverse trip, so the link is not one-way recognition.
4. **Name and order** — hear "חמש" and pick it, or say which number comes after 7.
5. **Tens and hundreds** — amounts above ten are drawn as bundles of ten plus loose ones,
   so `34` reads as three tens and four. Half these questions are the landmarks
   themselves: `100` is chosen against `10` and `1000`, never against `99`, because
   telling those apart is a question about shape and place value, not about counting.

Distractors are near numbers so the child must count rather than eyeball, and at stage 5
the swapped-digit twin (34 against 43) makes place value the deciding factor.

The spoken prompt never says the answer while the child is counting — stages 2 and 5 ask
only "כמה יש?".

## Watch-outs

- Speaking the number on a counting stage turns the whole thing into a listening test.
  The rule is: if the child is counting, the prompt does not name the number.
- Drawing more than ten loose items makes counting impossible on a phone; above ten the
  provider must bundle into tens (`drawAmount`).
- Raising `maxNum` is not the same as advancing a stage. A child stuck at stage 2 needs
  more stage 2, not bigger numbers.
