---
id: celebrate-progress
title: Frequent wins, celebrated evolution
status: accepted
date: 2026-07-20
tags: [educational, feedback, motivation]
theory: Immediate feedback + goal-gradient effect
related: [always-gain-xp, right-sized-difficulty, choose-and-nurture-animal]
---

# Frequent wins, celebrated evolution

## Decision

Give small wins often and make the big milestone — the animal evolving to its next form —
a visible celebration (confetti + preview). The XP bar always shows progress toward the next
form. Confetti lives in
[`web/components/cards/CharacterPreviewOverlay.tsx`](../../web/components/cards/CharacterPreviewOverlay.tsx);
thresholds in [`web/lib/xp.ts`](../../web/lib/xp.ts).

## Why it helps the child

Immediate feedback ties effort to result while the child still cares. A visible, nearing goal
(the next evolution) pulls effort forward (goal-gradient effect), and a real celebration makes
the milestone feel earned.

## How it works

Each correct answer moves the XP bar instantly. Evolution triggers at cumulative thresholds
(`FORM_XP_STEP = 50` -> 50, 150, 300) and fires the confetti/preview moment. The bar shows
`totalXp / nextThreshold`, keeping the target concrete.

## Watch-outs

- Celebrating everything equally makes nothing feel special — reserve the big moment for
  evolution.
- Blocking animations that delay the next question weaken the effort-reward link.
- Thresholds are balance: change them deliberately and update
  [parity-testing](../technical/parity-testing.md).
