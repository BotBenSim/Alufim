---
id: pr-preview-pages
title: Per-PR staging previews on GitHub Pages
status: accepted
date: 2026-07-21
tags: [deployment, ci, github-pages, staging]
supersedes: []
related: [static-export-pages, state-persistence, pwa-serwist]
---

# Per-PR staging previews on GitHub Pages

## Context

Production deploys to GitHub Pages from `main`. Reviewers need a public staging URL for
each open PR without standing up a second host. A repo can only have one Pages site, and
the `github-pages` environment is restricted to deploys from `main`.

## Decision

Keep a single Actions-based Pages site. On every production deploy, also build each open
same-repo PR into `/Alufim/pr/<number>/` and ship them in the same Pages artifact.

- Signal workflow [`pr-preview-signal.yml`](../../.github/workflows/pr-preview-signal.yml)
  runs on PR open/sync/close.
- Deploy workflow [`pages.yml`](../../.github/workflows/pages.yml) listens via
  `workflow_run` (main-branch context, allowed by the environment policy), rebuilds
  production from `main`, builds open PR previews via
  [`scripts/build-pr-previews.sh`](../../scripts/build-pr-previews.sh), and deploys.
- Preview builds set `NEXT_PUBLIC_BASE_PATH=/Alufim/pr/<n>` and
  `NEXT_PUBLIC_STATE_KEY=alufim_state_v2_pr_<n>` so asset URLs resolve and staging saves
  never touch production `alufim_state_v2`.
- The deploy workflow comments (and updates) the staging URL on the PR.

## Why

- One Pages site, no second repo or paid host.
- `workflow_run` satisfies the main-only environment branch policy.
- Per-PR paths let several open PRs stay online at once.
- A separate save key protects real player progress on the shared `github.io` origin.

## Alternatives rejected

- **Second GitHub repo for staging** — clearer isolation, but needs another repo/Pages
  setup; the automation token here cannot create repos.
- **Deploy-from-a-branch `gh-pages` with PR folders** — would require changing the Pages
  source away from Actions and relaxing environment settings we cannot edit from CI.
- **Overwrite a single `/stg/` slot** — simpler, but only one PR visible at a time.
- **Vercel/Netlify previews** — rejected earlier for production; same reason here.

## Consequences

- Preview URLs look like `https://botbensim.github.io/Alufim/pr/<n>/`.
- A broken PR preview build is skipped; production still deploys.
- Closing a PR triggers a redeploy that drops its `/pr/<n>/` folder.
- Fork PRs are not signaled/deployed as staging.
- `basePath` and the PWA manifest must read `NEXT_PUBLIC_BASE_PATH` at build time.
- The production service worker must network-only `/Alufim/pr/` so its `/Alufim/`
  scope does not serve stale prod assets to staging previews.
