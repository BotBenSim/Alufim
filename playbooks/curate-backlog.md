---
name: curate-backlog
description: Human review checklist for triaging proposed backlog items before implementation.
kind: command
command: curate
---

# Curate the backlog

A checklist for the human (or an agent assisting the human) to triage
[`backlog/`](../backlog/index.md) proposals. The goal is to move good `proposed` items to
`approved`, decline the rest, and keep the queue honest.

## For each `proposed` item, check

- **Educational?** It helps a child learn or improves the learning experience — not infra or
  pure refactor.
- **Theory-backed?** It names a real theory from
  [`knowledge/educational/`](../knowledge/educational/index.md), or makes a credible case for a
  new named one.
- **Consistent with the brain?** It does not contradict existing decisions (always-gain-XP,
  no time pressure / no FOMO, audio-first, celebrate progress, right-sized difficulty) without
  a stated argument.
- **Golden-rule safe?** It does not require breaking the `alufim_state_v2` save shape. If it
  touches saved state, the Watch-outs section says how it stays additive.
- **Scoped?** The rough scope is believable and the value justifies it.

## Decide

- Good to build now: set `status: approved`.
- Not now / not a fit: set `status: rejected` and add a one-line reason in the body.
- Replaced by a better idea: set `status: superseded` and link the replacement in `related`.
- Add your own ideas anytime: copy [`backlog/TEMPLATE.md`](../backlog/TEMPLATE.md), set
  `source: human`.

## Keep the index in sync

Update the status column in [`backlog/index.md`](../backlog/index.md) so it reflects reality.
Approved items are then ready for [`implement-proposal`](implement-proposal.md).
