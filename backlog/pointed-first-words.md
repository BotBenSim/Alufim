---
id: pointed-first-words
title: First pointed Hebrew words (audio + image + nikud) as an early reading kind
status: proposed
date: 2026-07-21
tags: [backlog, educational, literacy, hebrew, reading]
theory: Emergent literacy + paired-associate learning + retrieval practice (extends audio-first / game-variety)
scope: M
source: agent
related:
  - hebrew-literacy-game
  - nikud-open-syllables
  - audio-first
  - right-sized-difficulty
  - always-gain-xp
---

# First pointed Hebrew words (audio + image + nikud) as an early reading kind

## Problem / opportunity

Letter and syllable practice only sticks when the child sees that decoding unlocks **real
words** they care about (אִמָּא, אַבָּא, כֶּלֶב, שֶׁמֶשׁ). The English game already pairs
word ↔ emoji ↔ audio; Hebrew has no equivalent “I can read this” moment with nikud.

This sits on top of [hebrew-literacy-game](hebrew-literacy-game.md) and
[nikud-open-syllables](nikud-open-syllables.md): words appear only after the child has met
the letters and vowel marks those words use.

## Proposed feature

A **מילה** kind inside the Hebrew literacy game:

- Show a short **fully pointed** word (2–4 letters), large type, plus optional emoji cue on
  easier bands.
- Prompt is spoken: “מה כתוב כאן?” / “מצא את המילה ששמעת” depending on mode.
- Modes that stay pre-reader-friendly:
  1. **Hear word → pick pointed spelling** among near-miss spellings (wrong letter or wrong
     nikud).
  2. **See pointed word → pick emoji / picture** (meaning check — child may still use the
     spoken replay).
  3. Harder: **see pointed word → pick from spoken choices** (less picture support).

**Starter lexicon (examples, not final):** אִמָּא, אַבָּא, בַּיִת, כֶּלֶב, חָתוּל, דָּג,
שֶׁמֶשׁ, מַיִם, פֶּה, יָד — concrete, imageable, mostly open/simple patterns. Prefer
reusing themes from `FIND_PHON` / `vocab` where the Hebrew form is truly beginner-pointed.

Easy band: tiny lexicon, picture support on. Hard: more words, picture off, nikud-minimal
distractors (אַבָּא / אֲבָא-style only if we include that mark; otherwise letter swaps).

## Grounding

- Completes the literacy ladder: letters → nikud/syllables → **words**, matching how
  emergent readers consolidate the alphabetic principle.
- Same multimodal pairing that makes [game-variety](../knowledge/educational/game-variety.md)’s
  English game work for pre-readers, but now for **Hebrew decoding** with nikud visible.
- [Audio-first](../knowledge/educational/audio-first.md): meaning and speech stay available so
  a 4-year-old is never stuck staring at marks in silence.
- [Always-gain-XP](../knowledge/educational/always-gain-xp.md): early reading attempts stay
  safe; near-miss distractors teach without shame.

## Rough scope

- Word list with `{ hePointed, heSpoken?, emoji, letters[], vowels[] }` in
  `web/data/hebrewLiteracy.ts`.
- Generator filters words by taught letters/vowels from the active band (don’t ask for שֶׁמֶשׁ
  before ש and the relevant nikud exist).
- UI: large pointed word cards; emoji options reuse existing choice chrome.
- Vitest: band gating, distractor rules, key stability.

## Watch-outs

- Never show **unpointed** Hebrew as the only cue for this age band — that is a later skill.
- Watch homophones / almost-words so distractors are fair (teachable mistakes).
- Don’t grade “accent” or free oral reading; this is tap-to-choose recognition, not speech
  assessment.
- Keep prompts short; long sentences reintroduce the load audio-first removed.
- Lexicon must be culturally warm and concrete — avoid abstract school words in v1.
