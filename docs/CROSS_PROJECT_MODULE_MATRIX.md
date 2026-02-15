# Cross-Project Module Matrix (Systematic Inventory)

Last updated: 2026-02-14
Scope root: `C:\Users\richa\projects\Mohn_Empire`

Goal: list reusable module families found in each project so we can unify once and reuse everywhere.

## Projects Scanned
- FlamingSocialMedia
- MohnMatrix
- MohnMenu
- MohnMint
- MohnMove
- MohnPay
- MohnServe
- MohnSters
- NeighborTechs

## Module Family Presence by Project

Legend: ✅ present

| Module Family | FlamingSocialMedia | MohnMatrix | MohnMenu | MohnMint | MohnMove | MohnPay | MohnServe | MohnSters | NeighborTechs |
|---|---|---|---|---|---|---|---|---|---|
| Auth Context + Login Modal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Provider Shell / App Providers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cart / Order Flow UI | ✅ | ◐ | ✅ | ◐ | ✅ | ✅ | ✅ | ◐ | ◐ |
| Payment Modal / Checkout UI | ✅ | ✅ | ✅ | ◐ | ✅ | ✅ | ◐ | ◐ | ✅ |
| Stripe Server/Client Integration | ◐ | ✅ | ✅ | ◐ | ✅ | ✅ | ◐ | ✅ | ✅ |
| Delivery / Dispatch / Tracking Maps | ◐ | ✅ | ✅ | ◐ | ✅ | ◐ | ✅ | ◐ | ✅ |
| Domain + SEO (robots/sitemap/SEO APIs) | ✅ | ✅ | ✅ | ◐ | ✅ | ✅ | ◐ | ◐ | ✅ |
| Offerwall / Rewards Engine | ✅ | ✅ | ✅ | ✅ | ◐ | ✅ | ◐ | ◐ | ◐ |
| Real-time / Live Operations | ◐ | ✅ | ✅ | ◐ | ✅ | ◐ | ✅ | ◐ | ✅ |
| Admin / Support / Monitoring | ◐ | ✅ | ✅ | ◐ | ✅ | ✅ | ✅ | ◐ | ✅ |
| Notifications / Messaging | ✅ | ◐ | ◐ | ◐ | ◐ | ✅ | ✅ | ◐ | ✅ |
| Background Check / Compliance | ◐ | ◐ | ✅ | ◐ | ◐ | ◐ | ✅ | ◐ | ✅ |
| Webhooks + Backend Integrations | ◐ | ✅ | ✅ | ✅ | ◐ | ✅ | ◐ | ◐ | ◐ |

Notes:
- `◐` means partial or feature-specific implementation.
- Matrix based on module-candidate files and route/API surface in each project.

## High-Overlap Reusable Core (Build First)
1. Identity Core (`auth-context`, `login modal`, `api auth`, `auth fetch`)
2. Payments Core (`stripe`, payment-intent, wallet abstractions)
3. Tracking Core (`map`, GPS, driver/customer tracking hooks)
4. SEO + Domain Core (`robots/sitemap`, domain resolver, DNS flow)
5. Notifications Core (email/push/in-app eventing)
6. Support/Admin Core (ticket, escalation, audit actions)

## Candidate Shared Package Names
- `@mohn/core-auth`
- `@mohn/core-payments`
- `@mohn/core-tracking`
- `@mohn/core-seo-domain`
- `@mohn/core-notifications`
- `@mohn/core-admin-support`
- `@mohn/core-offerwall`
- `@mohn/core-compliance`
- `@mohn/core-ui-primitives`
- `@mohn/core-types`
