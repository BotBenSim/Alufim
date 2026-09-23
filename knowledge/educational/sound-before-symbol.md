---
id: sound-before-symbol
title: Teach the sound first; the symbol only names something the child already knows
status: accepted
date: 2026-08-01
tags: [educational, literacy, music, sequence]
theory: Sound before symbol — Pestalozzi (1830) → Kodály "inner hearing" → Gordon "audiation"; the same structure as phonemic awareness before phonics
related: [audio-first, math-visual-scaffold, faded-scaffold-ladder, hebrew-reading-sequence, game-variety]
---

# Teach the sound first; the symbol only names something the child already knows

## Decision

For any symbol system this app teaches — musical notes, Hebrew letters, numerals — the child meets
the **sound** first and the **written mark** only afterwards, as a label for something they can
already hear and produce. We never open a feature with the symbol.

Concretely: a child should be able to echo a two-note phrase before seeing a note written, and
should know a letter's sound and name before being asked to trace or read it. Reading then becomes
recognition of a known sound, not decoding of an abstract mark.

No shipped feature depends on this yet; it governs the music and Hebrew proposals in
[`backlog/`](../../backlog/index.md) and any future symbol-teaching game.

## Why it helps the child

Every serious method for both music and reading independently converged on this order. Pestalozzi
wrote it in 1830 ("teach sounds before signs… make the child sing before he learns the written
notes"); Kodály called the internal result *inner hearing*; Gordon named it *audiation* and built
his Learning Sequence Activities so children acquire an aural/oral pattern vocabulary before any
notation; Orff summarized it as "experience first, then intellectualize". Systematic synthetic
phonics says the same thing in reading terms: phonemic awareness — hearing and manipulating the
sounds inside spoken words — comes before or alongside letter–sound mapping, and decodable text
comes after both.

The reason is that a symbol introduced too early has nothing to refer to. The child memorizes marks
instead of learning a language, which is slow, brittle, and boring.

## How it works

The two domains map onto one ladder, which is why one engine can serve both:

| Reading | Music |
| --- | --- |
| Phonemic awareness (hear sounds in speech) | Pitch discrimination: high/low, same/different |
| Letter–sound correspondence | Note ↔ solfège syllable |
| Blending sounds into words | Echoing a 2–3 note phrase |
| Decodable text (only taught letters) | Songs using only taught notes (Kodály's pentatonic repertoire) |
| Sight words | Landmark notes |
| Fluency | Sight reading |

Three properties make it a *systematic* sequence rather than a vague ordering, and all three are
borrowed from phonics research:

1. **A fixed, small inventory of atoms**, introduced in a planned order — high-frequency and
   easily-distinguished first. Music starts from two notes (sol–mi), widens to the five-note
   pentatonic, and only later reaches the full scale.
2. **Cumulative practice**: material only ever uses atoms already taught. This is what a decodable
   text is, and it is what Kodály's pentatonic song repertoire is.
3. **Deliberate separation of confusables** — never teach two similar items in the same set.

The staff, when it eventually appears, is taught by **landmark notes plus intervals** (step / skip /
same relative to a known anchor), not by mnemonics such as Every Good Boy Deserves Fudge. Mnemonic
readers decode note-by-note and cannot anticipate how a phrase will sound; landmark-and-interval
readers hear it coming. Note that landmark notes are the exact musical equivalent of sight words.

## Watch-outs

- **The symbol rung demos better than the ear rung.** It will always be tempting to ship notation
  or letter-tracing first because it looks like "real learning" to an adult watching. Resist it;
  that is the failure this decision exists to prevent.
- Drill apps that teach symbols directly (Note Rush, Flashnote Derby for music; letter flashcards
  for reading) do work, but as *supplements to a teacher* for children who already have the sounds.
  They are not a path from zero and should not be our model for a first rung.
- Sound-first makes audio load-bearing. See the accessibility and muted-device watch-outs in
  [audio-first](audio-first.md) — a sound-first game must never be the only route to progress.
- Do not let "sound first" become "sound only". The point is a sequence that *reaches* the symbol,
  not an ear-training toy that never gets there.
