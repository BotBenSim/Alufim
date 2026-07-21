---
id: letter-form-readiness
title: Pre-writing Hebrew letter-form play (match, sofit, stroke demo) — not handwriting OCR
status: proposed
date: 2026-07-21
tags: [backlog, educational, literacy, hebrew, writing]
theory: Fine-motor readiness + visual discrimination + CRA (extends audio-first / no-time-pressure)
scope: M
source: agent
related:
  - hebrew-literacy-game
  - nikud-open-syllables
  - audio-first
  - no-time-pressure-no-fomo
  - right-sized-difficulty
---

# Pre-writing Hebrew letter-form play (match, sofit, stroke demo) — not handwriting OCR

## Problem / opportunity

“Learning to write” at ~4 is mostly **seeing letter forms**, telling lookalikes apart, meeting
**סופיות** (ך ם ן ף ץ), and watching a calm stroke path — not producing perfect penmanship under
judgment. Alufim has lookalike sets (`LETTER_CONFUSE`) for reading taps, but no writing-oriented
kinds and no sofit curriculum (sofit glyphs appear only as distractors today).

A handwriting-recognition minigame would fight the product principles: noisy input, false
“wrong”s, and motor frustration. This proposal is intentionally **recognition + guided form**,
not OCR.

## Proposed feature

Optional kinds (or a soft “צורת אות” mode) on the Hebrew literacy game:

1. **Form match** — show a target letter in a friendly print style; child picks the same
   letter among rotated/similar shapes (still RTL print letters, not mirror puzzles that
   confuse directionality).
2. **Sofit pairs** — “איפה המם הסופית?” / match מ↔ם, נ↔ן, פ↔ף, כ↔ך, צ↔ץ with audio names;
   easy band only introduces one pair at a time.
3. **Stroke demo + tap checkpoints** — short animated stroke order for a letter; child taps
   2–3 glowing dots **in order** along the path (coarse motor), or simply watches and then
   picks the letter. Success is sequence/identity, never pixel-perfect tracing.
4. Later (only if playtests ask): finger-trace with a **very wide** path and always-gain-XP
   completion even on messy traces — still no shape scoring.

All prompts spoken; no “write with a pencil on paper” requirement inside the app.

## Grounding

- Visual discrimination is already part of literacy in `LETTER_CONFUSE`; this makes form an
  explicit, teachable step (same discrimination-learning idea as
  [game-variety](../knowledge/educational/game-variety.md)).
- Aligns with [no-time-pressure-no-fomo](../knowledge/educational/no-time-pressure-no-fomo.md):
  writing readiness cannot be timed or “lives”-gated.
- [Audio-first](../knowledge/educational/audio-first.md): form work stays accessible to
  children who cannot read instructions.
- Names a writing-readiness angle that the brain does not yet record: **pre-writing / fine-motor
  scaffolding** without assessment anxiety.

## Rough scope

- Sofit metadata next to `FIND_LETTERS` (or in `hebrewLiteracy.ts`).
- Lightweight stroke paths as data (SVG point lists) for a handful of high-value letters first
  (e.g. י, ו, ל, א) — not all 22 on day one.
- UI component for stroke demo + ordered taps; reuse choice grid for match/sofit.
- Vitest for sofit pairing and checkpoint order helpers.

## Watch-outs

- **Do not** ship handwriting OCR or percentage-score tracing — false negatives punish effort
  and break [always-gain-xp](../knowledge/educational/always-gain-xp.md) emotionally even if XP
  is granted.
- Avoid mirror-image “gotcha” tasks that undermine RTL direction sense.
- Stroke data is content: keep it data-driven and small; don’t block the whole Hebrew game on
  full alphabet animations.
- Sofit should be taught as “same letter, end-of-word clothes,” not as five scary new letters.
- Golden rule: no new save fields required for v1 (curriculum flags only if parent toggle is
  needed).
