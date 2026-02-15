# Reusable Module Catalog (Platform-Only, No Branding)

Last updated: 2026-02-14

Purpose: inventory of reusable, productized modules extracted from the current codebase so they can be ported into other websites/apps.

## 1) Identity & Access Modules
1. Auth Session Provider
2. Login/Signup Modal Controller
3. Role-Based Route Guard
4. Feature Gate Hook
5. Protected Dashboard Wrapper
6. API Auth Guard
7. Authenticated Fetch Client
8. Multi-Business Identity Context

## 2) Tenant & Business Configuration Modules
9. Business Onboarding Wizard
10. Slug Generation + Collision Check
11. Business Profile Manager
12. Service Area Configuration
13. Tier Feature Matrix
14. Tenant Navigation Shell
15. Tenant CTA Composer
16. Tenant Link Resolver

## 3) Catalog & Menu Modules
17. Menu Browser Component
18. Starter Menu Seeder
19. Menu Item CRUD Workspace
20. Menu Board Renderer
21. Kiosk Menu Mode
22. Category/Item Search UI
23. Quick Order Modal
24. Menu Availability Toggle

## 4) Ordering & Checkout Modules
25. Customer Cart Context
26. Dynamic Order Page (Tenant-Slug)
27. Stripe Checkout Intent API
28. Crypto Invoice/Payment API
29. Wallet Payment API
30. Guest/Customer Profile Binding Layer
31. Order Status Timeline Model
32. Customer Order History View

## 5) Delivery & Logistics Modules
33. Delivery Quote API
34. Delivery Create API
35. Delivery Status API
36. Delivery Webhook Handler
37. Real-Time Driver GPS Publisher
38. Real-Time Driver Tracking Hooks
39. Driver Assignment UI
40. Track-Delivery Route Module

## 6) Payments, Payouts & Billing Modules
41. Stripe Connect Account Link Flow
42. Stripe Customer Bootstrap API
43. Driver Payout API
44. Multi-Rail Payments Abstraction (Card/Crypto/Cash)
45. Crypto Gateway Client
46. Platform Fee Logic Layer
47. Payment Readiness Status Widget
48. Billing/Subscription State Model

## 7) Ops Console Modules
49. Owner Command Dashboard
50. Orders Operations Queue
51. Driver Management Console
52. Dispatch Board
53. Staff Management Console
54. Analytics Summary Dashboard
55. Settings Control Center
56. Floor Plan Operations Module

## 8) Content, SEO & Domain Modules
57. White-Label Website Builder
58. Tenant SEO Data Generator
59. Tenant Sitemap API
60. Tenant Robots API
61. Search Console Status API
62. SEO Analytics API
63. Realtime SEO Telemetry API
64. Domain Search/Purchase API
65. DNS Auto-Configuration API
66. Existing Domain Connect API
67. Programmatic Sitemap Submitter
68. Domain Resolver API

## 9) Communications, Support & Compliance Modules
69. Contact Intake Module
70. Careers + Role-Based Apply Flows
71. Dynamic Application Question Engine
72. Quick Application Modal
73. Background Check Consent Modal
74. Background Check Review Panel
75. Support Console (Ticketing)
76. Super Admin Control Surface
77. Privacy/Terms Policy Delivery Module
78. Event + Compliance Audit Trail Surface

## 10) Engagement, Realtime & Experience Modules
79. Live Stream Manager
80. Live Stream Viewer
81. Chef Camera Stream Module
82. Live Staff Activity Panel
83. Real-Time Map Component
84. Auction/Bidding Interface
85. Reservations Module
86. Entertainment/Jukebox Module
87. Offerwall Reward Engine
88. Offerwall Tracking Context
89. Loyalty Wallet Surface
90. Global Analytics Tagging Layer
91. In-App Chat Embed Module
92. Reusable Animated UI Primitives

## Recommended Packaging Strategy
- Package by domain: `auth`, `ordering`, `delivery`, `payments`, `seo`, `ops`, `compliance`, `engagement`.
- Publish each module as an internal package with strict interfaces and minimal UI coupling.
- Keep tenant/business types and payment provider adapters behind interfaces so each module ports cleanly.

## Suggested Next Step
Create `docs/MODULE_EXPORT_PLAN.md` with:
- package boundaries
- shared types contract
- dependency graph
- extraction order (high ROI first)
