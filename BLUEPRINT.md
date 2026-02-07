# MohnMenu Platform Blueprint

> **Last Updated:** February 7, 2026  
> **Live URL:** https://mohnmenu.com  
> **Hosting:** Firebase App Hosting (us-east4)  
> **Repo:** Richard-Mohn/Mohn-Menu (auto-deploys from `main`)

## 1. Project Overview

**Mission:** To build a world-class, commission-free SaaS ordering platform for local businesses (MohnMenu), empowering them to streamline their ordering systems, enhance customer experience, and enable new revenue streams through integrated delivery, advanced features, and a fair pricing model. 

The core principle is **100% Profit for the Business**. MohnMenu offers a superior, commission-free alternative to high-cost delivery platforms (DoorDash, UberEats, etc.) with a flat monthly subscription instead of per-order commissions.

**Key Features:**

*   **Commission-Free Ordering:** Unlimited menu items, professional digital storefront, zero per-order fees.
*   **White-Label Website Builder:** Wizard-driven auto-generation of SEO-optimized business websites.
*   **GPS Fleet Tracking:** Real-time GPS tracking for in-house delivery fleets.
*   **"Chef's Eye" Live Cam:** Multi-source live streaming — IP cameras (MJPEG/HLS), phone cameras, Surface Pro, webcams.
*   **Kitchen Display System (KDS):** Real-time order management for kitchen staff.
*   **Multi-Payment:** Stripe (Apple Pay, Google Pay, cards) + cryptocurrency (NOWPayments).
*   **Fraud & Chargeback Protection:** Enterprise-grade security and revenue protection.
*   **Owner Dashboard:** Business intelligence, analytics, menu management, staff management.
*   **Tenant Analytics Dashboard:** Google Search Console + GA4 traffic analytics (Growth+ tiers).
*   **Real-Time Visitor Dashboard:** Live visitor count, active pages, devices (Professional tier).
*   **Auction & Bidding Platform:** Real-time bidding for antique shops, collectibles, and specialty stores.
*   **Driver Dashboard:** Mobile-first delivery management with real-time tracking.
*   **Customer Order Tracking:** Real-time status updates and delivery maps.
*   **Quick Order Modal:** Streamlined ordering for returning customers.
*   **Inventory Tracking:** Real-time stock management with low-stock alerts.
*   **13 Business Types:** Restaurant, bakery, café, food truck, grocery, bar, nightclub, convenience store, retail, ghost kitchen, catering, juice bar, ice cream shop.
*   **Comprehensive SEO Engine:** Auto-generated metadata, JSON-LD, sitemaps, location pages, service pages.

## 2. Tech Stack

*   **Frontend (Customer & Admin/Driver):**
    *   **Framework:** Next.js 16.1.6 (App Router, SSR + ISR)
    *   **Styling:** Tailwind CSS v4 (using new `@import` engine)
    *   **Animations:** Framer Motion
    *   **3D Elements:** Three.js, @react-three/fiber, @react-three/drei
    *   **Icons:** react-icons (Fa, etc.)
    *   **Payments:** Stripe JS (Elements, Apple/Google Pay) + NOWPayments (crypto)
    *   **Maps:** Leaflet + OpenStreetMap
    *   **Analytics:** GTM (`GTM-P4KZDZQP`) → GA4 (`G-LQC1CSJGP6`)
    *   **Server Analytics:** Google APIs (`googleapis@144`) — Search Console API, Analytics Data API, URL Inspection API
*   **Backend (API & Cloud Functions):**
    *   **Framework:** Node.js 22 runtime
    *   **Serverless:** Firebase Cloud Functions (Gen 2)
    *   **Secrets:** Google Secret Manager (Stripe, NowPayments)
*   **Infrastructure:**
    *   **Hosting:** Firebase App Hosting (us-east4, auto-deploy from GitHub `main`)
    *   **Database:** Firebase Firestore (businesses, orders, users, menus, inventory)
    *   **Realtime DB:** Firebase RTDB (live orders, driver GPS, KDS)
    *   **Auth:** Firebase Authentication (email/password, Google, multi-role: customer/owner/driver)
    *   **Storage:** Firebase Storage (logos, images)
*   **SEO:**
    *   **Metadata:** Per-page via layout.tsx (server component pattern)
    *   **JSON-LD:** Organization, SoftwareApplication, WebSite, Product, FAQPage, BreadcrumbList, LocalBusiness, Restaurant, Service, Menu, GeoCoordinates
    *   **Sitemaps:** Chunked XML (static pages + per-business dynamic pages)
    *   **City Data:** 135,135 US places from OpenStreetMap (`data/us-cities.json`)

## 3. Pricing Model (Live — Subscription SaaS)

All plans include 14-day free trial. Zero per-order commissions.

1.  **Starter ($19.99/mo):** 
    *   Unlimited Menu Items
    *   White-Label SEO Website (auto-generated)
    *   Service & Location Pages
    *   JSON-LD Structured Data
    *   Sitemap Auto-Submission
    *   Card Payments (Stripe)
    *   Crypto Payments (NOWPayments)
    *   Cash Toggle
    *   QR Code Ordering
    *   Quick Order Modal
    *   Fraud Protection
    *   Basic Sales Dashboard
    *   Order Analytics
