---
id: target-age-range
title: The audience is 3–8 year olds, and features must span that whole range
status: accepted
date: 2026-08-01
tags: [product, audience, scope]
related: [audio-first, right-sized-difficulty, parent-tuned-difficulty-bands, faded-scaffold-ladder, sound-before-symbol, start-from-first-form]
---

# The audience is 3–8 year olds, and features must span that whole range

## Problem

The target age was never written down. It lived only as implications scattered through the code and
the brain — "pre-readers" in [audio-first](../educational/audio-first.md), "preschooler-fair" in the
runner tuning, three difficulty levels with no stated endpoints. So every new feature re-litigated
the same question, usually by silently assuming a five-year-old, and proposals kept capping their
ambition ("this is probably too advanced") without a reference point to check against.

## Decision

**Alufim targets children aged 3 to 8.** A feature is not finished when it works for the middle of
that range; easy must be genuinely playable by a three-year-old and hard must still be worth an
eight-year-old's time.

Concretely, the range splits roughly into three, which is what the existing difficulty levels should
mean:

- **3–4** — no reading, low touch precision, very short attention. Big targets, spoken everything,
  free exploration, no symbols at all.
- **5–6** — names and sounds, short symbol sequences, simple written marks. The band most of the
  current content is tuned for.
- **7–8** — real reading, multi-step tasks, abstract notation. Genuine challenge, not decorated
  repetition.

There is no adult mode. A parent learning alongside their child uses the child's ladder; that is a
supported way to play, not a separate product.

## User impact

- A three-year-old can open the app and succeed without help on the easiest band.
- An eight-year-old finds something in `hard` that is actually hard, instead of aging out.
- New feature proposals size themselves against a stated range rather than a guessed one. Rungs that
  looked "too advanced for the audience" — musical staff reading, chord shapes, Hebrew syllables —
  are in scope at the top of the range, so ladders can be designed end to end instead of truncated.

## Trade-offs

- **A five-year span is wide.** Nearly every feature needs at least three real difficulty bands, not
  a token easy/medium/hard, and that multiplies content and playtesting work. The existing
  [audit-medium-hard-levels](../../backlog/audit-medium-hard-levels.md) backlog item becomes more
  important, not less.
- Some mechanics cannot honestly stretch the whole range and should not try. A dense 12-key keyboard
  is unusable at three; a five-key one is trivial at eight. The answer is that the *instrument*
  grows with the band, not that we pick a middle and disappoint both ends.
- Rejected: narrowing to 4–6 to keep it simple. It would have forced us to cap ladders early, which
  is precisely the truncation that makes an educational app disposable after a year.
- The animal-raising frame has to keep working for an eight-year-old. That is a real risk and worth
  watching before it is worth solving.

## Signals to watch

- A three-year-old needing a parent's hands on the easiest band means easy is not easy enough.
- An eight-year-old finishing an animal without a single failed attempt means hard is decoration.
- Proposals that say "probably too advanced for this age" without naming which sub-band they mean —
  a sign this decision is not being used.
