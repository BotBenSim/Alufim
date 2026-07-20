---
id: right-sized-difficulty
title: Right-sized difficulty with rising rewards
status: accepted
date: 2026-07-20
tags: [educational, difficulty, mastery]
theory: Zone of Proximal Development (Vygotsky) + flow
related: [always-gain-xp, celebrate-progress, parent-tuned-difficulty-bands]
---

# Right-sized difficulty with rising rewards

## Decision

Offer three difficulty levels (easy / medium / hard) and let the XP reward grow as the child
progresses through a run and answers cleanly. Reward more for first-try correctness than for
post-mistake correctness — but always at least 1. Logic in
[`web/lib/xp.ts`](../../web/lib/xp.ts).

## Why it helps the child

Learning is strongest when the challenge sits just beyond what the child can already do (the
"zone of proximal development" / flow sweet spot). Difficulty levels let each child land in
that band, and mastery-weighted rewards nudge toward real fluency, not lucky guesses.

## How it works

`xpTier` raises the reward row as `stepIndex` climbs (`XP_BATCH_SIZE = 8`), and each row
grants more for fewer mistakes. Difficulty selects which `XP_TABLE` band is used.

## Watch-outs

- A single fixed difficulty misses most children's sweet spot (too easy = bored, too hard =
  frustrated).
- If retries paid the same as first-try, the signal that rewards mastery disappears.
