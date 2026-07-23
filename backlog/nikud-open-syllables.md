---
id: nikud-open-syllables
title: Teach ניקוד and open CV syllables inside the Hebrew literacy game
status: proposed
date: 2026-07-21
tags: [backlog, educational, literacy, hebrew, nikud]
theory: Phonological awareness + alphabetic principle + CRA scaffold (extends audio-first / right-sized-difficulty)
scope: M
source: agent
related:
  - hebrew-literacy-game
  - pointed-first-words
  - audio-first
  - right-sized-difficulty
  - parent-tuned-difficulty-bands
  - math-visual-scaffold
---

# Teach ניקוד and open CV syllables inside the Hebrew literacy game

## Problem / opportunity

Spoken Hebrew is full of vowels; printed beginner text for young children uses **ניקוד**.
Alufim already *displays* nikud in letter names and UI strings, but never teaches the marks
as something the child can hear, see, and blend. Without nikud, “learning to read Hebrew”
stops at letter names — which is not enough for a ~4-year-old’s first decode.

Depends on (or lands with) [hebrew-literacy-game](hebrew-literacy-game.md) so this work has a
dedicated home rather than mixing into math-flavored `find`.

## Proposed feature

Add literacy kinds that introduce a **small, high-frequency nikud set** first, then open
syllables (consonant + vowel):

**Nikud set (v1 suggestion — keep tiny):**
פַּתַח (ַ), קָמַץ (ָ), צֵירֵי/סֶגוֹל as one “eh” family if needed, חִירִיק (ִ),
חוֹלָם (ֹ / וֹ), שׁוּרוּק/קֻבּוּץ as one “u” family. Prefer **sound families** over
full grammatical inventory for age 4.

**Question kinds:**

1. **Hear vowel → pick mark** — speak “אַ” / “אהּ” style target; child taps the nikud glyph
   (large touch targets; marks shown under a neutral carrier letter or alone).
2. **See mark → hear/choose sound** — reverse retrieval.
3. **Open syllable CV** — show `בָּ` / `מִי` / `שׁוּ`; speak “בָּ”; child picks the matching
   card among lookalike syllables (same letter different nikud, or same nikud different
   letter).
4. **Blend play (audio-led)** — hear letter sound + vowel, then choose the combined
   syllable card (scaffolded; never timed).

Easy band: 1–2 vowels, few letters. Medium: more letters, still few vowels. Hard: lookalike
syllables (בָּ/בָּּ confusion only when dagesh is in scope; otherwise בָ/בֵ/בִ).

## Grounding

- **Alphabetic principle:** letters map to sounds; in pointed Hebrew the nikud carries the
  vowel — children need both pieces to decode.
- Continues the CRA-style ladder from
  [math-visual-scaffold](../knowledge/educational/math-visual-scaffold.md): concrete sound →
  mark → blended syllable (same idea, literacy domain).
- Stays inside [audio-first](../knowledge/educational/audio-first.md) and
  [no-time-pressure](../knowledge/educational/no-time-pressure-no-fomo.md): blending is slow
  work; never race it.
- Extends [right-sized-difficulty](../knowledge/educational/right-sized-difficulty.md): vowel
  inventory grows by band, not all at once.

## Rough scope

- Data: nikud inventory + CV table in `web/data/hebrewLiteracy.ts` (or `nikud.ts`).
- New `kinds` on the Hebrew provider (`nikud`, `syllable`, …) + speak strings in
  `speakPrompt`.
- Large-type syllable cards in `QuestionView` (RTL, clear nikud rendering).
- Difficulty band params: `vowels[]`, `letters[]`, `confuseSyllables`.
- Vitest for generator constraints (only taught vowels; distractors are near-misses).

## Watch-outs

- Do **not** teach full adult nikud grammar (שוא, חטפים, קרי/כתיב) in v1 — cognitive overload.
- Font/stack must render nikud clearly on the target devices; test tiny marks on phones.
- TTS must pronounce open syllables consistently; prefer short recorded-quality prompts if
  browser TTS mangles nikud.
- Avoid implying there is one “correct” academic name the child must say — recognition and
  blending matter more than metalanguage.
- Save shape: only curriculum params for new kinds; no progress punishment if a parent
  disables vowel bands.
