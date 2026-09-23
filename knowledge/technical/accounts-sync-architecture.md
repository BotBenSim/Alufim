---
id: accounts-sync-architecture
title: Accounts, auth and sync — local-first, server as sync + entitlement layer
status: proposed
date: 2026-08-01
tags: [accounts, auth, sync, identity, server, monetization, privacy]
supersedes: []
related: [state-persistence, static-export-pages, zustand-store, per-profile-curriculum, pwa-serwist]
---

# Accounts, auth and sync — local-first, server as sync + entitlement layer

## Context

Alufim today is a purely client-side static export. All player data lives in one
`localStorage` blob under `alufim_state_v2` (`{ version, profiles[], lastProfileId }`), profile
IDs are `p{Date.now()}_{Math.random()}` strings, and there is no user, device, account or event
log anywhere in the model. See [state-persistence](state-persistence.md) and
[static-export-pages](static-export-pages.md).

We expect to eventually run a server with accounts so the product can be monetized. Nothing is
being built now, but several choices in the current data model are cheap to make today and
expensive or impossible to retrofit once real families have diverged saves across devices.
This ADR fixes the target architecture so incremental steps point the same way.

Constraints in play: the golden rule (never break `alufim_state_v2`); offline play is a shipped
promise ([pwa-serwist](pwa-serwist.md)); the users are young children, so COPPA/GDPR-K applies;
and per the workspace infra rule, any service provisioning lives in `infra/`, not here.

## Decision

**Local-first. The server is a sync target and an entitlement authority, never the source of
truth for gameplay.** The game must keep working indefinitely with no account and no network.

**Three identity layers.**

- **Account (household)** — the parent. The auth subject and the billing subject. Holds the
  only PII in the system: an email address.
- **Profile (child)** — the existing `Profile`. Stays non-PII (display name, avatar, curriculum,
  XP). Children never authenticate and never hold credentials. Profiles stand alone before an
  account exists and attach to one afterwards.
- **Installation (device)** — an anonymous UUID minted on first run, before any account.

**Auth is parent-only and passwordless**: email magic link or six-digit code, plus a long-lived
device token so a child's tablet never sees a login screen. Google/Apple sign-in may be added
later as an additional method.

**Auth data lives in a separate `alufim_identity_v1` key**, not inside `alufim_state_v2`.

**Sync is per-entity, never whole-blob**, with two merge rules:

- Profile *settings* (name, avatar, curriculum bands, minigame toggles) — last-writer-wins on
  `updatedAt`.
- Profile *progress* (XP, character forms) — monotonic merge, take the max.

**Identifier changes to make before any server exists** (all additive, all handled by the
existing `migrateProfile` pattern):

- New profile IDs use `crypto.randomUUID()`. Existing IDs are never rewritten.
- `createdAt`, `updatedAt` and a monotonic `rev` on every profile.
- An `installId` and a null-until-linked `accountId` in the identity key.
- All persistence moves behind a single storage port in `web/lib/`.

**Monetization** is a household subscription unlocking premium content for every child on the
account, sold through parent-facing Stripe Checkout on the web. The entitlement is cached
locally with an expiry and **fails open** for a grace period.

**The server is our own API service**, in its own repo with provisioning in `infra/`. The
Next.js app stays a static export.

## Why

- **Local-first preserves what already works.** Offline play, the static export and the
  zero-friction first run all survive, and the server can be built incrementally instead of via
  a flag day. It also keeps the failure mode benign: a server outage costs sync, not play.
- **Parent-as-account-holder is the compliance-safe shape.** The only record with personal data
  belongs to an adult; child records stay non-identifying. This is also the natural fit for the
  existing multi-profile-per-device model — a household with siblings.
- **Passwordless removes the worst friction for a twice-a-week app.** No password to forget, no
  reset flow to build, no credential-stuffing surface.
- **Separating the identity key from the save blob** keeps the golden-rule blob purely about
  gameplay, lets sign-out clear credentials without touching a child's progress, and means a
  future save export/transfer code cannot leak a session token.
- **Per-entity sync with monotonic progress is conflict-free where it matters.** Because
  [always-gain-xp](../educational/always-gain-xp.md) guarantees XP never decreases, taking the
  max is always correct: a stale device coming back online cannot destroy a child's work. Blob
  sync would let two devices clobber each other.
- **Timestamps cannot be retrofitted.** Once two installs have diverged without `updatedAt`,
  the history needed to merge them does not exist. Adding the fields now costs nothing and is
  the only item here that is genuinely urgent.
- **Client-generated UUIDs let the server adopt the client's ID verbatim**, removing ID
  remapping and dual-ID bookkeeping from first sync.
- **Failing open on entitlement** protects the experience that was paid for. A child on a plane
  or bad hotel wifi must not be locked out; the revenue protected by failing closed is not worth
  that, and it is consistent with [no-time-pressure-no-fomo](../educational/no-time-pressure-no-fomo.md).

## Alternatives rejected

- **Server as source of truth (online-only or online-first)** — breaks offline play, adds a
  login wall to the first run, and makes an outage a total outage.
- **Sync the whole `alufim_state_v2` blob** — last-writer-wins over the entire household means
  one stale device silently erases another child's progress.
- **Child accounts with their own credentials** — pulls children into the PII perimeter for no
  product gain, and pre-readers cannot manage credentials anyway.
- **Password-based parent auth** — worst friction and largest attack surface of the options.
- **OAuth-only (Google/Apple) at launch** — a hard provider dependency and an account-linking
  problem later; better as an additive second method.
- **Storing account/tokens inside `alufim_state_v2`** — couples credentials to the save,
  entangles sign-out with progress, and contaminates any future export.
- **Managed backend (Supabase / Clerk)** — faster to Phase 2, but a vendor dependency on the
  layer that owns customer identity and billing.
- **Fail-closed entitlement** — punishes paying families for network conditions.

## Consequences

Phasing this makes possible, in order:

0. Client-only, no server: UUIDs, `installId`, `createdAt`/`updatedAt`/`rev`, the identity key,
   and the storage port. The existing `alufimStorage` adapter is already most of the way to the
   port.
1. Export/import — a transfer code moving a save between devices by hand. No server, but it
   forces the data model to be portable and self-contained, which is the same work sync needs.
2. Accounts and real sync.
3. Entitlements and billing.

Things to watch:

- **Cookie auth wants same-site.** The app is served from `<user>.github.io/Alufim/`, which is
  cross-site from any API origin. Serving the app from a custom domain with the API on a
  sibling subdomain is a prerequisite for cookie sessions; otherwise we are on bearer tokens in
  `localStorage`, which is workable but weaker. This is a decision to make before Phase 2.
- **Per-entity sync implies an entity boundary inside the blob.** `AppState` is currently one
  object; the port should expose profile-level reads and writes so the sync layer never has to
  diff the whole state.
- **Mid-run state is ephemeral** (`RunState` is not persisted). Cross-device resume mid-game is
  out of scope and would need a new persisted run model.
- **No analytics exists today.** An append-only XP event ledger with client-generated event IDs
  would make sync idempotent and give parent reports for free, but costs storage; deferred, and
  worth revisiting at Phase 2 rather than bolting on later.
- **The golden rule still binds.** Every field above is additive and defaulted in
  `migrateProfile`, following [player-gender-field](player-gender-field.md).
