---
id: i18n-locale-files
title: All copy lives in i18next-format locale files, read through a typed t()
status: accepted
date: 2026-09-24
tags: [technical, i18n, copy]
supersedes: []
related: [pre-recorded-voice]
---

# All copy lives in locale files

## Context

Hebrew copy was hard-coded across components, providers, data tables and the store.
Changing a line meant hunting for it, a second language was impossible, and there was
no way to see which spoken lines had changed and needed a new recording.

## Decision

- Every piece of copy — on-screen and spoken — lives in
  [`web/locales/he.json`](../../web/locales/he.json): nested keys, `{{name}}`
  placeholders (i18next JSON v4). A language is one more file beside it.
- Code reads it with `t(key, params)` from [`web/lib/i18n.ts`](../../web/lib/i18n.ts).
  Keys are typed from the JSON, so a missing key fails `tsc`. `tGroup` reads a group
  (praise lines, mission successes) in file order.
- Data tables that expose copy keep their shape through getters
  (`get title() { return t("games.add.title") }`), so callers are unchanged and the
  text is resolved at read time, not frozen at import.
- **Content stays in `data/`:** word lists, letters, number words, character names and
  minigame skin prompts are content, not copy. Localising them later means per-language
  fields there.

## Why

One file makes copy reviewable in a diff and gives translators a standard format.
i18next's syntax means adopting the library later changes no file. A 60-line helper
was enough; the library itself adds nothing a single-language static app needs yet.

## Alternatives rejected

- **i18next / next-intl now** — plural rules, namespaces and loaders the app doesn't use
  yet; static export and client-only rendering make the tiny helper sufficient.
- **Flat dotted keys** — i18next reads `a.b` as a path, so flat keys would break the
  drop-in promise.

## Consequences

- Hebrew grammar that depends on a number (gendered numerals, "ל־שבע חברים") is still
  assembled in code; a second language will need ICU plurals or per-locale helpers.
- `<html lang dir>` comes from `LOCALE_META`; switching locale at runtime would also need
  a re-render trigger, which does not exist yet.
