---
id: no-time-pressure-no-fomo
title: No time pressure, no FOMO
status: accepted
date: 2026-07-20
tags: [educational, anxiety, motivation]
theory: Math-anxiety research + growth mindset (Dweck)
related: [always-gain-xp, play-beat-interludes]
---

# No time pressure, no FOMO

## Decision

The game has no countdown timer, no "lives", no streaks to protect, and no daily-login or
limited-time pressure. Changing settings never resets progress. Stated as a principle on the
About page ([`web/components/screens/AboutScreen.tsx`](../../web/components/screens/AboutScreen.tsx)).

## Why it helps the child

Time pressure and fear-of-missing-out raise anxiety, which narrows working memory and hurts
performance — especially in math. Removing them lets a child think at their own pace and treat
mistakes as steps, not failures.

## How it works

There is no timer or lives state in the game loop, and no streak counter to break. The only
progression is cumulative XP, which never decreases (see [always-gain-xp](always-gain-xp.md)).

## Watch-outs

- "Streak", "daily reward", or "answer fast for bonus" mechanics reintroduce pressure/FOMO.
- Any hard fail state (game over, lost lives) contradicts this decision.