2.  **Growth ($49.99/mo):**
    *   Everything in Starter, plus:
    *   Kitchen Display System (KDS)
    *   Real-Time Order Tracking
    *   Sales & Product Analytics
    *   SEO Impressions & Clicks Dashboard
    *   Top Search Queries
    *   Traffic Source Breakdown
    *   Device & Geography Analytics
    *   Daily Traffic Charts
    *   Custom Domain Support
3.  **Professional ($99.99/mo):**
    *   Everything in Growth, plus:
    *   GPS Fleet Tracking
    *   "Chef's Eye" Live Cam (multi-source: IP camera, phone, webcam)
    *   Driver Dispatch System
    *   Dedicated GA4 Property
    *   Real-Time Visitor Dashboard (live active users, pages, sources)
    *   Full Search Console Data
    *   Auction & Bidding Platform (Beta)
    *   Export Reports (CSV/PDF)
    *   Advanced Reporting
    *   Priority Support

## 4. User Personas & Dashboards

*   **Customer:** Browses menu, places secure upfront orders, tracks delivery with GPS, watches Chef Cam.
*   **Owner (Command Center):** Manages menu, staff, and marketing. Views real-time revenue and growth analytics.
*   **Driver (Fleet View):** Receives automated assignments, navigates via GPS, and completes deliveries.
*   **Manager:** Sub-role of Owner with access to daily operations and order fulfillment.

## 5. Implementation Status

### Completed ✅

**Core Platform:**
- [x] Homepage with animated background, pricing cards, CTA sections
- [x] Firebase App Hosting with auto-deploy from GitHub `main` branch
- [x] Multi-role authentication (customer, owner, driver) with Firebase Auth
- [x] Global AuthModal system (consolidated in `context/AuthModalContext.tsx`)
- [x] Protected routes with role-based redirects
- [x] Stripe payment integration (cards, Apple Pay, Google Pay)
- [x] NOWPayments crypto integration (BTC, ETH, USDT, SOL, etc.)
- [x] Cash payment toggle

**Business Onboarding:**
- [x] WebsiteBuilder wizard (multi-step: business info → menu → customization → services → locations → review)
- [x] 13 business types supported in onboarding
- [x] Auto-generated SEO website pages per business
- [x] Demo business seeding (China Wok RVA)
- [x] Starter menu templates for all business types

**Customer Experience:**
- [x] Menu browser with categories, dietary filters, search
- [x] Shopping cart with quantity management
- [x] Quick Order modal for returning customers
- [x] Order placement with delivery/pickup options
- [x] Real-time order tracking page
- [x] Customer order history

**Owner Dashboard:**
- [x] Order management with status updates
- [x] Menu management (CRUD)
- [x] Inventory tracking with low-stock alerts
- [x] Revenue analytics
- [x] Business settings

**Operations:**
- [x] Kitchen Display System (KDS) with real-time order queue
- [x] Driver assignment UI
- [x] GPS tracking with Leaflet maps
- [x] Chef Camera streaming component (multi-source: HLS, browser webcam, MJPEG IP cam, snapshot)
- [x] Chef Cam setup page with multi-camera management, device detection, IP camera guides
- [x] Auction & Bidding system (real-time Firestore, bid history, countdown, buy-now, reserve price)
- [x] Owner auction management (create/edit/end auctions, stats dashboard)
- [x] Public auction browser on tenant storefront (`/{slug}/auctions`)

**Marketing Pages (7 industry landing pages):**
- [x] `/for-restaurants/`
- [x] `/for-bakeries-cafes/`
- [x] `/for-grocery-markets/`
- [x] `/for-food-trucks/`
- [x] `/for-bars-nightlife/`
- [x] `/for-convenience-stores/`
- [x] `/for-retail-shops/`

**SEO Infrastructure:**
- [x] Per-page metadata on all 17+ marketing pages (via layout.tsx)
- [x] OpenGraph & Twitter Cards on all pages
- [x] JSON-LD: Organization, SoftwareApplication, WebSite (global)
- [x] JSON-LD: Product/Offer (pricing), FAQPage (FAQ + service pages)
- [x] JSON-LD: BreadcrumbList (all pages)
- [x] JSON-LD: LocalBusiness/Restaurant (tenant homepages)
- [x] JSON-LD: Service + FAQ (tenant service pages)
- [x] JSON-LD: GeoCoordinates (tenant location pages)
- [x] JSON-LD: SoftwareApplication (industry landing pages)
- [x] Chunked XML sitemaps (static + per-business)
- [x] Robots.txt with proper rules
- [x] Canonical URLs via alternates
- [x] ISR on tenant pages (revalidate=3600)
- [x] City typeahead with 135,135 US places
- [x] Features index page (`/features/`)
- [x] 7 feature subpages in sitemap

