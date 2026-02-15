# Demo Parity Test Harness

Last updated: 2026-02-14

## Goal
Validate that demo routes share consistent logic and only differ by front-end naming/content.

## 1) Automated Parity Audit
Run:
- `node scripts/demo-parity-audit.mjs`

Output:
- `tmp/demo-parity-report.json`

Checks performed:
1. Top-level demo route discovery from `app/demo/*/page.tsx`
2. Role-config coverage via `DEMO_ROLE_CONFIGS`
3. Template-map coverage via `TEMPLATE_PAGE_TYPES`
4. Demo index listing coverage via `app/demo/page.tsx` cards
5. Coverage percentage summary

## 2) Cross-Demo Logic Test Matrix (Manual/QA)
Use one route from each family (template-based + custom) and verify:

### A. Role Switch + Access
- Demo banner appears on all `/demo/*` routes
- Role login buttons authenticate and route correctly
- Owner role reaches owner dashboard pages
- Driver role reaches driver app
- Customer role returns to current demo route

### B. Shared Commerce Logic
- Add item to cart works
- Quick order modal works (where enabled)
- Checkout path opens correctly
- Order status/tracking links render

### C. Shared Operations Logic
- Owner order queue loads
- Staff/KDS links resolve
- Driver assignment/tracking pages resolve
- Dashboard links in quick links are valid

### D. Shared Tenant/SEO Surface
- Demo pages have valid route-level metadata
- No broken links in hero CTAs
- Demo index entries point to existing routes

## 3) Pass/Fail Definition
A demo route is "parity ready" when:
- Role config coverage exists (direct or template map)
- Index listing is intentional (listed or explicitly hidden)
- All role quick links resolve without 404
- Shared commerce and ops flows complete without logic divergence

## 4) Recommended Daily Workflow
1. Run parity audit script
2. Fix config/index mismatches
3. Run `npm run build -- --webpack` for stable local validation
4. Smoke-test 3 representative demos:
   - one template route
   - one custom route
   - one operations-heavy route (driver/roadside)

## 5) Notes
- Keep all shared logic in core modules; demo pages should only vary labels/copy/theme.
- Prefer template routes when possible to minimize drift.
