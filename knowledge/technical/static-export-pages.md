---
id: static-export-pages
title: Static export to GitHub Pages via Actions
status: accepted
date: 2026-06-22
tags: [deployment, ci, github-pages, nextjs]
supersedes: [public-repo]
related: [nextjs-migration, pwa-serwist, pr-preview-pages]
---

# Static export to GitHub Pages via Actions

## Context

Alufim is a client-only kids' game with no backend. It needs cheap, simple hosting and a
public URL. The project already lived on GitHub.

## Decision

Build the Next.js app as a static export (`output: export`) and deploy the generated
`web/out` directory to GitHub Pages using a GitHub Actions workflow (source set to
"GitHub Actions", not "Deploy from a branch"). The site is served under the `/Alufim/`
base path.

## Why

- No server needed — a static export is the smallest, cheapest thing that works.
- GitHub Pages is free and already tied to the repo.
- A single Actions pipeline avoids the confusion of two competing deploy sources.
- The `/Alufim/` base path matches the Pages project URL, so asset links resolve.

## Alternatives rejected

- **Deploy-from-a-branch Pages** — required committing build output; the Actions source is
  cleaner and rebuilds from source.
- **Vercel/Netlify** — great tools, but add another account/service for zero benefit here.
- **A Node server** — unnecessary; the app has no server-side needs.

## Public repository

Free GitHub Pages serves from a public repository, so the repo is public and everything in
it is world-readable. This is safe here: the app is client-only with no backend, secrets, or
API keys. The rejected alternative (private repo + paid Pages) buys nothing because nothing
is sensitive.

Corollary: never commit secrets to this repo. If a key is ever needed, route it through CI
secrets or external config, not the source tree.

## Consequences

- Dynamic Next.js routes must opt into static (e.g. `export const dynamic = "force-static"`
  on `web/app/manifest.ts`).
- All internal links and asset URLs must respect the `/Alufim/` base path.
- Running `npm run build` while the dev server is live can corrupt `.next`; clear it if the
  dev page goes blank.
- The repo must stay public (or move to paid Pages) for hosting to work.
