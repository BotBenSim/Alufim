---
name: propose-educational-features
description: Scan the knowledge brain and draft new educational feature proposals into the backlog.
kind: command
command: propose
---

# Propose educational features

You are proposing **new educational features** for Alufim, grounded strictly in the project's
knowledge brain. You draft ideas into the backlog for a human to review. **You do not
implement anything.**

## 1. Read the brain first (required)

Before proposing anything, read:

- [`knowledge/index.md`](../knowledge/index.md) — the categories and the shared status lifecycle.
- Every file in [`knowledge/educational/`](../knowledge/educational/index.md) — the child-first
  design decisions and the named theory behind each.
- [`knowledge/log.md`](../knowledge/log.md) — recent decisions, so you don't re-propose settled ones.
- The current [`backlog/index.md`](../backlog/index.md) — so you don't duplicate open proposals.

## 2. Hard constraints

- **Educational only.** Propose features that help a child learn or that improve the learning
  experience. Do NOT propose infra, refactors, or purely technical work.
- **Theory-backed.** Every proposal must name an existing theory from `knowledge/educational/`
  (e.g. Retrieval practice, Zone of Proximal Development, Self-Determination Theory). If an
  idea needs a new theory, name it explicitly and say why it belongs.
- **Golden rule.** Nothing may break or change the persisted `alufim_state_v2` localStorage
  shape. If an idea would touch saved state, call that out in Watch-outs.
- **Child-first.** Respect the existing decisions: always-gain-XP, no time pressure / no FOMO,
  audio-first, celebrate progress, right-sized difficulty. Do not propose anything that
  contradicts them without explicitly arguing why.

## 3. Output

For each idea (aim for 3–6 focused ones, quality over quantity):

1. Copy [`backlog/TEMPLATE.md`](../backlog/TEMPLATE.md) to `backlog/<kebab-id>.md`.
2. Fill in the frontmatter: `status: proposed`, `source: agent`, the `theory`, a rough
   `scope` (S/M/L), and `date`.
3. Fill the body sections: Problem/opportunity, Proposed feature, Grounding, Rough scope,
   Watch-outs.
4. Add a row to the "Proposals" table in [`backlog/index.md`](../backlog/index.md).

Then stop and summarize what you proposed for the human reviewer. Do not modify `web/` or any
`knowledge/` file — proposing is a read-of-brain, write-to-backlog task only.
