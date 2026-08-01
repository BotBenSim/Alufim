---
id: curriculum-tracks
title: Domains are tracks of many small games, not one game card each
status: proposed
date: 2026-08-01
tags: [architecture, curriculum, games, extensibility]
supersedes: []
related: [game-provider-pattern, per-profile-curriculum, sound-before-symbol, faded-scaffold-ladder, hebrew-reading-sequence, target-age-range]
---

# Domains are tracks of many small games, not one game card each

## Context

Today one `GameId` = one card = one provider = one mechanic (add, sub, eng, find). Difficulty is a
parent-set `level` plus three in-run `bands`, so a card holds at most ~9 slots of progression.

That fits a drill. It does not fit a **domain** — Hebrew reading, English reading, or music — where
the goal is "by the end, the child can read", and the path is a long ordered sequence of distinct
skills, each needing its *own mechanic*: hear the sound, pick the letter, build the syllable, trace
it, read the word. Cramming that into one card forces either a truncated curriculum or one card that
silently changes into five different games.

## Decision (proposed)

Add a **track** layer above games:

- A **track** is a domain (`hebrew`, `english`, `music`) with an ordered list of **skills**.
- A **skill** is one teachable step (e.g. *letter sound*, *letter shape*, *syllable*, *echo phrase*,
  *staff note*), with a target mechanic and its own bands.
- A **mechanic** is what exists today — a provider plus an answer surface. Mechanics are reused
  across skills and across tracks: pick-one-of-four serves letters, notes, and words alike.

Home shows tracks. Inside a track the child sees where they are and what is next. Skills unlock
cumulatively, so practice only ever uses atoms already taught
([sound-before-symbol](../educational/sound-before-symbol.md)).

## The mechanic library

The payoff is that all three tracks are covered by a handful of shared mechanics. Mapping the seven
stages in [track-skill-ladders](../educational/track-skill-ladders.md) onto UI:

| Mechanic | Serves stages | Status |
| --- | --- | --- |
| pick-one-of-N (prompt → options) | 1, 2, 3, 5 | exists (`QuestionView`) |
| echo-sequence (reproduce an ordered sequence on an input surface) | 4, 7 | new — surfaces: keyboard, letter tiles, drum |
| build (drag pieces into a unit) | 4, 6 | new — syllables, words, chord stacks |
| trace (draw along a guided path) | 6 | new — Hebrew and English letters only |
| free-play (sandbox, no scoring) | — | new, trivial — play-beat toy |

Three new mechanics unlock all three domains. After that, a new skill is normally a data row: an
atom list, a band, and which mechanic asks it.

## Why

- The three planned domains share one ladder shape, so they should share one engine
  ([sound-before-symbol](../educational/sound-before-symbol.md)).
- It separates *what* is taught (skill list, data) from *how* it is asked (mechanic, code), so a new
  skill is usually a data row, not a new game.
- It gives the missing sense of destination — a child and a parent can see the path to reading.
- It is the only structure that spans 3–8 ([target-age-range](../product/target-age-range.md))
  without either boring the top or losing the bottom.

## Alternatives rejected

- **One card per domain** (status quo): caps the curriculum at 9 slots and hides five mechanics
  behind one label.
- **One card per skill**: no sprawl limit; home becomes 40 cards with no order and no destination.

## Consequences

- New persisted state: per-profile, per-track skill progress. Additive only, defaulted on read —
  the golden rule still holds ([state-persistence](state-persistence.md)).
- `GameId` stops being the unit of navigation; existing four games become a `math`/`mixed` track or
  stay as free-play cards. Migration must keep current saves working untouched.
- Large. Suggested order, cheapest-first and lowest-regret: **(1)** track model wrapping today's four
  games, **(2)** the `pick-one` stages of all three tracks (no new UI at all — this alone covers
  stages 1–3 in Hebrew, English and music), **(3)** echo-sequence, which unlocks music stage 4 and
  the keyboard, **(4)** build and trace, which unlock stage 6 and the writing game.
- Sequencing this way means the first two steps ship a real slice of *all three* domains before any
  new answer surface exists, so the expensive UI decisions stay open as long as possible.
