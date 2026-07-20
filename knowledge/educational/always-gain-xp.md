---
id: always-gain-xp
title: Always gain XP - never lose progress
status: accepted
date: 2026-07-20
tags: [educational, motivation, xp]
theory: Positive reinforcement (Skinner)
related: [celebrate-progress, no-time-pressure-no-fomo, right-sized-difficulty]
---

# Always gain XP - never lose progress

## Decision

Every answered question gives XP, and XP is never taken away. A mistake reduces the reward
for that item but never below 1. Progress only ever goes up. See `xpForCorrect` in
[`web/lib/xp.ts`](../../web/lib/xp.ts).

## Why it helps the child

A young child stays motivated when effort always pays something. Rewarding the attempt
(never punishing it) keeps trying safe and keeps the reward loop positive.

## How it works

`XP_TABLE` rows all start at `[1, 2, …]`; `xpForCorrect` walks left by the number of
mistakes but clamps to the first element, so the floor is always 1. There is no code path
that subtracts XP.

## Watch-outs

- Any "lose XP" or "streak reset" mechanic breaks this rule and reintroduces punishment.
- Lowering the floor below 1 would make a hard item feel worthless to attempt.
