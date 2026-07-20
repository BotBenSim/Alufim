---
name: implement-proposal
description: Implement one approved backlog proposal end-to-end and graduate it into the knowledge brain.
kind: command
command: implement
---

# Implement a proposal

You implement **one** approved educational proposal from the backlog, end-to-end, and record
the decision back into the brain. Work on a single proposal per run.

## 1. Pick and lock the proposal

- Input: one `backlog/<file>.md` with `status: approved`. If the human named a file, use it;
  otherwise pick the highest-value `approved` proposal and confirm.
- Read it fully, then read the linked theory in
  [`knowledge/educational/`](../knowledge/educational/index.md) and any `related` files.
- Set the backlog file's `status: approved` -> `in-progress` before you start coding.

## 2. Build it

- Implement in [`web/`](../web/). Follow the existing architecture (see
  [`knowledge/technical/`](../knowledge/technical/index.md)):
  - Keep game-affecting logic in pure modules under `web/lib/` with **Vitest** coverage.
  - Games are pluggable providers; content/tuning lives in `data/`, not hard-coded.
- **Golden rule:** never break the persisted `alufim_state_v2` localStorage shape. If new
  saved state is unavoidable, extend additively and preserve the existing shape.
- Do not run `npm run build` while the dev server is running.
- Run `make test` (or `cd web && npm test`) and make it pass.

## 3. Graduate the decision into the brain (definition of done)

An implementation is not done until the brain is updated:

1. Copy [`knowledge/educational/TEMPLATE.md`](../knowledge/educational/TEMPLATE.md) to
   `knowledge/educational/<kebab-id>.md` with `status: accepted`, filling Decision -> Why it
   helps the child -> How it works -> Watch-outs, and naming the theory.
2. Add its row to [`knowledge/educational/index.md`](../knowledge/educational/index.md).
3. If you made engineering or UX decisions worth recording, add matching
   `knowledge/technical/` or `knowledge/product/` files and cross-link via `related`.
4. Prepend a dated one-line entry to the top of [`knowledge/log.md`](../knowledge/log.md).
5. Update the backlog file: `status: in-progress` -> `accepted`, and set its `related` to the
   new knowledge id (keep the file for traceability; do not delete it).

## 4. Wrap up

Summarize: what you built, which tests cover it, the new knowledge file(s), and the backlog
status change. One proposal per run — do not batch multiple proposals together.
