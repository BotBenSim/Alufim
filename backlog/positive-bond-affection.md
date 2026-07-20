---
id: positive-bond-affection
title: Positive-only bond / affection feedback for the animal
status: proposed
date: 2026-07-20
tags: [backlog, educational, engagement, nurture]
theory: Self-Determination Theory (relatedness) + positive reinforcement
scope: M
source: agent
related:
  - choose-and-nurture-animal
  - always-gain-xp
  - no-time-pressure-no-fomo
  - celebrate-progress
  - varied-surprising-feed-beat
  - visible-collection-board
---

# Positive-only bond / affection feedback for the animal

## Problem / opportunity

"Choose and nurture your animal"
([choose-and-nurture-animal](../knowledge/educational/choose-and-nurture-animal.md)) is the
core emotional hook, but between evolutions the animal mostly sits still while XP ticks.
Kids get little *felt* care feedback from feeding and answering — so the bond that should
pull them back is thin after a few turns.

## Proposed feature

Show growing mood / affection as the child plays — hearts, warmer reactions, small "your
friend is happy" moments after feeds and good answers.

**Hard rule: positive-only.** Affection only grows or stays; never decays from leaving the
app, never "your animal is hungry/sad" guilt, no hunger timer, no punishment for a short
session.

## Grounding

- Deepens relatedness and competence in Self-Determination Theory as already recorded in
  [choose-and-nurture-animal](../knowledge/educational/choose-and-nurture-animal.md).
- Compatible with [always-gain-xp](../knowledge/educational/always-gain-xp.md) and
  [no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md): no
  streak-to-protect, no daily care obligation.
- Pairs with [varied-surprising-feed-beat](varied-surprising-feed-beat.md) so care moments
  look and feel different as the bond grows.

## Rough scope

- Prefer derived UI from recent run activity / total XP / feed counts so save shape stays
  untouched.
- If any persistence is needed later, only an *additive optional* field with a migration
  that defaults safely — call out explicitly before shipping.
- Light presentation in run header and/or after feed/evolve, without blocking the next
  question.

## Watch-outs

- Tamagotchi-style hunger/decay is explicitly out of scope — it reintroduces FOMO and guilt.
- Don't let affection UI compete with or cheapen evolution celebrations
  ([celebrate-progress](../knowledge/educational/celebrate-progress.md)).
- Never subtract XP or affection as punishment.
- Avoid "come back every day" framing even if affection is shown.
