---
id: play-beat-minigame-host
title: Play-beat MinigameHost — extendable engine registry
status: proposed
date: 2026-07-20
tags: [backlog, educational, engagement, pacing, architecture]
theory: Attention span + spaced practice + novelty / curiosity
scope: M
source: agent
related:
  - play-beat-interludes
  - always-gain-xp
  - no-time-pressure-no-fomo
  - audio-first
  - game-provider-pattern
  - data-driven-content
  - pure-logic-in-lib
  - start-from-first-form
  - minigame-engine-tap-collect
  - minigame-engine-catch
  - minigame-engine-path-dash
  - minigame-engine-timing-bounce
  - minigame-engine-meter-burst
  - minigame-engine-slice-swipe
  - varied-surprising-feed-beat
  - alternate-mission-play-beats
---

# Play-beat MinigameHost — extendable engine registry

## Problem / opportunity

The every-Nth-step play beat is a single hard-coded feed overlay (same food taps, same line).
That cannot host real variety. [varied-surprising-feed-beat](varied-surprising-feed-beat.md)
was too thin and is superseded. Engines need a plug point that mirrors how learning games
already plug in via [game-provider-pattern](../knowledge/technical/game-provider-pattern.md).

## Proposed feature

Replace today’s one-shot feed UI with a **MinigameHost** on the play beat:

- Defines a `MinigameEngine` contract (`id`, `start(ctx)`, `isComplete(session)`) and a
  registry map (like `PROVIDERS`).
- On each play step: pick an engine + data-driven skin (prefer active animal / habitat; avoid
  recent repeats); run a short no-fail session; award at least current play XP (optional
  always-positive surprise bonus); return to learn.
- Host does **not** embed mechanics. ≥20 kid-facing *experiences* come from engines × skins
  over time ([data-driven-content](../knowledge/technical/data-driven-content.md)).
- Adding a new engine later = new `web/lib/minigames/<id>.ts` + registry row + skins — no
  rhythm/XP/run-loop surgery beyond the host dispatch table.

Target shape:

```ts
type MinigameEngine = {
  id: MinigameEngineId;
  start: (ctx: MinigameContext) => MinigameSession;
  isComplete: (session: MinigameSession) => boolean;
};
```

## Grounding

- Extends [play-beat-interludes](../knowledge/educational/play-beat-interludes.md): break stays
  light and no-fail; only the *kind* of play varies.
- Respects [always-gain-xp](../knowledge/educational/always-gain-xp.md) and
  [no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md): no
  countdown fail, lives, or game-over.
- [audio-first](../knowledge/educational/audio-first.md): short spoken prompts per skin.
- Architecture mirrors [game-provider-pattern](../knowledge/technical/game-provider-pattern.md)
  and [pure-logic-in-lib](../knowledge/technical/pure-logic-in-lib.md).

## Rough scope

- `web/lib/minigames/` — types, registry, pure picker + Vitest.
- Transient overlay state in the store (replace/extend `playOverlay`).
- Host UI in `GameScreen` (or a dedicated overlay) dispatching by `engineId`.
- Skins/prompts in `web/data/minigames*.ts`.
- Wire rhythm `play` beat to host; keep learning steps dominant.

## Watch-outs

- Micro-games must stay shorter/easier than learning steps.
- Original titles only — genre feel, no trademarked names/assets.
- Do not celebrate every micro-win as hard as evolution
  ([celebrate-progress](../knowledge/educational/celebrate-progress.md)).
- Golden rule: no required change to `alufim_state_v2` shape for the host itself.

## OKF updates on ship

When this graduates to `accepted`:

1. New `knowledge/technical/minigame-provider-pattern.md` — ADR (Context → Decision → Why →
   Alternatives rejected → Consequences / how to add an engine); add row to the Design
   patterns table in `knowledge/technical/index.md`.
2. New `knowledge/educational/play-beat-minigame-variety.md` — child-facing rule: varied
   no-fail micro-play every N steps.
3. Update [play-beat-interludes](../knowledge/educational/play-beat-interludes.md) `related`
   and How it works to point at the host.
4. Rows in educational + technical indexes; dated line atop `knowledge/log.md`.
