---
id: pointed-first-words
title: Basic pointed Hebrew words — themed first lexicon for ~age 4
status: proposed
date: 2026-07-21
tags: [backlog, educational, literacy, hebrew, reading, vocabulary]
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

# Basic pointed Hebrew words — themed first lexicon for ~age 4

## Problem / opportunity

Letter and syllable practice only sticks when the child sees that decoding unlocks **basic
words** from daily life. The English game already pairs word ↔ emoji ↔ audio; Hebrew has no
equivalent “I can read this” moment with nikud.

For ~age 4, the goal is not a large dictionary — it is a **small, warm, imageable lexicon**
(family, body, home, animals, food, nature) that the child already *says*, now also *sees*
fully pointed.

This sits on top of [hebrew-literacy-game](hebrew-literacy-game.md) and
[nikud-open-syllables](nikud-open-syllables.md): a word is only asked once the child has met
the letters and vowel marks it uses. Prefer reusing concrete Hebrew from `FIND_PHON` /
`vocab` when the pointed form stays beginner-short.

## Proposed feature

A **מילים** (basic words) kind inside the Hebrew literacy game, driven by themed packs.

### Play modes (pre-reader friendly)

1. **Hear word → pick pointed spelling** among near-misses (wrong letter or wrong nikud).
2. **See pointed word → pick emoji / picture** (meaning check; replay audio free).
3. Harder: **see pointed word → pick among spoken choices** (less picture support).

Always large type, full nikud, short spoken prompts (“מה כתוב כאן?” / “מצא את המילה ששמעת”).

### Basic-word packs (v1 starter lexicon)

Keep each pack tiny; unlock by band / parent tuning. Forms below are illustrative targets
(final pointing reviewed at implement time).

| Pack | Words (pointed targets) |
| --- | --- |
| משפחה | אִמָּא, אַבָּא, אָח, אָחוֹת, סָבָא, סָבְתָא |
| גּוּף | יָד, רֶגֶל, פֶּה, אַף, עַיִן, אֹזֶן |
| בַּיִת | בַּיִת, דֶּלֶת, חַלּוֹן, כּוֹס, מִטָּה, כִּסֵּא |
| חַיּוֹת | כֶּלֶב, חָתוּל, דָּג, סוּס, צָב, פִּיל |
| אֹכֶל | לֶחֶם, חָלָב, בֵּיצָה, תַּפּוּחַ, בָּנָנָה, מַיִם |
| טֶבַע | שֶׁמֶשׁ, יָרֵחַ, עֵץ, פֶּרַח, גֶּשֶׁם, כּוֹכָב |

**Selection rules for every entry:**

- 2–4 letters preferred (allow 5 only when the word is iconic, e.g. תַּפּוּחַ).
- Concrete + emoji-able; child likely already knows the spoken word.
- Fully pointed; never unpointed-only in this age band.
- Tag each entry with `letters[]` + `vowels[]` so the generator can gate by what was taught.

**Bands:** easy = 1 pack, picture on, 4–6 words. Medium = 2–3 packs. Hard = more packs,
picture optional off, near-miss nikud/letter distractors.

## Grounding

- Completes the literacy ladder: letters → nikud/syllables → **basic words**.
- Same multimodal pairing as the English game in
  [game-variety](../knowledge/educational/game-variety.md), but for **Hebrew decoding** with
  nikud visible.
- [Audio-first](../knowledge/educational/audio-first.md): meaning and speech stay available so
  a 4-year-old is never stuck staring at marks in silence.
- [Always-gain-XP](../knowledge/educational/always-gain-xp.md): early reading attempts stay
  safe; near-miss distractors teach without shame.

## Rough scope

- `web/data/hebrewLiteracy.ts` (or `hebrewWords.ts`): packs +
  `{ id, pack, hePointed, emoji, letters[], vowels[] }`.
- Generator filters by taught letters/vowels from the active band (don’t ask for שֶׁמֶשׁ
  before ש and the relevant nikud exist).
- UI: large pointed word cards; emoji options reuse existing choice chrome.
- Vitest: band gating, pack filters, distractor rules, key stability.

## Watch-outs

- Never show **unpointed** Hebrew as the only cue for this age band — that is a later skill.
- Prefer everyday basic words over school/abstract vocabulary in v1.
- Watch almost-words so distractors are fair (teachable mistakes).
- Don’t grade oral reading; this is tap-to-choose recognition.
- Keep prompts short; long sentences reintroduce the load audio-first removed.
- Some family words vary by household (סבתא/סבתא forms) — pick one pointed form and keep
  audio clear; don’t quiz dialect metalanguage.
