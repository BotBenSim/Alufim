---
id: hebrew-reading-sequence
title: Hebrew is taught letters → nikud → syllable, not English phonics
status: accepted
date: 2026-08-01
tags: [educational, literacy, hebrew, sequence]
theory: Acrophonic letter names support decoding in Hebrew (Patel et al., 2002) + body-coda blending is lighter than phoneme blending
related: [sound-before-symbol, faded-scaffold-ladder, audio-first, game-variety]
---

# Hebrew is taught letters → nikud → syllable, not English phonics

## Decision

Any Hebrew literacy content in this app follows the sequence Israeli teaching actually uses, which
is **not** the English phonics sequence:

1. **Letters first** — all 22 shapes and their names, to instant recognition.
2. **Nikud next, one mark at a time** — never simultaneously with letter learning.
3. **The syllable as a single unit** — בַּ read as one "ba", not blended from two sounds.
4. **Words** — open-syllable words first (סַבָּא), then closed syllables.

Two ordering rules apply throughout: never introduce visually similar letters in the same set, and
never teach letter names and vowel sounds at the same time.

Steps 1–4 now ship as the קריאה בעברית ladder ([track-skill-ladders](track-skill-ladders.md)),
which reads its letter tables (`FIND_LETTERS`, `FIND_PHON`, `LETTER_CONFUSE`) from
[`web/data/find.ts`](../../web/data/find.ts) — a data module that outlived the מצא את game it
was written for. This decision governs the
[hebrew-writing-game](../../backlog/hebrew-writing-game.md) proposal and any future reading feature.

## Why it helps the child

The instinct to copy English phonics advice is wrong here, for two concrete reasons.

**Hebrew letter names carry their own sounds.** The alef-bet is acrophonic — each letter's name
begins with the sound the letter makes. English is not: "double-u" tells a child nothing about /w/,
and "aitch" nothing about /h/, which is why English programs often teach sounds and skip names. In
Hebrew the opposite holds, and letter-name knowledge measurably supports spelling and word
recognition (Patel et al., 2002). Teaching names first is a real head start, not a detour.

**Hebrew's syllable structure removes most of the blending problem.** Because almost every letter
in a pointed word carries a vowel, a letter plus its nikud forms a ready-made consonant-vowel unit.
The child reads that unit whole rather than blending two phonemes, then adds a final sound for
closed syllables. This body-coda route places far less load on phonemic awareness than English CVC
blending, and it is why Hebrew reading is reachable earlier — including for children with weak
phonological processing, who struggle badly with phoneme-by-phoneme approaches.

Separating visually similar letters comes straight from systematic phonics, and Hebrew needs it
more than English does: ב/כ, ד/ר, ה/ח/ת are genuinely hard to tell apart for a five-year-old.

## How it works

- The confusable families are already encoded as `LETTER_CONFUSE` in
  [`web/data/find.ts`](../../web/data/find.ts). Today they only pick distractors. They should also
  **drive the teaching order** — two letters from the same family never enter in the same band.
- Letter name and sound come from `LETTER_NAME` and `FIND_PHON`, spoken aloud per
  [audio-first](audio-first.md), so a pre-reader can play every rung.
- Each step is a difficulty band, so the sequence is parent-tunable like every other curriculum
  ([parent-tuned-difficulty-bands](parent-tuned-difficulty-bands.md)) and each support fades on a
  schedule ([faded-scaffold-ladder](faded-scaffold-ladder.md)).
- Scope limits for this age: the 22 base letters, the 8 main nikud marks, and דפוס (print) only.
  Final forms (ך ם ן ף ץ) and כתב (cursive) come later.

## Watch-outs

- **Do not import English phonics wholesale.** Sound-only instruction, phoneme-by-phoneme blending,
  and skipping letter names are all reasonable in English and wrong in Hebrew.
- Do not skip nikud to get to "real" words faster. Jumping to unpointed text is the single most
  common way children stall.
- Patach and kamatz both say "ah". Treat them as one sound at this age; the visual distinction is
  advanced grammar, not early reading.
- Letter recognition must be automatic before nikud arrives. If a child is struggling at the
  syllable step, the fix is almost always to go back a step, not to push forward.
