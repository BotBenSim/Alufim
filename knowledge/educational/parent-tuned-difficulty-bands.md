---
id: parent-tuned-difficulty-bands
title: Parents can right-size difficulty bands per child
status: accepted
date: 2026-07-20
tags: [educational]
theory: Zone of Proximal Development (Vygotsky) + scaffolding
related: [right-sized-difficulty, per-profile-curriculum, settings-sidebar]
---

# Parents can right-size difficulty bands per child

## Decision

For each player and learning game, parents can adjust how long the child stays in a
difficulty band (`stepsPerBlock`) and the numeric ranges of those bands (e.g. addition
sums), without changing code. Defaults are copied into the profile; edits stay
per-child. See [`web/components/screens/ProfileEditor.tsx`](../../web/components/screens/ProfileEditor.tsx)
section **שלבי קושי**.

## Why it helps the child

Easy/medium/hard alone is coarse. A younger sibling may need more steps on small sums;
an older one may need a higher ceiling sooner. Parent tuning keeps practice in the
child’s zone of proximal development instead of a one-size factory curve.

## How it works

- Factory bands live in `GAME_DIFFICULTY`; each profile stores a full `curriculum` copy.
- Question generation uses the profile curriculum for the active game.
- Reset re-copies factory defaults for that game only.

## Watch-outs

- Extreme values (huge maxSum, stepsPerBlock of 1) can frustrate or stall — clamp in the
  editor, but parents can still set aggressive ranges.
- Factory retunes do not auto-apply to existing customized profiles.
