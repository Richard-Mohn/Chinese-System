# Unified Module Implementation Blueprint (Enterprise Safe Mode)

Last updated: 2026-02-14
Prepared for: 2026-02-15 execution day
Scope root: `C:\Users\richa\projects\Mohn_Empire`

## Executive Intent
Unify reusable modules across all products so changes are made once and propagated safely, while preventing accidental project-to-project drift.

## Current Baseline (Completed)
- Copy-only staging executed successfully.
- Latest audit: `C:\Users\richa\projects\Mohn_Empire\MODULE_COPY_STAGING\copy-audit-20260214-040714.csv`
- Module families: 12
- Unique module files: 165
- Total staged copy instances: 174
- Source repos modified: **No**

---

## 1) What You Are Building
A centralized shared-module system with:
1. One source-of-truth module workspace
2. Versioned package releases
3. Per-project adapter layers
4. Controlled rollout (canary/stable/hotfix)
5. Explicit lock-down controls to block accidental edits

Target outcome: update once, rollout everywhere on your schedule.

---

## 2) Architecture (Recommended)

### 2.1 Workspace Topology
Create a new workspace (no moving existing code):
- `C:\Users\richa\projects\Mohn_Empire\MohnCore`

Inside `MohnCore`:
- `packages/core-types`
- `packages/core-auth`
- `packages/core-cart-ordering`
- `packages/core-payments`
- `packages/core-tracking`
- `packages/core-seo-domain`
- `packages/core-offerwall`
- `packages/core-admin-support`
- `packages/core-compliance`
- `packages/core-notifications`
- `packages/core-live-ops`
- `packages/core-ui-shell`
- `packages/integration-test-harness`

### 2.2 Consumption Model
Each product repo keeps:
- product-specific UI skin/theme
- environment bindings
- routing composition
- business rules specific to that product

Each product repo **stops owning** shared business logic over time.

### 2.3 Event Contracts
Define typed events in `core-types`:
- `OrderCreated`
- `OrderStatusChanged`
- `PaymentAuthorized`
- `PaymentSettled`
- `DriverAssigned`
- `DeliveryStatusChanged`
- `SupportTicketCreated`
- `ComplianceStateChanged`
- `RewardGranted`

Use one typed event bus adapter per app.

---

## 3) Lock-Down Strategy (Prevent Accidental Drift)

### 3.1 Guardrail Policy
- Shared module code can only be edited in `MohnCore`.
- Product repos treat shared modules as read-only dependencies.
- Any shared logic change in product repo fails CI.

### 3.2 Branch Protection Rules
For each product repo:
- Protect `main`
- Require PR + checks
- Require “No local shared-module edits” check

### 3.3 CI Gate: Duplicate Logic Blocker
Add a CI script that fails if files matching shared-module ownership map are edited directly in product repos.

Example concept:
- If file path matches known shared domains (`auth`, `payments`, `tracking`, `seo-domain`)
- And change is not import/version bump only
- Then fail with instruction: “Edit in MohnCore package instead.”

### 3.4 Session-Level AI Guardrail Prompt
At the start of every coding session, prepend this instruction:

> SAFE MODE: Do not edit shared module logic in this product repo. Only consume existing package APIs. If shared logic changes are needed, stop and create a patch plan for MohnCore instead.

This prevents accidental cross-project divergence when using coding assistants.

---

## 4) Implementation Phases (Fast + Safe)

### Phase A — Foundation (Day 1)
1. Create `MohnCore` workspace.
2. Initialize package manager workspaces.
3. Add `core-types` package first.
4. Add semantic versioning tooling (changesets).
5. Add CI for lint/test/build/package.

Exit criteria:
- `core-types` published internally as v0.1.0
- at least one product consuming `core-types`

### Phase B — High-Risk Shared Domains (Day 1-2)
Extract and package first:
1. `core-auth`
2. `core-payments`
3. `core-tracking`
4. `core-seo-domain`

