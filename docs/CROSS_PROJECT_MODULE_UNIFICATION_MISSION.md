# Mission: Unified Module Architecture Across All Mohn Projects

Last updated: 2026-02-14
Status: Active / High Priority

## Mission Objective
Stop maintaining duplicate modules across 9 websites. Create one shared module system so improvements are implemented once and rolled out everywhere.

## Why This Matters
- Prevent repeated bug fixes in multiple repos
- Reduce feature drift between products
- Speed up launches for new websites
- Allow modules to communicate through one event contract

## Unified Architecture (Target State)

### 1) Shared Monorepo Module Layer
Create a shared package workspace (new repo or existing workspace) that contains reusable modules:
- `packages/core-auth`
- `packages/core-payments`
- `packages/core-tracking`
- `packages/core-seo-domain`
- `packages/core-notifications`
- `packages/core-admin-support`
- `packages/core-offerwall`
- `packages/core-compliance`
- `packages/core-ui-primitives`
- `packages/core-types`

### 2) Adapters per Product
Each site gets a thin adapter layer:
- Provider keys/env wiring
- product-specific styling tokens
- route bindings
- entitlement/tier flags

No business logic duplication in app repos.

### 3) Module Communication Standard
Use a shared event bus contract for cross-module interoperability:
- `OrderCreated`
- `PaymentAuthorized`
- `PaymentCaptured`
- `DriverAssigned`
- `DeliveryStatusChanged`
- `SupportTicketCreated`
- `UserKycStateChanged`
- `OfferRewardGranted`

Define events in `@mohn/core-types` and consume via typed publish/subscribe.

## Systematic Execution Plan

### Phase 0 — Stabilize Contracts (2-3 days)
1. Freeze domain types for users, orders, payments, delivery, tickets.
2. Define API boundaries for each core module.
3. Add versioned interface docs.

Deliverables:
- `MODULE_INTERFACES.md`
- `EVENT_CONTRACTS.md`

### Phase 1 — Extract Highest ROI Modules (Week 1)
Extract and publish first 4 modules:
1. `core-auth`
2. `core-payments`
3. `core-tracking`
4. `core-seo-domain`

Deliverables:
- package builds + semver tags
- migration adapters in each project

### Phase 2 — Cross-Project Adoption (Week 2)
Apply shared modules to:
- MohnMenu
- MohnMove
- MohnPay
- MohnMatrix

Deliverables:
- removal of duplicate local implementations
- centralized changelog for shared modules

### Phase 3 — Remaining Product Rollout (Week 3)
Adopt across:
- FlamingSocialMedia
- MohnServe
- MohnMint
- MohnSters
- NeighborTechs

Deliverables:
- all projects on common package versions
- regression checklist pass

## Governance Rules (Non-Negotiable)
1. No new duplicated core logic in app repos.
2. Shared module changes require changelog + migration note.
3. Event contracts are backward compatible or versioned.
4. Product repos own only composition and UI skin, not core logic.

## Fast Win Backlog (Do Next)
1. Build `@mohn/core-types` first and migrate all projects to it.
2. Replace duplicate auth-context/login modal implementations with `core-auth`.
3. Normalize Stripe helpers into `core-payments`.
4. Merge map/tracking hooks into `core-tracking`.

## Success Metrics
- Duplicate core files reduced by >60%
- Time to patch security/payment issue across all sites reduced to same-day
- New product bootstrap time reduced to <1 day for core features
- Module release cadence with semantic versioning and rollout notes
