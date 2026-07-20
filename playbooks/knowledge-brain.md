---
name: knowledge
description: Project knowledge base and decision-logging convention
kind: rule
---

This repo keeps a tool-agnostic knowledge base ("brain") in `knowledge/`, written in Open
Knowledge Format (Markdown + YAML frontmatter). The single entry point is `AGENTS.md`.

- Before making changes, read `knowledge/index.md`. It is split into three categories, each
  with its own `index.md` and `TEMPLATE.md`:
  - `knowledge/technical/` — engineering decisions (how we built it).
  - `knowledge/educational/` — learning theory behind each learning-facing feature.
  - `knowledge/product/` — UX/product decisions.
- Golden rule: never break the persisted `localStorage` key `alufim_state_v2` or its JSON
  shape. See `knowledge/technical/state-persistence.md`.
- Every learning-facing feature must be backed by a named educational theory in
  `knowledge/educational/`.
- New educational features flow through `backlog/` proposals and the `playbooks/`
  (propose -> curate -> implement); status shares one lifecycle with the knowledge base.
- When you make a significant decision, copy the matching category `TEMPLATE.md` to a new
  file, add it to that category's `index.md`, and add a dated line to the top of
  `knowledge/log.md`.
