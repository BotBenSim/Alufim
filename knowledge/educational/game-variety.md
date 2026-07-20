---
id: game-variety
title: Varied games over one drill
status: accepted
date: 2026-07-20
tags: [educational, variety, transfer]
theory: Retrieval practice + interleaving + discrimination learning
related: [audio-first, right-sized-difficulty, play-beat-interludes]
---

# Varied games over one drill

## Decision

Offer four short game types instead of a single drill: חיבור (addition), חיסור (subtraction),
אנגלית (English words), and מצא את... (find letters / quantities / sounds). All feed the same
animal's XP, and the child can switch between them freely. Defined in
[`web/data/games.ts`](../../web/data/games.ts).

## Why it helps the child

- Each game is a burst of active recall (retrieval practice), which builds memory better than
  passive review.
- Mixing domains (numbers, words, perception) keeps attention fresh and supports transfer.
- The English and find games pair words/targets with image and audio, making them accessible
  to pre-readers (see [audio-first](audio-first.md)).

## How it works

`GAMES` defines the four types, each with its own question provider under `web/lib/`. Because
every game is just an XP source for the chosen animal, variety costs the child nothing — they
can hop games without losing progress.

## Watch-outs

- Distractor answers must be plausible enough to require real recall/discrimination, not
  guessing.
- Number ranges and targets should track difficulty so each game stays in the child's range
  (see [right-sized-difficulty](right-sized-difficulty.md)).
