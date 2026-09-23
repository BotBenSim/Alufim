---
id: music-ear-and-chords-game
title: Music game — sound before symbol, on a vertical pentatonic instrument
status: accepted
date: 2026-08-01
tags: [backlog, educational, music, audio, listening, literacy]
theory: Sound before symbol (Pestalozzi → Kodály inner hearing → Gordon audiation) + systematic cumulative sequence (the phonics parallel) + landmark/intervallic reading
scope: L
source: human
related:
  - audio-first
  - game-variety
  - play-beat-minigame-variety
  - always-gain-xp
  - no-time-pressure-no-fomo
  - right-sized-difficulty
  - math-visual-scaffold
  - hebrew-writing-game
---

# Music game — sound before symbol, on a vertical pentatonic instrument

## Problem / opportunity

The app already synthesizes tones ([`web/lib/audio/characterMinigameSfx.ts`](../web/lib/audio/characterMinigameSfx.ts)
has a pure `ToneNote` model over WebAudio with a per-animal timbre) but uses sound only for
feedback and speech. No part of the game trains the ear, and nothing teaches musical reading.

Music literacy is a genuine early-childhood domain, and — critically for this project — it is
taught with **the same sequence as learning to read**. Every major method converges on
*sound → sign → theory*: Pestalozzi ("teach sounds before signs… make the child sing before he
learns the written notes"), Kodály's *inner hearing*, Gordon's *audiation*, Orff's "experience
first, then intellectualize". That is exactly systematic synthetic phonics, where phonemic
awareness precedes letter–sound mapping which precedes decodable text. Building this game well
produces a reusable ladder for the planned Hebrew reading app, not just a music feature.

## What the field actually does (investigated 2026-08-01)

**The methods.** Kodály uses movable-do solfège (do is always the tonic), Curwen hand signs whose
*height in space rises with pitch*, rhythm syllables (ta / ti-ti), and starts from a two-note
sol–mi core before expanding through la to the full pentatonic. Children learn songs by ear, then
read what they already sing. Orff puts **rhythm first** — research finds children match rhythmic
patterns before melodic ones — and removes the F and B bars from instruments so the pentatonic
scale makes every combination sound consonant and improvisation cannot be "wrong". Gordon's
Learning Sequence Activities build an aural/oral pattern vocabulary before any notation, so
reading becomes recognition of known sounds rather than decoding of abstract marks.

**The staff, when it comes.** Current pedagogy favors **landmark notes plus intervallic reading**
over mnemonics (Every Good Boy…). Mnemonics require slow indirect decoding and teach nothing about
the relationship between notes; landmark-plus-interval readers anticipate how a phrase will sound
before playing it. Note Rush is built on exactly this and fades its landmark hints over time.

**Three documented failure modes to design against:**

1. **Color-coded notation does not teach.** Kids love it — 65% of subjects in Rogers' study
   preferred it — but controlled studies find no significant achievement advantage
   ([Rogers, JRME](https://journals.sagepub.com/doi/10.2307/3344609); [Fair 2011 on rhythm
   reading](https://bearworks.missouristate.edu/theses/2672)). Worse,
   [a 2020 EEG study](https://doi.org/10.1162/jocn_a_01614) found the color-cued group reproduced
   *longer* sequences during training while the audio-only group ended with greater neural
   sensitivity to the music's structure — visual aids improved performance and not learning. Color
   is an accessibility accommodation and an engagement hook, never the load-bearing mapping.
2. **Falling notes teach following, not reading.** Synthesia, Simply Piano and Yousician are widely
   criticized for producing players who cannot read outside the app; Yousician specifically for
   letting learners keep colors and labels indefinitely. Any cue we add must be scheduled to fade.
3. **Drill without ear.** Flashnote Derby and Note Rush drill note names effectively, but they are
   supplements to a teacher, not a path from zero. Note the precedent though: Flashnote Derby added
   a no-timer practice mode, which is our no-time-pressure rule arriving from the other direction.

## Proposed feature

**The instrument is a horizontal keyboard that grows.** Keys are laid out left-to-right like a real
piano, because that is where a child who keeps going ends up, and a spatial map should never have to
be relearned. The number of keys is itself a difficulty band:

| Band | Keys | What it can do |
| --- | --- | --- |
| 1 | 5 (pentatonic: do re mi sol la) | Melody and echo. Nothing can sound wrong. Two chords only (major on do, minor on la). |
| 2 | 7 (add fa and ti) | Seven chords — enough for real songs. Dissonance now exists. |
| 3 | 12 (add the black keys) | Every major and minor chord. |

An earlier draft proposed stacking five pads **vertically** so the instrument doubled as a
proto-staff. Rejected: it buys a cute mapping for pre-readers and costs transfer to every real
keyboard. Pitch height is better shown in the *animation* — the animal jumps higher for higher
notes — which gives the same "up means higher" intuition without deforming the instrument. Real
piano teaching has always paired a horizontal keyboard with a vertical staff and children manage it.

**Each key's permanent identity is its solfège name** (movable do), spoken in the animal's voice.
Not its colour, and not its screen position, since position shifts as the keyboard grows. The name
is the one thing that survives every band, which is exactly why the methods use it.

**Two strands, rhythm leading**, since rhythmic ability develops first:

- *Rhythm strand:* tap back a clapped pattern → same with ta / ti-ti syllables → read a rhythm
  written as stick notation.
- *Pitch strand:* the ladder below.

**The ladder** (each rung removes one support):

1. **Discriminate** — higher or lower? same or different? Three animals each sing a note, then the
   king sings; pick the one that matched (the Blob Chorus mechanic, which fits our existing
   option-button UI unchanged).
2. **Echo** — play back a phrase. Starts at two notes (sol–mi), then three (add la), then five.
   Pads glow the first time only; the glow is gone by the second band. This is the rung where we
   could accidentally build Synthesia, so the fade is a hard requirement, not a setting.
3. **Name** — no glow; the animal *sings* "sol–mi–sol" and the child plays it. Solfège has become
   the child's note vocabulary.
4. **Symbol** — Kodály's own intermediate step: solfège-initial stick notation (`s m s`) with
   simple rhythm marks. A real symbol system, but one with 5 symbols instead of a staff, and one
   that is not color.
5. **Staff** — two lines, then five. One landmark pad marked; everything else read as step / skip /
   same relative to it. Direction before names, intervals before absolute pitches.
6. **Chords, taught as movable shapes** — happy or sad by ear first (major/minor as feelings, never
   as vocabulary); then press three keys at once and discover what a chord is; then learn the
   *shape* — root, skip, skip; then slide that same shape to a new starting key and hear a new
   chord; then read a written chord symbol and play it. Nobody memorizes twenty-four chords: two
   shapes times twelve starting notes covers every major and minor chord, and this rung is where
   the keyboard needs its band-2 and band-3 keys.

**Free-play instrument** as a play-beat toy: tap keys, the animal dances. No goal, no scoring, five
keys only so nothing can sound wrong. This is where a child meets the instrument before ever being
asked to echo.

**The ladder spans the audience rather than targeting its middle**
([target-age-range](../knowledge/product/target-age-range.md)). It maps onto the difficulty
machinery that already exists — a parent-chosen `level`, and three `bands` per level that ramp
inside each run (`diffParams` → `blockForStep`, four steps per band by default):

| Level (parent sets it) | Roughly | Band 0 → 1 → 2 within a run |
| --- | --- | --- |
| easy | 3–4 | rhythm tap → which animal sang → echo two notes |
| medium | 5–6 | echo three notes → sing the solfège names → stick notation (`s m s`) |
| hard | 7–8 | two-line staff → five-line staff → chord shapes |

Rungs belong to **levels**, not bands, because a level persists while bands reset every run. A child
who reads the staff should not be sent back to "which animal sang" at the start of each session; the
band ramp is a warm-up inside a rung, not the ladder itself.

## Grounding

- **Sound before symbol** is the named theory and it is the same claim as
  [audio-first](../knowledge/educational/audio-first.md), extended from speech to music.
- **The faded-support ladder** is the same structure already accepted in
  [math-visual-scaffold](../knowledge/educational/math-visual-scaffold.md) (emoji → mixed → digits)
  and maps onto the existing per-game `curriculum` bands, so a parent can hold a child at rung 2 or
  push to rung 5 via [parent-tuned-difficulty-bands](../knowledge/educational/parent-tuned-difficulty-bands.md).
- **Retrieval practice + interleaving** from [game-variety](../knowledge/educational/game-variety.md):
  echoing a phrase is auditory active recall, and it interleaves with number/word/perception work.
- **Pentatonic tuning is the no-punishment design** at band 1, not just a nicety: it is the reason
  [always-gain-xp](../knowledge/educational/always-gain-xp.md) can hold in a game about pitch. Once
  the keyboard grows to seven and twelve keys, dissonance becomes possible, so the later bands keep
  the always-win property a different way — the app names the target ("play the happy shape from
  here") instead of inviting free improvisation, and a wrong key replays rather than penalizes.
- Free-play extends [play-beat-minigame-variety](../knowledge/educational/play-beat-minigame-variety.md).

## Rough scope

- **No new dependency.** Extend the `ToneNote` + WebAudio layer in `web/lib/audio/`. Scales, phrase
  banks, chord tables, and per-animal timbres are pure data in `web/data/`
  ([data-driven-content](../knowledge/technical/data-driven-content.md)); sequencing and answer
  checking are pure functions with Vitest coverage
  ([pure-logic-in-lib](../knowledge/technical/pure-logic-in-lib.md)). Tone.js is well-adopted and
  actively maintained but is a large dependency for oscillators and envelopes we already have.
- New learning game via [game-provider-pattern](../knowledge/technical/game-provider-pattern.md):
  `GameId "music"`, provider, bands, game card.
- Rung 1 and the chord rung use the existing option-button path. Rungs 2–6 need the vertical pad
  surface — the one genuinely new piece of UI, and shared with nothing else.
- Free-play instrument as an engine + skin under `web/lib/minigames/`
  ([minigame-provider-pattern](../knowledge/technical/minigame-provider-pattern.md)).

## Watch-outs

- **The fade schedule is the product.** Every support (glow, color, letter labels) needs a band at
  which it disappears, decided up front. Yousician's mistake was making the crutch permanent and optional.
- **Audio is mandatory here, unlike everywhere else.** Muted device, silent switch, or sound off
  makes this game unplayable; it needs an explicit "turn on sound" state, must never be the only
  path to progress, and cannot be required for any unlock. iOS needs a gesture to unlock audio — the
  first pad tap should double as that.
- A deaf or hard-of-hearing child cannot play this. One option among several, never a required step.
- Don't let notes collide with spoken prompts ([`web/lib/speakPrompt.ts`](../web/lib/speakPrompt.ts));
  the two need to take turns.
- Phrase **length** is the difficulty knob, never speed. Auditory working memory at 5 is small.
- "Happy/sad", not מז'ור/מינור.
- Golden rule: `GameId "music"` adds a key to `profile.games`; additive default in
  [`web/lib/migrate.ts`](../web/lib/migrate.ts) only
  ([state-persistence](../knowledge/technical/state-persistence.md)).

## Open questions

- **Ship rhythm first?** It is developmentally earlier, needs no pitch discrimination, degrades to
  visual on a muted device, and reuses tap mechanics we already have. Likely the best first slice
  even though pitch is the more exciting demo. (Note: iOS Safari has no Vibration API, so the
  sound-off fallback is a visual pulse only.)
- Movable-do solfège (do re mi) or Hebrew/letter names? Solfège is what the methods use and what
  makes transposition and movable chord shapes work, but it is a third naming system for an Israeli
  child who will meet both דו-רה-מי and A-B-C later.
- Synthesized tones (free, already built, buzzy) or sampled instrument audio (much better for a
  music game, but real asset weight in an offline-first PWA)?
- Does the free-play toy ship first as a cheap test of whether kids enjoy the sound at all?
- How does a 12-key keyboard fit a phone in portrait without becoming untappable? Landscape, scroll,
  or a windowed octave are all plausible; this is the main open UI risk at band 3.

Resolved since the first draft: the instrument is a horizontal keyboard, not vertical pads; it grows
5 → 7 → 12 keys by band; chords are taught as movable shapes; and the ladder runs to the top rung
because 7–8 year olds are in the audience.

## Note for the planned reading app

The investigation surfaced that this ladder is nearly one-to-one with reading instruction, which
matters if a Hebrew reading app is next: phonemic awareness ↔ rung 1 discrimination; letter–sound
correspondence ↔ rung 3 naming; blending ↔ rung 2 echo; decodable texts (only taught letters) ↔
Kodály's pentatonic songs using only taught notes; **sight words ↔ landmark notes**; fluency ↔
sight reading. The same engine — a fixed inventory of atoms, a strict cumulative order, one support
faded per band — drives both. Hebrew specifics are recorded in
[hebrew-writing-game](hebrew-writing-game.md).
