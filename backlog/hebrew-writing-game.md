---
id: hebrew-writing-game
title: Hebrew writing game — form the letter, don't just recognize it
status: proposed
date: 2026-08-01
tags: [backlog, educational, literacy, hebrew, motor]
theory: Grapho-motor letter learning (writing a letter strengthens recognizing it) + faded scaffolding (trace → copy → recall)
scope: M
source: human
related:
  - audio-first
  - math-visual-scaffold
  - game-variety
  - right-sized-difficulty
  - always-gain-xp
  - minigame-char-maze
  - music-ear-and-chords-game
---

# Hebrew writing game — form the letter, don't just recognize it

## Problem / opportunity

Every literacy touchpoint in the game today is **receptive**: מצא את asks the child to pick a
letter out of options (`FIND_LETTERS`, `LETTER_CONFUSE`, `FIND_PHON` in
[`web/data/find.ts`](../web/data/find.ts)), and אנגלית matches words to pictures. The child never
**produces** a letter.

That leaves a real learning gain on the table. Producing a letter shape recruits motor memory that
recognition alone does not, and it is exactly what helps with the confusable pairs the game already
models (ב/כ, ד/ר, ה/ח/ת). It is also the skill a 5–6 year old is about to be graded on in גן/כיתה א,
and the one where a no-pressure, always-positive environment helps most — handwriting is where kids
first meet the red pen.

## Proposed feature

A production-side Hebrew letter game, with the same audio-first framing as the rest of the app:
hear the letter name/sound, then make the letter. Three candidate mechanics, from most to least
motor:

1. **Trace** — the letter appears as a guide with numbered waypoint dots; the child drags along it.
   Success = hitting the waypoints in order with a generous radius, **not** pixel-accurate shape
   matching. Stroke order and direction are taught implicitly (Hebrew right-to-left).
2. **Build** — the letter is broken into 2–3 stroke pieces the child drags into place. Motor-light,
   very forgiving, and directly attacks confusable pairs (what makes ב a ב and not a כ).
3. **Copy / recall** — guide fades: trace → faint outline → blank box, the classic faded-scaffold
   progression, used as the difficulty bands rather than as separate games.

Suggested shape: **build** for easy, **trace** for medium, **fading trace** for hard — so one game
carries the whole progression and the youngest child still succeeds.

## How Hebrew reading is actually taught (investigated 2026-08-01)

Relevant because writing and reading share a sequence, and because a Hebrew reading app is the
likely next project. Hebrew instruction is **not** English phonics:

- **Letter names carry the sounds.** The alef-bet is acrophonic — each letter's name begins with
  its own sound — so unlike English (where "double-u" tells you nothing about /w/), teaching letter
  names genuinely supports decoding and spelling (Patel et al. 2002). Both the traditional mesorah
  method and modern Israeli practice teach all 22 shapes and names to automaticity **first**.
- **Then nikud, one mark at a time** — not all eight at once, and not simultaneously with letters,
  which causes confusion.
- **Then the syllable, as a single unit.** Hebrew's consonant-vowel structure means a child can
  read בַּ as one blended "ba" rather than blending two phonemes. This body-coda approach places far
  less load on phonemic awareness than English CVC blending, and is why Hebrew reading is reachable
  earlier. Words come after syllables are secure.
- **Never introduce visually similar letters in the same set** — a core systematic-phonics rule
  that Hebrew needs badly (ב/כ, ד/ר, ה/ח/ת). The app already encodes exactly these families in
  `LETTER_CONFUSE`, which should drive the teaching order, not just distractor choice.

For the writing game this means: letter shape and name are the right unit for a first version, and
nikud is correctly out of scope until shapes are automatic.

## Grounding

- **Grapho-motor letter learning** — the named theory this rests on: forming letters by hand
  supports letter recognition and discrimination more than viewing them. This is a *new* theory
  entry for `knowledge/educational/` if approved.
- **Faded scaffolding**, the same CRA-style logic already accepted for math in
  [math-visual-scaffold](../knowledge/educational/math-visual-scaffold.md) (emoji → mixed → digits)
  applied to letters (guided → outline → blank).
- [audio-first](../knowledge/educational/audio-first.md): the prompt is spoken (letter name from
  `LETTER_NAME`, sound word from `FIND_PHON`), so a pre-reader can play.
- [always-gain-xp](../knowledge/educational/always-gain-xp.md): a wobbly line still earns XP.

## Rough scope

- New learning game via [game-provider-pattern](../knowledge/technical/game-provider-pattern.md):
  add `"write"` to `GameId` in [`web/lib/types.ts`](../web/lib/types.ts), a provider in
  `web/lib/providers/write.ts`, bands in [`web/lib/difficulty.ts`](../web/lib/difficulty.ts), and a
  card in [`web/data/games.ts`](../web/data/games.ts).
- **Architectural first:** answers here are not multiple choice. `QuestionView` /
  `AnswerGlyphView` assume option buttons, so this needs a new answer surface (a drawing/drop
  canvas) alongside the option path — the biggest unknown in the estimate.
- Letter geometry (waypoints / stroke pieces per letter) as data in `web/data/`, per
  [data-driven-content](../knowledge/technical/data-driven-content.md). This is real authoring work:
  22 letters × path data.
- Pure hit-testing/ordering logic in `web/lib/` with Vitest, in the spirit of the existing swipe and
  maze engines ([`web/lib/minigames/charMaze.ts`](../web/lib/minigames/charMaze.ts)).
- Reuse `FIND_LETTERS`, `LETTER_NAME`, `LETTER_CONFUSE`, `FIND_PHON` — no new letter content needed.

## Watch-outs

- **Do not grade handwriting.** Finger-on-glass is not pencil-on-paper; fine motor varies hugely at
  this age. Any shape scoring must be generous to the point of near-unfailable, and there must never
  be a red X on a child's letter.
- **Don't teach wrong stroke order.** Waypoint data has to reflect how Hebrew letters are actually
  written; getting it wrong is worse than not having the game.
- **Which script?** Israeli kids learn דפוס (print) first, כתב (cursive) later. Print only, at least
  initially — mixing them would confuse.
- Final letters (ך ם ן ף ץ) and niqqud are out of scope for a first pass; `FIND_LETTERS` has 22 base
  letters, keep to those.
- Touch and mouse must both work, and the canvas must not fight page scroll on mobile.
- Golden rule: a new `GameId` means a new key inside `profile.games` — additive with a default in
  [`web/lib/migrate.ts`](../web/lib/migrate.ts), never a change to existing entries
  ([state-persistence](../knowledge/technical/state-persistence.md)).

## Open questions

- **Which mechanic first?** Build (drag pieces) is far cheaper and more forgiving than trace and
  might deliver most of the discrimination benefit — worth prototyping before committing to path data.
- Is any shape/accuracy feedback given at all, or is completing the motion always a win?
- Letter order: alphabetical, frequency-based, or grouped by confusable families?
- Learning game (own card, own XP, own bands) or a play-beat engine? Learning game is the better fit
  since it needs difficulty bands, but that is what forces the new answer surface.
