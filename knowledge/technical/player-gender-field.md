---
id: player-gender-field
title: Profile gender field with additive migrate
status: accepted
date: 2026-07-22
tags: [state, profile, migration]
supersedes: []
related: [state-persistence, zustand-store, player-gender-accent]
---

# Profile gender field with additive migrate

## Context

Question UI accents need a per-profile boy/girl flag without breaking
`alufim_state_v2` for existing saves.

## Decision

Add `gender: "boy" | "girl"` on `Profile`. `migrateProfile` fills missing values via
`normalizeGender` (explicit value, else Ellie/Nova names → girl, else boy). Seeds and
the profile editor draft/save path include the field. `KidButton` accepts `tone` for
answer/speak variants.

## Why

Additive field + migrate keeps the golden rule: same key and compatible JSON; old
profiles gain a default without a new storage key.

## Alternatives rejected

- **Infer only from avatar photo** — fragile once parents change the picture.
- **New localStorage key** — orphans existing progress.

## Consequences

Any code constructing a `Profile` must set or migrate `gender`. UI that themes
question controls should read `profile.gender` (default `"boy"`).
