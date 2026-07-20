---
id: public-repo
title: Repo stays public for GitHub Pages
status: accepted
date: 2026-07-20
tags: [deployment, github-pages, security]
supersedes: []
related: [static-export-pages]
---

# Repo stays public for GitHub Pages

## Context

GitHub Pages on free plans serves from public repositories. We deploy Alufim to Pages, so
the repo needs to be public. A public repo raises the question: is anything sensitive
exposed?

## Decision

Keep the repository public, and treat everything committed as world-readable. No secrets,
credentials, or private keys live in the repo; the app is client-only and needs none.

## Why

- Free GitHub Pages requires a public repo (or paid tier) — public is the pragmatic choice.
- The app is a static client game with no backend and no API keys, so there is nothing
  secret to leak.
- Public source is fine, even nice, for a small educational game.

## Alternatives rejected

- **Private repo + paid Pages** — extra cost for no benefit given nothing is sensitive.
- **Separate public deploy repo** — added maintenance for no real isolation gain.

## Consequences

- Never commit secrets to this repo. If a service key is ever needed, it must go through CI
  secrets or an external config, not the source tree.
- Anyone can read and fork the code; that is acceptable and expected here.
