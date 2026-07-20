---
id: audio-first
title: Audio-first prompts for pre-readers
status: accepted
date: 2026-07-20
tags: [educational, accessibility, literacy]
theory: Cognitive load theory (Sweller) + emergent literacy
related: [game-variety, no-time-pressure-no-fomo]
---

# Audio-first prompts for pre-readers

## Decision

Every prompt is spoken aloud automatically, and a "hear again" button replays it at no cost.
The child never has to read to play. Speech logic in
[`web/lib/speakPrompt.ts`](../../web/lib/speakPrompt.ts), wired through
[`web/components/game/GameScreen.tsx`](../../web/components/game/GameScreen.tsx).

## Why it helps the child

Many players can't yet read. Speaking the prompt removes the decoding barrier so working
memory goes to the actual task (math, vocabulary), and free replay lets the child control the
pace without needing an adult.

## How it works

The intro and each new question auto-speak; the replay control sits in the question card.
Prompts are kept short and concrete to stay within a young child's working memory.

## Watch-outs

- Auto-speak race conditions can leave a prompt silent — the reason `startGame` sets the run
  atomically (see [zustand-store](../technical/zustand-store.md)).
- Long or wordy prompts reintroduce the cognitive load that audio was meant to remove.