**Other Pages:**
- [x] `/pricing/` — 3 tiers with feature comparison
- [x] `/faq/` — comprehensive FAQ
- [x] `/about/` — company info
- [x] `/contact/` — contact form
- [x] `/demo/` — demo request
- [x] `/comparison/` — vs DoorDash/UberEats/etc.
- [x] `/features/` — features index + 7 subpages
- [x] `/terms/`, `/privacy/` — legal pages

### In Progress 🔄

- [x] Google Search Console API integration (server lib + API endpoint)
- [x] Google Analytics Data API for tenant dashboards (server lib + API endpoint)
- [x] Tenant analytics dashboard (4-tab: Overview/SEO/Traffic/Live, tier-gated)
- [x] Real-time visitor dashboard (Professional tier — auto-refreshes every 30s)
- [x] Beta badges on new features (auctions, analytics tabs, chef cam)
- [ ] Custom domain support via Cloudflare
- [ ] OG image creation (`/public/og-image.png` — 1200x630)
- [ ] GA4 property ID configuration (env var `GA4_PROPERTY_ID`)
- [ ] Google Search Console site verification for mohnmenu.com

### Planned 📋

- [ ] Blog infrastructure for SEO content marketing
- [ ] Search Console site verification automation
- [ ] Export reports (CSV/PDF)
- [ ] Domain registration wizard
- [ ] "Order with Google" integration
- [ ] SMS/Email marketing automation
- [ ] Multi-location management
- [ ] Auction payment processing (Stripe integration for winning bids)
- [ ] Auto-bid / proxy bidding system
- [ ] Real-time push notifications for outbid alerts
- [ ] Chef Cam RTSP→HLS relay (nginx-rtmp proxy for IP cameras)
- [ ] Chef Cam recording & replay (VOD from live streams)
- [ ] AI-powered antique item identification (photo→description)
- [ ] Batch auction import (CSV upload for estate sales)

---

## 6. Key Files & Architecture

| File / Directory | Purpose |
|-----------------|---------|
| `app/layout.tsx` | Root layout — metadataBase, OG defaults, global JSON-LD |
| `app/page.tsx` | Homepage — hero, pricing, CTA |
| `app/[businessSlug]/layout.tsx` | Tenant layout — dynamic metadata, LocalBusiness JSON-LD |
| `app/[businessSlug]/[location]/page.tsx` | Location pages — GeoCoordinates JSON-LD |
| `app/[businessSlug]/services/[service]/page.tsx` | Service pages — Service + FAQ JSON-LD |
| `app/sitemap.ts` | Chunked sitemap generator |
| `app/robots.ts` | Robots.txt generator |
| `lib/platform-seo.ts` | Platform page metadata + JSON-LD data layer |
| `lib/tenant-seo.ts` | Tenant JSON-LD generators |
| `lib/seo-data.ts` | City/service/cuisine content generators |
| `lib/firebase.ts` | Firebase client SDK init |
| `lib/firebaseConfig.ts` | Firebase config |
| `lib/google-analytics.ts` | Server-side Google Analytics + Search Console API client |
| `lib/realtimeDb.ts` | RTDB helpers |
| `lib/nowpayments.ts` | Crypto payment helpers |
| `lib/gtag.ts` | GA4 event helpers |
| `context/AuthContext.tsx` | Firebase Auth state provider |
| `context/AuthModalContext.tsx` | Global auth modal state |
| `context/CartContext.tsx` | Shopping cart state |
| `components/GoogleAnalytics.tsx` | GTM script injection |
| `components/ChefCameraStream.tsx` | Multi-source live camera (HLS, browser, MJPEG, snapshot) |
| `components/AuctionBidding.tsx` | Auction cards, detail modal, browser, bidding UI |
| `components/WebsiteBuilder.tsx` | Multi-step business onboarding wizard |
| `components/Header.tsx` | Platform header with role-based nav |
| `app/owner/analytics/page.tsx` | 4-tab analytics dashboard (Overview/SEO/Traffic/Live) |
| `app/owner/auctions/page.tsx` | Owner auction management |
| `app/owner/chef-cam/page.tsx` | Multi-camera setup (browser, IP, HLS) |
| `app/[businessSlug]/auctions/page.tsx` | Public auction browser |
| `app/api/tenant-seo/` | API routes for Search Console, GA4, Realtime, Index Status |
| `data/us-cities.json` | 135,135 US places (OpenStreetMap) |
| `data/starterMenus.ts` | Starter menu templates for all business types |

---

## 7. Roadmap Documents

| Document | Purpose |
|----------|---------|
| `SEO_ANALYTICS_ROADMAP.md` | Detailed SEO, Analytics, Search Console, Domain management plan |
| `PLATFORM_STRATEGY.md` | Competitive analysis, market positioning, content strategy |
| `LOCL_FREEMIUM_BUSINESS_MODEL.md` | Business model details |
| `DEPLOYMENT_CHECKLIST.md` | Deployment procedures |
| `QUICKSTART.md` | Developer setup guide |

---
**Live URL:** https://mohnmenu.com
**GTM Container:** GTM-P4KZDZQP  
**GA4 Property:** G-LQC1CSJGP6
