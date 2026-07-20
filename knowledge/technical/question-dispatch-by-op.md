---
id: question-dispatch-by-op
title: Dispatch rendering and speech by Question.op
status: accepted
date: 2026-07-20
tags: [architecture, pattern, types]
supersedes: []
related: [game-provider-pattern, data-driven-content]
---

# Dispatch rendering and speech by Question.op

## Context

A question produced by any provider flows to two shared consumers: the on-screen renderer and
the text-to-speech prompt. Those consumers must handle every game type without importing each
provider's internals.

## Decision

Every question carries a discriminant tag `op` (the game id), and shared consumers `switch`
on it to pick per-game rendering and speech.

```ts
// web/lib/types.ts
type Question = Record<string, unknown> & { op: GameId | "find"; answer: unknown };

// web/lib/speakPrompt.ts
switch (q.op) {
  case "add": speak(addSpeakPrompt(q as AddQuestion, HEB_NUM), true); break;
  case "eng": speakEn((q as EngQuestion).word.en, true); break;
  // ...
}
```

## Why

- One tagged shape lets shared code (render, speak) handle all games uniformly.
- The tag makes the "add a game" checklist explicit: add a `case` and the compiler/reviewer
  sees where.
- Keeps the run loop and UI decoupled from each provider's concrete question type.

## Alternatives rejected

- **Put render/speak methods on the Provider** — mixes generation with presentation and pulls
  UI concerns into pure logic.
- **`instanceof` / structural sniffing** — fragile; the `op` tag is explicit and cheap.

## Consequences

- Question objects use loose typing (`Record<string, unknown> & { op }`), so consumers cast to
  the concrete type after checking `op` (e.g. `q as unknown as AddQuestion`).
- Adding a game means adding a `case` in each dispatch site; a missing case silently does
  nothing, so keep the sites together and covered.
