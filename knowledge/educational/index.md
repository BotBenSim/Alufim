---
id: educational-index
title: Educational - Learning Theory Behind Features
type: manifest
format: OKF/1.0
updated: 2026-07-20
tags: [educational, pedagogy, manifest]
---

# Educational - Learning Theory Behind Features

This category records the **game-design decisions that shape the child's experience** —
each stated as a rule, with a short reason why it's good for a kid and a one-line nod to the
theory behind it. It is not a set of theory essays; it is decisions.

Much of this reasoning was previously only visible to players in the in-app About page
([`web/components/screens/AboutScreen.tsx`](../../web/components/screens/AboutScreen.tsx)).
Here it is durable, agent-readable knowledge so future features stay grounded in the same
child-first principles.

## The rule

Every learning-facing decision should be recorded here as a rule, backed by a named theory.
When you add or change such a feature, add or update a file (copy [`TEMPLATE.md`](TEMPLATE.md)).

## File shape

Shared OKF frontmatter plus a one-line `theory` field, with sections: **Decision -> Why it
helps the child -> How it works -> Watch-outs**. Cite theories by name; do not invent page
numbers or studies.

## Decisions

| ID | Decision | Theory |
| --- | --- | --- |
| [always-gain-xp](always-gain-xp.md) | Every answer gives XP; never lose progress (floor 1) | Positive reinforcement |
| [play-beat-interludes](play-beat-interludes.md) | A no-fail play/feed break every few steps | Attention span + spaced practice |
| [no-time-pressure-no-fomo](no-time-pressure-no-fomo.md) | No timer, lives, streaks, or FOMO | Math-anxiety + growth mindset |
| [right-sized-difficulty](right-sized-difficulty.md) | Difficulty levels + rewards that rise with progress | Zone of Proximal Development + flow |
| [parent-tuned-difficulty-bands](parent-tuned-difficulty-bands.md) | Parents can right-size bands per child | ZPD + scaffolding |
| [math-visual-scaffold](math-visual-scaffold.md) | Add/sub bands: emoji → mixed → digits | CRA progression |
| [celebrate-progress](celebrate-progress.md) | Frequent wins; celebrate evolution | Immediate feedback + goal-gradient |
| [choose-and-nurture-animal](choose-and-nurture-animal.md) | Pick and raise your own animal | Self-Determination Theory |
| [audio-first](audio-first.md) | Spoken prompts + free replay for pre-readers | Cognitive load + emergent literacy |
| [game-variety](game-variety.md) | Four varied games over one drill | Retrieval practice + interleaving |
| [start-from-first-form](start-from-first-form.md) | Start as living baby, not egg | Self-Determination Theory (relatedness) |
| [play-beat-minigame-variety](play-beat-minigame-variety.md) | Varied no-fail micro-games on the play beat | Attention span + novelty |
| [minigame-path-dash](minigame-path-dash.md) | Path-dash short no-fail dash | Attention span + novelty |
| [minigame-timing-bounce](minigame-timing-bounce.md) | Timing-bounce generous hops | Attention span + novelty |
| [minigame-slice-swipe](minigame-slice-swipe.md) | Slice-swipe with no bomb fail | Attention span + novelty |
| [minigame-sling-shot](minigame-sling-shot.md) | Sling-shot fling food to the character | Attention span + novelty + motor planning |
| [minigame-char-maze](minigame-char-maze.md) | Character maze — guide animal to the exit | Attention span + novelty + spatial reasoning |
| [minigame-cut-rope](minigame-cut-rope.md) | Cut-rope — swipe ropes so snack falls to friend | Attention span + novelty + cause-and-effect |

Superseded stubs (removed from product): [minigame-tap-collect](minigame-tap-collect.md),
[minigame-catch](minigame-catch.md), [minigame-meter-burst](minigame-meter-burst.md).
