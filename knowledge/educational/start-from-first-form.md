---
id: start-from-first-form
title: Start animals at the first living form — not as an egg
status: accepted
date: 2026-07-20
tags: [educational, characters, nurture]
theory: Self-Determination Theory (relatedness)
related: [choose-and-nurture-animal, celebrate-progress, play-beat-minigame-variety]
---

# Start animals at the first living form — not as an egg

## Decision

Animals begin as their first living form (baby). The egg stage is not part of the form ladder.
`forms[0]` maps to asset stage 2 in [`web/data/characters.ts`](../../web/data/characters.ts).

## Why it helps the child

Relatedness starts immediately — the child sees and cares for *their* animal from the first
moment, which makes nurture and play-beat games feel real.

## How it works

Each character has three forms (stages 2–4). `formForXp(0, 3)` shows the baby. Evolution
thresholds remain cumulative (`50`, `150` for three forms). No new `alufim_state_v2` fields.

## Watch-outs

- Returning players at 0 XP now see a baby instead of an egg — intentional.
- Do not reintroduce an egg as `forms[0]` without updating product copy and transitions.
