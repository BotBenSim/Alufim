---
id: animal-epic-boss-steps-and-skills
title: Animal epic — each growth step is a boss moment, and each game teaches the animal a different move
status: proposed
date: 2026-08-01
tags: [backlog, educational, engagement, progression, long-horizon]
theory: Self-Determination Theory (competence) + goal-gradient + interleaving across domains
scope: L
source: human
related:
  - choose-and-nurture-animal
  - celebrate-progress
  - right-sized-difficulty
  - always-gain-xp
  - no-time-pressure-no-fomo
  - game-variety
  - play-beat-minigame-variety
  - visible-collection-board
---

# Animal epic — each growth step is a boss moment, and each game teaches the animal a different move

## Problem / opportunity

Today the whole long-term story is one number: `totalXp` on the active character, which crosses
a threshold and changes form ([`web/lib/xp.ts`](../web/lib/xp.ts), `FORM_XP_STEP`). That gives a
child two visible milestones per animal and nothing else. Two gaps follow:

1. **Growth is passive.** Evolution arrives while answering questions; the child never *does*
   anything that feels like the payoff of having practiced.
2. **No reason to spread practice.** All four games ([game-variety](../knowledge/educational/game-variety.md))
   pour into the same XP pool, so a child who likes חיבור can reach the final form having barely
   touched אנגלית or מצא את. And once the animal is בוגר (`pct: 100`), the incentive to keep
   playing at all drops — exactly when a returning-player habit would matter most.

## Proposed feature

An **epic** layer over the existing growth arc, made of two connected halves:

**a) Growth steps become boss moments.** Each form transition (and possibly smaller milestones
inside a form) is a short set-piece encounter instead of just an evolve overlay: the animal faces
a challenge and performs its moves, then evolves. Kept strictly no-fail — see Watch-outs. Think
"the lion shows what it learned and roars the boulder away", not HP bars and defeat.

**b) Each learning game grants a different move.** Practice in a game feeds a distinct,
per-animal **skill** shown on the animal: e.g. חיבור → a strength/charge move, חיסור → a
shrink/break move, אנגלית → a call/roar that names things, מצא את → a spotting/tracking move.
Each animal expresses the same four skill slots with its own art and wording (lion roar, dragon
fire breath, rabbit dash), like minigame skins do today.

Together these make the incentive loop explicit: *the boss moment uses your moves, and your moves
come from the games you played.* A child who wants a stronger showing at the next growth step has
a concrete reason to visit the game they have been skipping — and a reason to keep playing after
the animal is grown (level up the moves, meet the next animal's epic).

## Grounding

- **Competence** in [choose-and-nurture-animal](../knowledge/educational/choose-and-nurture-animal.md)
  (SDT): the child's own effort visibly becomes their own animal's ability. Autonomy stays intact —
  they still choose which game/move to grow.
- **Goal-gradient / frequent visible wins** from [celebrate-progress](../knowledge/educational/celebrate-progress.md):
  a boss moment is a bigger, earned punctuation mark on a milestone that is currently a quiet bar fill.
- **Interleaving** from [game-variety](../knowledge/educational/game-variety.md): the four-skill
  mapping is a soft nudge to practice all domains rather than one, which is where the transfer and
  discrimination benefits live.
- Pairs naturally with [visible-collection-board](visible-collection-board.md) — the board becomes
  where you see each friend's moves.

## Rough scope

- Per-character, per-game skill progress: `CharProgress` in [`web/lib/types.ts`](../web/lib/types.ts)
  is `{ form, totalXp }` today; skills need something like `skills: Record<GameId, number>` added
  **additively** with a default in [`web/lib/migrate.ts`](../web/lib/migrate.ts) (same pattern as
  `minigames` / `playEverySteps`).
- Pure logic in `web/lib/` (skill level from per-game XP, which moves are unlocked, boss
  composition) with Vitest coverage, per [pure-logic-in-lib](../knowledge/technical/pure-logic-in-lib.md).
- Move/skin content in `web/data/characters.ts` (or a new `web/data/skills.ts`), following
  [data-driven-content](../knowledge/technical/data-driven-content.md).
- The boss moment is closest to the existing play-beat host: a new phase alongside `evolve` in
  `RunPhase`, likely reusing [`MinigameHost`](../web/components/game/MinigameHost.tsx) and the
  engine/skin registry rather than a bespoke screen.

## Watch-outs

- **Golden rule.** Adding `skills` to `CharProgress` writes into `alufim_state_v2`. Must be
  additive and defaulted on read, never a rewrite of existing saves
  ([state-persistence](../knowledge/technical/state-persistence.md)).
- **"Boss fight" must not import fail states.** No timers, lives, HP the child can lose, or a
  losing outcome — that contradicts [no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md)
  and [always-gain-xp](../knowledge/educational/always-gain-xp.md). The encounter should end well
  every time; the variable is how flashy it is, never whether you passed.
- **Never gate evolution on the boss.** Form change stays driven by XP; a child who cannot do the
  interaction must still grow. Otherwise a weak fine-motor day becomes a wall.
- **Skills must not become a chore checklist.** If a neglected skill reads as "you're failing at
  אנגלית", it turns variety into guilt. Frame as "this move is still sleepy", never a deficit.
- **Scope creep.** This is the largest idea in the backlog; it likely wants splitting into (1)
  skills from games, (2) boss moment at form change, (3) post-בוגר progression.

## Open questions

- What exactly is a "growth step"? Only the two form transitions per animal, or also smaller
  in-form milestones (which would mean many more boss moments)?
- Does the boss have any real challenge, or is it a showcase/cutscene with light interaction? A
  no-fail encounter with stakes is the hard design problem here.
- Do skills change anything mechanically (better boss showing, new minigame abilities) or are they
  purely expressive? Mechanical effects risk making a child feel under-powered.
- Post-בוגר: does the epic continue on the same animal, or is "finish the epic → unlock the next
  friend" the intended handoff?
