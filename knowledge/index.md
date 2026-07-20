---
id: index
title: Alufim Knowledge Brain
type: manifest
format: OKF/1.0
updated: 2026-07-20
tags: [manifest, index]
---

# Alufim Knowledge Brain

This is the project's "company brain": a tool-agnostic knowledge base written in
[Open Knowledge Format (OKF)](https://cloud.google.com/) style — plain Markdown files
with YAML frontmatter, stored in git. It works for humans and for any AI agent
(Cursor, Claude, Codex, …) with no runtime, database, or vendor lock-in.

## Categories

Knowledge is split by the *kind* of decision. Every file shares the same OKF core
frontmatter (`id`, `title`, `status`, `date`, `tags`); each category adds its own fields
and body sections and has its own `index.md` and `TEMPLATE.md`.

| Category | Question it answers | Index |
| --- | --- | --- |
| Technical | How we built it, at the engineering level | [technical/index.md](technical/index.md) |
| Educational | Why each feature helps kids learn | [educational/index.md](educational/index.md) |
| Product | Why the UX/flow is shaped this way | [product/index.md](product/index.md) |

`log.md` is a shared, reverse-chronological changelog across all categories.

## Golden rule

Never break the persisted localStorage key `alufim_state_v2`. Existing players carry their
save data in that exact JSON shape. See
[technical/state-persistence.md](technical/state-persistence.md).

## How to add a decision

1. Pick the category and copy its `TEMPLATE.md` to `<category>/<kebab-id>.md`.
2. Fill in the frontmatter and that category's body sections.
3. Add a row to the category's `index.md` and a dated line to the top of `log.md`.

Rule of thumb: an engineering choice goes in `technical/`; a claim about how a feature helps
learning goes in `educational/`; a choice about the user experience goes in `product/`. A
single feature may warrant a file in more than one category, cross-linked via `related`.
