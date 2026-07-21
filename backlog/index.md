---
id: backlog-index
title: Backlog - Educational Feature Proposals
type: manifest
format: OKF/1.0
updated: 2026-07-21
tags: [backlog, educational, manifest]
---

# Backlog - Educational Feature Proposals

The queue of proposed **educational** features for the game. Each proposal is one OKF file
(copy [`TEMPLATE.md`](TEMPLATE.md)) with a `status` in its frontmatter — no status-named
folders; filter by the field.

A proposal is the same OKF object as a knowledge decision, at an earlier point in its life.
When an approved proposal ships, it **graduates** into a `knowledge/educational/` decision
(`status: accepted`) and its `related` links to that file. See the workflow in
[`../playbooks/`](../playbooks/) and the shared status lifecycle in
[`../knowledge/index.md`](../knowledge/index.md).

## Lifecycle

`proposed` -> `approved` -> `in-progress` -> `accepted` (graduated to `knowledge/educational/`).
Off-ramps: `rejected`, `superseded`.

## Rules for proposals

- Educational features only — nothing infra/technical-only.
- Every proposal names an existing theory in [`../knowledge/educational/`](../knowledge/educational/index.md)
  (or proposes a new, named, theory-backed one).
- Nothing may break the golden rule (`alufim_state_v2`).

## Proposals

| ID | Proposal | Status | Theory |
| --- | --- | --- | --- |
| [start-from-first-form](start-from-first-form.md) | Start animals at first living form (not egg) | accepted | SDT relatedness |
| [play-beat-minigame-host](play-beat-minigame-host.md) | Extendable MinigameHost + engine registry on the play beat | accepted | Attention span + novelty |
| [minigame-engine-tap-collect](minigame-engine-tap-collect.md) | Engine: tap-collect (removed stub) | superseded | Attention span + novelty |
| [minigame-engine-catch](minigame-engine-catch.md) | Engine: catch (removed stub) | superseded | Attention span + novelty |
| [minigame-engine-path-dash](minigame-engine-path-dash.md) | Engine: path-dash (savanna dash / reef swim) | accepted | Attention span + novelty |
| [minigame-engine-timing-bounce](minigame-engine-timing-bounce.md) | Engine: timing-bounce (happy hops) | accepted | Attention span + novelty |
| [minigame-engine-meter-burst](minigame-engine-meter-burst.md) | Engine: meter-burst (removed stub) | superseded | Attention span + novelty |
| [minigame-engine-slice-swipe](minigame-engine-slice-swipe.md) | Engine: slice-swipe (fruit toss / snack slash) | accepted | Attention span + novelty |
| [minigame-engine-sling-shot](minigame-engine-sling-shot.md) | Engine: sling-shot (fling food to the character) | accepted | Attention span + novelty + motor planning |
| [minigame-engine-char-maze](minigame-engine-char-maze.md) | Engine: char-maze (guide animal to the exit) | accepted | Attention span + novelty + spatial reasoning |
| [minigame-engine-cut-rope](minigame-engine-cut-rope.md) | Engine: cut-rope (swipe ropes so snack falls) | accepted | Attention span + novelty + cause-and-effect |
| [varied-surprising-feed-beat](varied-surprising-feed-beat.md) | Varied foods/reactions on feed (superseded by host + engines) | superseded | Variable-ratio reinforcement + novelty |
| [alternate-mission-play-beats](alternate-mission-play-beats.md) | Schedule find-mission in rhythm (related to tap-collect) | proposed | Attention span + interleaving |
| [visible-collection-board](visible-collection-board.md) | Collection gallery + near "next friend" goal | proposed | Curiosity gap + goal-gradient + SDT |
| [positive-bond-affection](positive-bond-affection.md) | Growing mood/affection feedback (positive-only, no decay) | proposed | SDT relatedness + positive reinforcement |
| [session-quest-surprise-chest](session-quest-surprise-chest.md) | Tiny per-run quest ending in a surprise chest | proposed | Goal-gradient + variable always-positive reward |
| [audit-medium-hard-levels](audit-medium-hard-levels.md) | Playtest + fix medium/hard across all learning games | proposed | ZPD + flow (right-sized difficulty) |
| [hebrew-literacy-game](hebrew-literacy-game.md) | Dedicated Hebrew literacy game (letters/sounds) for ~age 4 | proposed | Emergent literacy + phonological awareness + retrieval practice |
| [nikud-open-syllables](nikud-open-syllables.md) | Teach ניקוד + open CV syllables in the Hebrew game | proposed | Phonological awareness + alphabetic principle + CRA |
| [pointed-first-words](pointed-first-words.md) | Basic pointed Hebrew words (themed first lexicon) | proposed | Emergent literacy + paired-associate + retrieval practice |
| [letter-form-readiness](letter-form-readiness.md) | Pre-writing form play (match, sofit, stroke demo; no OCR) | proposed | Fine-motor readiness + visual discrimination |
