---
id: hebrew-literacy-game
title: Dedicated Hebrew literacy game for emergent readers (~age 4)
status: proposed
date: 2026-07-21
tags: [backlog, educational, literacy, hebrew]
theory: Emergent literacy + phonological awareness + retrieval practice + interleaving (extends audio-first / game-variety)
scope: L
source: agent
related:
  - audio-first
  - game-variety
  - right-sized-difficulty
  - parent-tuned-difficulty-bands
  - math-visual-scaffold
  - always-gain-xp
  - no-time-pressure-no-fomo
  - nikud-open-syllables
  - pointed-first-words
  - letter-form-readiness
---

# Dedicated Hebrew literacy game for emergent readers (~age 4)

## Problem / opportunity

Hebrew letter work today is a thin slice inside **מצא את...** (`find`): glyph ID and
initial-sound (`letter` / `phon`), mixed with quantities and reasoning. That is fine as a
sprinkle, but it is not a literacy path. A ~4-year-old learning to read and write needs a
clear, calm ladder — letter → sound → shape discrimination — without competing number tasks,
and without having to decode the UI ([audio-first](../knowledge/educational/audio-first.md)).

There is also no home for **ניקוד**, open syllables, or **basic pointed words** (family,
body, home, animals, food, nature). Stuffing all of that into `find` would blur the game’s
identity and make parent difficulty tuning harder.

## Proposed feature

Add a fifth learning game, e.g. **עברית** / **אותיות**, that is the child’s Hebrew reading
home. Same XP animal loop as the other games; audio-first prompts; always-gain-XP; no timer.

**v1 question kinds (letters first):**

1. **Hear name → pick glyph** — “איפה האות אָלֶף?” (today’s `letter`, but in this game).
2. **See glyph → pick spoken name** among short audio choices (or name chips that speak on
   tap) — reverse retrieval so the child isn’t only matching pictures of letters.
3. **Initial sound** — “מה מתחיל ב־מֵם?” → emoji/`FIND_PHON`-style word (today’s `phon`).
4. **Lookalike discrimination** — harder bands use `LETTER_CONFUSE` (ב/כ, ד/ר, ה/ח/ת…) so the
   child practices *seeing* the letter, not guessing from a random set.

Difficulty bands scaffold like math’s CRA path
([math-visual-scaffold](../knowledge/educational/math-visual-scaffold.md)): easy stays on a
small letter set with clear distractors; medium widens the alphabet; hard adds lookalikes.
Parents can still retune band length / letter pool
([parent-tuned-difficulty-bands](../knowledge/educational/parent-tuned-difficulty-bands.md)).

Leave **ניקוד**, syllables, **basic words**, and pre-writing form play to the related
proposals so reviewers can approve the ladder in steps — but design the provider/`kinds`
list so those kinds plug in later without a second game. The north star for this game is
that a child can read a small set of everyday pointed words, not only name letters.

Optionally thin `find`’s default `kinds` so letters/sounds mostly live here (keep a light
overlap only if playtests say variety inside `find` still helps).

## Grounding

- Extends [game-variety](../knowledge/educational/game-variety.md): a distinct domain
  (Hebrew literacy) alongside math and English, with its own retrieval practice +
  discrimination learning.
- Keeps [audio-first](../knowledge/educational/audio-first.md) as the non-negotiable for
  pre-readers: the child practices *becoming* a reader without needing to already be one.
- [Right-sized-difficulty](../knowledge/educational/right-sized-difficulty.md) + ZPD: letter
  pool and confuse sets grow with the band, not all 22 letters on day one.
- New named theory to record when this graduates: **emergent literacy / Ehri’s alphabetic
  phases** (pre-alphabetic → partial alphabetic) and **phonological awareness** as the
  foundation before decoding. Fits the child-first stack; not yet a `knowledge/educational/`
  file.

## Rough scope

- New `GameId` (e.g. `heb`) + provider `web/lib/providers/heb.ts` (or `hebrew.ts`) following
  [game-provider-pattern](../knowledge/technical/game-provider-pattern.md).
- Content module `web/data/hebrewLiteracy.ts` (reuse `FIND_LETTERS` / `FIND_PHON` /
  `LETTER_CONFUSE` initially; don’t fork unless shapes diverge).
- Register in `PROVIDERS`, `GAMES`, `GAME_DIFFICULTY`, speak + `QuestionView` dispatch.
- Vitest for pure generators (letter pool, confuse distractors, de-dupe keys).
- Profile curriculum copy for the new game (same pattern as other games — watch save shape).

## Watch-outs

- **Golden rule:** adding a game usually adds a curriculum slice on each profile. Prefer
  additive defaults / migration that never rewrites or drops `alufim_state_v2` fields; call
  out any migrate helper in implementation.
- Do not require the child to *read* Hebrew instructions — speak everything.
- Don’t turn early bands into a 22-letter flashcard dump; small sets + success matter more
  at ~4.
- Keep `find`’s non-literacy kinds intact; any thinning of `letter`/`phon` there is a product
  choice, not required for v1 of this game.
- Speech quality for letter names with nikud must stay clear (short prompts).
