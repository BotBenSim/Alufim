---
id: player-gender-accent
title: Per-profile boy/girl accent for question buttons
status: accepted
date: 2026-07-22
tags: [product, ux, profile, theme]
related: [state-persistence, design-system, settings-sidebar]
---

# Per-profile boy/girl accent for question buttons

## Problem

Ellie and Ethan (and other kids) share the same blue answer / hear-again chrome.
Parents wanted a simple way to personalize the question UI so girls get pink accents
and boys keep the familiar blue.

## Decision

Each profile stores `gender: "boy" | "girl"`, editable in the profile settings pane
(ילד / ילדה). Question answer buttons and the hear-again control use that accent via
`KidButton` `tone`. Presets: אלי/נובה → girl, איתן/יוני → boy.

## User impact

- Parents set gender once per child; picking a photo (Ellie/Ethan/…) also sets it.
- In play, answer circles and השמע שוב are blue for boys and pink for girls.

## Trade-offs

- Per-game answer colors (orange find, green groups, pink eng) are unified under the
  gender accent so the cue is consistent.
- Old saves without `gender` migrate: Ellie/Nova names → girl, otherwise boy.

## Signals to watch

Parents asking for more theme options, or confusion if find/eng no longer look distinct.
