---
id: track-skill-ladders
title: One seven-stage ladder, filled in three times (Hebrew, English, music)
status: accepted
date: 2026-08-01
tags: [educational, literacy, hebrew, english, music, curriculum]
theory: Sound before symbol + systematic cumulative sequence (synthetic phonics) applied identically to all three symbol systems
related: [sound-before-symbol, faded-scaffold-ladder, hebrew-reading-sequence, curriculum-tracks, target-age-range, audio-first, game-variety]
---

# One seven-stage ladder, filled in three times (Hebrew, English, music)

## Decision

The three planned domains — Hebrew reading, English reading, music — are **the same ladder with
different atoms**. We design one stage sequence, then fill it in per track, rather than designing
three curricula. This is what makes three domains affordable
([curriculum-tracks](../technical/curriculum-tracks.md)).

| # | Stage | Hebrew | English | Music |
| --- | --- | --- | --- | --- |
| 1 | Discriminate by ear | same/different first sound; rhyme | same/different first sound; rhyme | higher/lower; same/different; long/short |
| 2 | Sound → symbol | hear /b/, pick ב | hear /b/, pick b | hear a note, pick the key |
| 3 | Symbol → sound | see ב, say "bet" | see b, say /b/ | see a key or name, play it |
| 4 | Combine | letter + nikud = בַּ | blend c-a-t | echo a 2–5 note phrase / clap a rhythm |
| 5 | Read a sequence | syllables → word | CVC word → sentence | stick notation → staff |
| 6 | Produce | trace the letter, build the word | trace the letter, spell the word | play from notation; chord shapes |
| 7 | Fluency | read a short sentence | read a short sentence | play a short song |

Stages 1–3 are the 3–4 year old's whole world; 4–5 are 5–6; 6–7 are 7–8
([target-age-range](../product/target-age-range.md)).

## Why it helps the child

The order is the evidence-backed one in [sound-before-symbol](sound-before-symbol.md): ear before
symbol, cumulative atoms, confusables separated, one support removed per band
([faded-scaffold-ladder](faded-scaffold-ladder.md)). Using the same shape across domains also means
a child who has climbed it once in Hebrew already knows how learning works in music — the game
teaches a method, not just facts.

## How it works

**Atom inventory and order, per track.** This is the content work; the stages above are fixed.

- **Hebrew** — 22 letters (frequency order, never two from the same `LETTER_CONFUSE` family in one
  band) → 8 nikud, one at a time → CV syllables → open-syllable words → closed. Print only, no
  final forms at first. See [hebrew-reading-sequence](hebrew-reading-sequence.md).
- **English** — the standard synthetic-phonics order (s a t p i n …, as used by Teach Your Monster
  and Duolingo ABC), separating b/d, m/n, i/e → CVC blending → digraphs → vowel teams → a small
  set of irregular high-frequency words.
- **Music** — rhythm strand first (ta / ti-ti), since rhythmic ability develops before melodic;
  pitch strand sol–mi → +la → pentatonic → +fa/ti → chromatic; chords as movable shapes. See
  [music-ear-and-chords-game](../../backlog/music-ear-and-chords-game.md).

**Where the tracks genuinely differ** (do not force symmetry):

- Hebrew skips phoneme blending — a letter plus its nikud is read as one unit, which is why Hebrew
  reading arrives earlier than English.
- English needs digraphs and irregular words, which have no Hebrew equivalent.
- Music has a time dimension. Rhythm is a whole parallel strand with no reading counterpart, and it
  is the easiest entry point in any of the three tracks.

## What shipped

Stages 1–5 exist in all three tracks, as three ordinary games (`hebread`, `engread`, `music`) rather
than as the track/skill model in [curriculum-tracks](../technical/curriculum-tracks.md), which is
still only proposed. Stages 6 (produce) and 7 (fluency) are not built.

Two places where the shipped ladder departs from the table above:

- **Music has no rhythm strand yet.** The plan called for rhythm first, since it develops before
  melody; what shipped is the pitch strand only (higher/lower → which key → solfège name → echo a
  phrase → major vs minor). Rhythm is the obvious next addition and would serve the youngest players
  better than anything currently in the track.
- **Music stage 5 is major vs minor, not notation.** Chords are generated as movable shapes from a
  root, so a chord is one rule rather than a table of 24. Staff notation is unbuilt.

Each track's step 1 is genuinely ear-only: no letter, note name or written symbol reaches the screen
until stage 2, which is the whole point of [sound-before-symbol](sound-before-symbol.md).

## Watch-outs

- **Do not let the symmetry drive the content.** The table is a planning tool; where a language's
  real pedagogy diverges, the pedagogy wins.
- Stage 6 (produce) needs drawing and dragging, which is where fine-motor limits bite hardest at the
  young end. It is the most likely stage to over-promise.
- Stage 7 implies reading connected text and playing songs — real content authoring, not generated
  questions. Budget for it or stop the track at 6.
- English and Hebrew running at once risks letter-shape interference (b/ב, p/פ visually distinct but
  cognitively competing at 4). Consider not starting both tracks in the same period.
