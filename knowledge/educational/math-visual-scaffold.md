---
id: math-visual-scaffold
title: Add/sub bands scaffold from emoji counts to numerals
status: accepted
date: 2026-07-20
tags: [educational]
theory: Concrete-Representational-Abstract (CRA) progression
related: [right-sized-difficulty, parent-tuned-difficulty-bands, per-profile-curriculum]
---

# Add/sub bands scaffold from emoji counts to numerals

## Decision

Each add/sub difficulty band carries a `visual` mode that parents can set:

- `fullCount` — count both sides with emoji
- `countOn` — first quantity as a written number, second as emoji
- `numbers` — digits only (no emoji counts)

Defaults progress from full counts toward numerals as bands advance. Configured per
band in profile settings; see [`web/lib/difficulty.ts`](../../web/lib/difficulty.ts)
and [`QuestionView`](../../web/components/game/QuestionView.tsx).

## Why it helps the child

Young learners need concrete quantities before abstract digits. Moving from emoji
counts → mixed numeral+count → digits alone is a CRA-style scaffold so the child
doesn’t lose the meaning of the number when the pictures go away.

## How it works

`diffParams` returns the active band’s `visual`. The question view renders shapes
accordingly. Digits equation text still appears under the shapes (except the
shapes row is hidden in `numbers` mode).

## Watch-outs

- Jumping straight to `numbers` on the first band can frustrate early counters.
- Subtraction `fullCount` uses crossed-out emoji; `countOn` shows numeral − emoji
  count of the amount removed.
