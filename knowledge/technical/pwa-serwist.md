---
id: pwa-serwist
title: Offline play via Serwist PWA
status: accepted
date: 2026-06-22
tags: [pwa, offline, serwist, nextjs]
supersedes: []
related: [static-export-pages, nextjs-migration]
---

# Offline play via Serwist PWA

## Context

Kids play on phones and tablets, often with flaky or no connectivity. A game that only
works online is frustrating. Being a static export, Alufim can be fully cached.

## Decision

Make Alufim an installable Progressive Web App with offline support using
[Serwist](https://github.com/serwist/serwist) for the service worker, plus a web app
manifest at [`web/app/manifest.ts`](../../web/app/manifest.ts).

## Why

- Serwist is the actively maintained successor to `next-pwa` and integrates with the
  Next.js App Router.
- A static, asset-heavy game is a perfect fit for precache-and-serve offline.
- Installability gives a native-feeling, full-screen experience on mobile.

## Alternatives rejected

- **`next-pwa`** — effectively unmaintained; Serwist is its recommended replacement.
- **Hand-rolled service worker** — easy to get caching/versioning subtly wrong.
- **No offline** — poor experience for the target audience on the go.

## Consequences

- The manifest route must be static-export friendly
  (`export const dynamic = "force-static"`).
- Manifest URLs (`start_url`, icons) include the `/Alufim/` base path.
- Service worker caching means shipping updates requires cache versioning to avoid stale
  assets.
