---
id: faded-scaffold-ladder
title: Every support must have a band where it disappears
status: accepted
date: 2026-08-01
tags: [educational, scaffolding, difficulty, anti-patterns]
theory: Faded scaffolding / expertise reversal — a prop that never fades becomes a crutch and blocks the skill it was meant to build
related: [math-visual-scaffold, right-sized-difficulty, parent-tuned-difficulty-bands, sound-before-symbol, always-gain-xp]
---

# Every support must have a band where it disappears

## Decision

Whenever we add a support that makes a task easier — colour coding, a glow or highlight showing
where to tap, a written label on an answer, a guide outline to trace, playing the audio before the
child answers — we decide **at the same time** which difficulty band removes it. A support with no
scheduled removal does not ship.

The shipped precedent is [math-visual-scaffold](math-visual-scaffold.md): add/sub bands move
`fullCount` → `countOn` → `numbers`, so the emoji quantities are a scheduled scaffold, not a
permanent feature. Any new game must declare its ladder the same way, in its
[`web/lib/difficulty.ts`](../../web/lib/difficulty.ts) bands.

## Why it helps the child

A support that stays forever stops being a scaffold and becomes the thing the child is actually
learning. The evidence for this is unusually direct:

- **Colour-coded music notation** is the best-studied case. Children like it — 65% of subjects in
  Rogers' study preferred it — but controlled studies find no significant achievement advantage
  ([Rogers, *JRME*](https://journals.sagepub.com/doi/10.2307/3344609)) and no significant effect on
  rhythm reading ([Fair, 2011](https://bearworks.missouristate.edu/theses/2672)). Most tellingly,
  [a 2020 EEG study](https://doi.org/10.1162/jocn_a_01614) found the colour-cued group reproduced
  *longer* sequences during training while the audio-only group finished with greater neural
  sensitivity to the music's structure: the visual aid improved performance and not learning.
- **Falling-note apps** (Synthesia, Simply Piano, Yousician) are criticized by teachers for
  producing players who cannot read music outside the app. Yousician's specific documented mistake
  is letting learners keep colours and labels indefinitely, as a preference.

Both cases share one shape: the prop makes the child succeed *at the task in front of them* while
quietly removing the reason to build the underlying skill. Preference is not evidence of learning —
children reliably prefer the version that teaches less.

## How it works

For each support, record three things when it is introduced:

1. **What it replaces** — which skill the child does not yet have.
2. **The band where it goes away** — a specific band index, not "later".
3. **What remains after it** — the cue the child must then use.

Worked example from the music proposal
([music-ear-and-chords-game](../../backlog/music-ear-and-chords-game.md)): the pads glow in order
during the first echo band; the glow is gone by the second band, and the child must use the sound.
The permanent identity of a pad is its position and its spoken solfège name — never its colour,
because colour is a decoration that fades, not the mapping.

Supports may be *re-enabled* by a parent for a struggling child through
[parent-tuned-difficulty-bands](parent-tuned-difficulty-bands.md). That is deliberate: fading is the
default path, not a wall. The rule is that the default fades, and the crutch is never the default.

## Watch-outs

- **A "keep hints on" toggle in the child's own UI is the Yousician failure.** Support level belongs
  to the band (parent-tunable), not to a switch the child can flip mid-run.
- Do not confuse this with punishment. Removing a support must never remove the always-win property
  ([always-gain-xp](always-gain-xp.md)); a child at a harder band still earns XP for trying.
- Colour and highlight remain legitimate as **accessibility accommodations** for a specific child.
  What is forbidden is treating them as the teaching mechanism for everyone.
- Watch for supports we did not notice we added: audio that plays before the answer is chosen,
  animations that reveal the right option, distractors so implausible that no discrimination is
  needed. Each is a scaffold and needs a fade band.
