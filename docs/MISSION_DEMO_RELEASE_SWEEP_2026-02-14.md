# Mission Plan — Demo Release Sweep + Multi-Device Role Testing

Date: 2026-02-14
Owner: Richard
Goal: Finish initial fix sweep, validate demos across multiple devices/roles, then validate test-store creation flow.

## Mission Outcome
Ship a stable demo/testing build where:
1. demo routes are complete and parity-checked,
2. role switching works across devices,
3. key feature flows pass,
4. test store creation works end-to-end.

---

## Phase 0 — Release Stabilization (Blockers First)

### 0.1 Fix hard build blockers
- Resolve ambiguous dynamic route conflict under `/track-delivery`:
  - keep one canonical route segment only (`[id]` or `[orderId]`), remove/rename the other.

### 0.2 Scope freeze for sweep
- Freeze feature additions until sweep passes.
- Focus only on:
  - build blockers
  - demo role/testing bugs
  - critical onboarding/order flow issues

### 0.3 Baseline checks
- `npm run demo:audit`
- `npx next build --webpack`
- confirm no new route collisions or runtime-fatal errors.

Exit criteria:
- Build passes.
- Demo audit remains 100/100 coverage.

---

## Phase 1 — Demo Role Test Matrix (Multi-Device)

## Devices
Use at least 4 concurrently:
- Device A: Owner/Admin role
- Device B: Staff role (bartender/cashier/barista/etc.)
- Device C: Driver role
- Device D: Customer role

Optional:
- Device E: Dispatcher/Shift Lead
- Device F: Finance/Care/Media (Shepherds Gate demo)

## Demo routes to prioritize
- `/demo/bars`
- `/demo/coffee`
- `/demo/driver`
- `/demo/roadside`
- `/demo/shepherds-gate`
- one template-based route (`/demo/pizza` or `/demo/bakery`)

## Role login validation per route
For each route above:
1. Open route on each device.
2. Use demo banner role buttons to sign in.
3. Verify redirect destination per role:
   - owner/admin -> owner dashboard surface
   - staff -> staff/workflow surface (orders/kds/staff)
   - driver -> driver dashboard
   - customer -> current demo storefront
4. Verify quick links resolve (no 404/loop).

Pass criteria:
- All role redirects valid.
- No broken quick links.
- No cross-device auth collisions beyond expected single-session behavior.

---

## Phase 2 — Shared Feature Flow Testing Across Roles

## 2.1 Order + cart + checkout flow
- Customer device: browse demo -> add items -> checkout entry.
- Owner/staff device: confirm order appears in owner/orders or relevant queue.
- Driver device: verify assignment/visibility path works.

## 2.2 Tracking flow
- Customer: opens tracking view.
- Driver: updates status/location.
- Customer: status/ETA/location updates reflected.

## 2.3 Offerwall/rewards (if enabled)
- Customer: open rewards UI.
- Validate load, event tracking, and no fatal UX errors.

## 2.4 Admin/support sanity
- Admin pages load (`/admin`, `/admin/super`, `/admin/support`).
- No route or permission regressions from recent changes.

Pass criteria:
- End-to-end order lifecycle visible to all participating roles.
- Tracking updates propagate.
- No critical console/runtime errors.

---

## Phase 3 — Test Store Creation Validation

## 3.1 New owner onboarding
- Register test owner account.
- Create test store via onboarding.
- Ensure slug generated and store accessible.

## 3.2 Core store setup sanity
- Basic settings save.
- Menu items visible/editable.
- Owner dashboard loads with store context.

## 3.3 Must-have correctness checks
- No `lat/lng = 0,0` for new stores (or flagged as known issue if geocoding not yet merged).
- Payments banner/status behavior accurate (not hardcoded).
- No blocking 404/500 in setup path.

Pass criteria:
- New test store reaches operational baseline without manual DB intervention.

---

## Daily Execution Board (Fast Mode)

### Sprint A (Today)
1. Fix build blockers.
2. Re-run build + demo audit.
3. Execute multi-device role login matrix.

### Sprint B (Immediately after)
4. Execute end-to-end feature checks (order/tracking/admin).
5. Run test store creation flow.
6. Log defects by severity.

### Sprint C (Stabilize)
7. Patch only critical/high defects.
8. Re-run targeted tests.
9. Tag candidate release build.

---

## Defect Severity Rules
- Critical: blocks login, order creation, checkout, owner visibility, or build/deploy.
- High: major role flow broken but workaround exists.
- Medium: UI/data mismatch, does not block core demo.
- Low: polish/non-blocking UX.

Release rule:
- 0 Critical
- 0 High in core paths
- Medium/Low can be queued.

---

## Test Logging Template
Use this structure per issue:
- ID:
- Route:
- Role:
- Device:
- Steps:
- Expected:
- Actual:
- Severity:
- Screenshot/Video:
- Status:

---

## Command Checklist
From `MohnMenu`:
- `npm run demo:audit`
- `npx next build --webpack`

If both pass, begin device matrix.

---

## Final Go/No-Go Gate
Go only if all are true:
- Build passes.
- Demo audit 100/100.
- Multi-device role matrix passes for priority routes.
- One new test store created successfully and usable.
- No critical/high unresolved defects.
