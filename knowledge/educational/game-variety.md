---
id: game-variety
title: Varied games over one drill
status: accepted
date: 2026-07-20
tags: [educational, variety, transfer]
theory: Retrieval practice + interleaving + discrimination learning
related: [audio-first, right-sized-difficulty, play-beat-interludes, track-skill-ladders]
---

# Varied games over one drill

## Decision

Offer several short game types instead of a single drill: מספרים (numbers), חיבור, חיסור, כפל
and חילוק (arithmetic), קריאה בעברית and קריאה באנגלית (reading ladders), אנגלית (English
words) and מוזיקה (ear training). All feed the same animal's XP, and the child can switch
between them freely. Defined in [`web/data/games.ts`](../../web/data/games.ts).

Each game teaches one domain deliberately. A grab-bag that shuffles unrelated question types
inside one card is explicitly not the shape we want: it makes every skill un-practisable,
which is why מצא את was removed rather than extended (see [log](../log.md)).

## Why it helps the child

- Each game is a burst of active recall (retrieval practice), which builds memory better than
  passive review.
- Mixing domains (numbers, words, sound) keeps attention fresh and supports transfer — but the
  mixing happens *between* games the child chooses, not randomly inside one.
- The reading and English games pair targets with image and audio, making them accessible to
  pre-readers (see [audio-first](audio-first.md)).

## How it works

`GAMES` defines the types, each with its own question provider under `web/lib/providers/`.
Because every game is just an XP source for the chosen animal, variety costs the child
nothing — they can hop games without losing progress.

## Watch-outs

- Distractor answers must be plausible enough to require real recall/discrimination, not
  guessing.
- Number ranges and targets should track difficulty so each game stays in the child's range
  (see [right-sized-difficulty](right-sized-difficulty.md)).