Exit criteria:
- these 4 packages consumed by MohnMenu + one additional product
- no regression in build/test matrix

### Phase C — Platform Modules (Day 2-3)
Extract:
5. `core-cart-ordering`
6. `core-admin-support`
7. `core-notifications`
8. `core-compliance`

Exit criteria:
- package docs complete
- migration guides written

### Phase D — Experience Modules (Day 3+)
Extract:
9. `core-live-ops`
10. `core-offerwall`
11. `core-ui-shell`

Exit criteria:
- canary rollout to selected sites
- visual regression checks pass

---

## 5) Release Management (Push Everywhere Safely)

### 5.1 Channels
- `canary`: immediate opt-in testing apps
- `stable`: scheduled weekly rollout
- `hotfix`: emergency patch lane

### 5.2 Versioning
- SemVer across all core packages
- changelog per package + migration notes
- lockfile refresh PR generated automatically

### 5.3 Rollout Workflow
1. Merge package change in `MohnCore`
2. Publish package version
3. Auto-open dependency bump PRs in product repos
4. Run integration tests per repo
5. Approve and merge on your schedule

### 5.4 Rollback
- Revert dependency version in product repos
- republish patch fix if needed
- no direct code rollback in 9 repos required

---

## 6) Tomorrow’s Execution Checklist (Actionable)

### Hour 1
- [ ] Create `MohnCore` workspace
- [ ] Set up workspaces + TypeScript + build tooling
- [ ] Import `core-types` from staged copy

### Hour 2
- [ ] Publish internal `core-types@0.1.0`
- [ ] Consume in MohnMenu and MohnMove
- [ ] Validate type compatibility

### Hour 3-4
- [ ] Build `core-auth` package from staged files
- [ ] Build `core-payments` package from staged files
- [ ] Add migration adapters in MohnMenu only first

### Hour 5-6
- [ ] Build `core-tracking` package
- [ ] Wire MohnMenu dispatch/tracking usage
- [ ] Build test harness cases for auth/payments/tracking

### End of day definition of done
- [ ] 3+ core packages live and consumed by at least one app
- [ ] CI guardrail active in at least one product repo
- [ ] documented migration plan for remaining repos

---

## 7) Quality Gates Before Broad Rollout
1. Contract tests pass (`core-types`)
2. Integration tests pass in at least two products
3. Security scan passes for payment/auth changes
4. Performance budget unchanged or improved
5. No product-level shared logic edits detected by CI gate

---

## 8) Risk Register + Mitigations

### Risk: Hidden product-specific assumptions in copied code
Mitigation: keep adapter layer per product; avoid forcing one-size-fits-all logic.

### Risk: Release blast radius across all websites
Mitigation: canary first, then stable wave with approvals.

### Risk: Team accidentally edits old local module copies
Mitigation: CI blocker + session guardrail prompt + ownership map docs.

### Risk: API contract drift over time
Mitigation: versioned interfaces and backward compatibility policy.

---

## 9) Practical “100% Ready” Definition
Treat 100% as operational readiness, not perfection:
- Shared modules extracted and versioned
- CI lock-down working
- Two-wave rollout proven
- Rollback tested
- Product repos consuming packages, not duplicating logic

Current readiness estimate: **72%**
Target after first execution day: **82-86%**
Target after full governance + rollout automation: **95-100%**

---

## 10) Commands You Can Reuse
Dry-run copy:
- `powershell -ExecutionPolicy Bypass -File scripts/copy-shared-modules.ps1`

Execute copy:
- `powershell -ExecutionPolicy Bypass -File scripts/copy-shared-modules.ps1 -Execute`

Audit summarize:
- `Import-Csv <audit.csv> | Group-Object ModuleId`

---

## 11) Mission Rule (Simple)
**Never patch shared logic in 9 places again.**
Patch once in `MohnCore`, release version, and roll it out with control.
