# MohnMenu — SEO, Analytics & Domain Management Roadmap

> **Last Updated:** February 6, 2026  
> **Status:** Active Implementation  
> **Owner:** Engineering + Product

---

## Table of Contents

1. [Platform SEO Strategy](#1-platform-seo-strategy)
2. [Tenant SEO Engine](#2-tenant-seo-engine)
3. [Google Search Console Integration](#3-google-search-console-integration)
4. [Google Analytics Integration](#4-google-analytics-integration)
5. [Tenant Analytics Dashboard](#5-tenant-analytics-dashboard)
6. [Domain Management & Cloudflare](#6-domain-management--cloudflare)
7. [Search Console Setup Wizard (Tenants)](#7-search-console-setup-wizard)
8. [Subscription Tier Feature Matrix](#8-subscription-tier-feature-matrix)
9. [Implementation Phases](#9-implementation-phases)
10. [Technical Architecture](#10-technical-architecture)
11. [API Reference](#11-api-reference)

---

## 1. Platform SEO Strategy

### 1.1 Target Audience

**Primary:** Small business owners actively searching for ordering/POS systems  
**Secondary:** Business owners frustrated with DoorDash/Uber Eats commissions  
**Tertiary:** Business owners wanting to add online ordering capability  

### 1.2 Keyword Strategy by Page

| Page | Primary Keywords | Search Intent |
|------|-----------------|---------------|
| **Homepage** | "commission free ordering platform", "online ordering system restaurants" | Transactional |
| **Pricing** | "restaurant ordering system pricing", "affordable restaurant POS" | Commercial |
| **Comparison** | "DoorDash alternative", "Uber Eats alternative no commission" | Commercial |
| **For Restaurants** | "online ordering system for restaurants", "restaurant delivery platform" | Commercial |
| **For Bakeries** | "bakery online ordering system", "cafe ordering platform" | Commercial |
| **For Food Trucks** | "food truck ordering system", "mobile food ordering" | Commercial |
| **For Grocery** | "grocery store ordering system", "grocery delivery platform" | Commercial |
| **For Bars** | "bar ordering system", "nightclub ordering app" | Commercial |
| **For C-Stores** | "convenience store ordering system", "corner store delivery" | Commercial |
| **For Retail** | "retail shop ordering system", "boutique online store" | Commercial |
| **For Churches** | "church management platform", "church giving and events" | Commercial |
| **For Music & Artists** | "artist merch platform", "music ticketing and livestream" | Commercial |
| **Features** | "restaurant POS features", "QR code ordering system" | Informational |
| **FAQ** | "commission free ordering FAQ", "how does MohnMenu work" | Informational |
| **Demo** | "restaurant ordering demo", "try ordering platform" | Transactional |

### 1.3 SEO Implementation Status

| Component | Status | Details |
|-----------|--------|---------|
| ✅ Per-page metadata (title, description, keywords) | **DONE** | All 17+ marketing pages via layout.tsx |
| ✅ OpenGraph tags | **DONE** | All pages have OG title, description, image, URL |
| ✅ Twitter Cards | **DONE** | `summary_large_image` on all pages |
| ✅ JSON-LD: Organization | **DONE** | Root layout (global) |
| ✅ JSON-LD: SoftwareApplication | **DONE** | Root layout (global) |
| ✅ JSON-LD: WebSite | **DONE** | Root layout (sitelinks search box) |
| ✅ JSON-LD: Product/Offer | **DONE** | Pricing page |
| ✅ JSON-LD: FAQPage | **DONE** | FAQ page + tenant service pages |
| ✅ JSON-LD: BreadcrumbList | **DONE** | All pages |
| ✅ JSON-LD: LocalBusiness/Restaurant | **DONE** | Tenant homepage |
| ✅ JSON-LD: Service | **DONE** | Tenant service pages |
| ✅ JSON-LD: GeoCoordinates | **DONE** | Tenant location pages |
| ✅ JSON-LD: SoftwareApplication (per-industry) | **DONE** | Industry landing pages |
| ✅ Robots.txt | **DONE** | Proper allow/disallow rules |
| ✅ Sitemap (chunked) | **DONE** | Static pages + per-business pages |
| ✅ Sitemap includes feature subpages | **DONE** | 7 feature subpages added |
| ✅ Canonical URLs | **DONE** | All pages via alternates.canonical |
| ✅ metadataBase | **DONE** | `https://mohnmenu.com` |
| ✅ ISR on tenant pages | **DONE** | revalidate=3600 |
| ✅ Features index page | **DONE** | `/features/` with all 7 features |
| 🔲 Create OG image (`/public/og-image.png`) | **TODO** | Need 1200x630 branded image |
| 🔲 Google Search Console verification | **TODO** | Add verification meta tag in layout.tsx |
| 🔲 Blog infrastructure | **FUTURE** | SEO content marketing |
| 🔲 Internal link optimization | **FUTURE** | Cross-page linking strategy |

### 1.4 Content Uniqueness

**Problem:** All marketing pages are `'use client'` — content renders client-side.  
**Mitigation:** Each page now has unique metadata via layout.tsx (server component).  
Google's crawler executes JavaScript, so client-rendered content IS indexed.  
**Future:** Consider converting high-value pages (homepage, pricing, comparison) to server components for guaranteed SSR content.

---

## 2. Tenant SEO Engine

### 2.1 Auto-Generated SEO Pages (Per Business)

When a business completes the WebsiteBuilder wizard, MohnMenu automatically generates:

| Page Type | URL Pattern | Count (per business) |
|-----------|-------------|---------------------|
| Homepage | `/{slug}/` | 1 |
| Menu | `/{slug}/menu` | 1 |
| About | `/{slug}/about` | 1 |
| Contact | `/{slug}/contact` | 1 |
| Service Pages | `/{slug}/services/{service}` | Up to 13 |
| Location Pages | `/{slug}/{city}-{state}` | Unlimited |

**Each page gets:**
- Unique `<title>` and `<meta description>` via `generateMetadata()`
- Unique JSON-LD (LocalBusiness, Service, FAQPage, GeoCoordinates)
- Keywords generated from business type, cuisine, city, state, and services
- OpenGraph and Twitter Cards with business logo
- Canonical URL
- Breadcrumb structured data

### 2.2 Tenant SEO Libraries

| File | Purpose |
|------|---------|
| `lib/seo-data.ts` | Content generators: 28 cuisine types, 12 store categories, 13 service templates |
| `lib/tenant-seo.ts` | JSON-LD generators: LocalBusiness, Menu, Service, FAQ, Location, Breadcrumb |
| `lib/platform-seo.ts` | Platform page metadata + JSON-LD (not for tenants) |

### 2.3 City Data for Tenant Location Pages

- **Source:** OpenStreetMap Overpass API
- **File:** `data/us-cities.json`
- **Count:** 135,135 places across all 50 states + DC
- **Types:** city, town, village, hamlet
- **Format:** `{ n: name, s: state_code, lat, lng, t: type }`
- **API:** `/api/cities?state=XX&q=searchterm` (min 3 chars, max 15 results)
- **Component:** `CityTypeahead` — state tabs + debounced search + multi-select pills

### 2.4 Tenant Sitemap Generation

Currently implemented in `app/sitemap.ts`:
- `generateSitemaps()` returns sitemap IDs (0 = static, 1+ = per-business)
- Each business gets its own sitemap chunk with all pages
- ISR revalidation every hour
- Google sitemap limits: 50,000 URLs per file (well within limits)

---

## 3. Google Search Console Integration

### 3.1 The Two Scenarios

**Scenario A: Business on MohnMenu subdirectory (mohnmenu.com/{slug})**
- MohnMenu's Search Console account covers all tenant pages
- Tenants DON'T need their own Search Console
- MohnMenu can use the Search Console API to pull data for each tenant
- Requires URL-prefix filtering in API calls

**Scenario B: Business on custom domain (theirbusiness.com)**
- Tenant needs their OWN Search Console property
- MohnMenu can help set this up via a wizard
- Two approaches:
  - **Manual:** Give them step-by-step instructions
  - **Automated:** Use Cloudflare-managed DNS where we can add the verification TXT record

### 3.2 Search Console API Integration

**Google Search Console API (v1)**
- **Auth:** Service account with delegated access, or OAuth2 for per-tenant properties
- **Key Endpoints:**
  - `searchanalytics.query` — Get click, impression, CTR, position data
  - `sitemaps.submit` — Submit sitemaps programmatically
  - `urlInspection.index.inspect` — Check page index status
  - `sites.add` — Add new site properties

**Data we can pull for tenant dashboards:**
```
- Total impressions (how many times their pages appeared in Google)
- Total clicks (how many people clicked through)
- Average CTR (click-through rate)
- Average position (ranking position)
- Top queries (what search terms bring them traffic)
- Top pages (which pages get the most traffic)
- Devices (mobile vs desktop breakdown)
- Countries (where traffic comes from)
```

### 3.3 Implementation Plan

**For mohnmenu.com/{slug} tenants (Scenario A):**

1. **MohnMenu verifies mohnmenu.com in Search Console** (one-time, manual)
2. **Create a Cloud Function / API endpoint:**
   ```
   POST /api/tenant-seo/analytics
   Body: { businessId, slug, dateRange }
   ```
3. **Function uses Search Console API with URL prefix filter:**
   ```javascript
   // Filter to only this tenant's pages
   dimensionFilterGroups: [{
     filters: [{
       dimension: 'page',
       operator: 'includingRegex',
       expression: `https://mohnmenu.com/${slug}/.*`
     }]
   }]
   ```
4. **Cache results in Firestore** (crawl data updates ~24-48 hours delayed anyway)
5. **Serve to tenant dashboard** via client-side API call

**For custom domain tenants (Scenario B):**

1. **Tenant registers domain through MohnMenu's Cloudflare integration** (see Section 6)
2. **MohnMenu automatically adds DNS records:**
   - CNAME → mohnmenu.com
   - TXT → Google Search Console verification
   - TXT → Google Analytics verification (if needed)
3. **MohnMenu creates Search Console property via API** (`sites.add`)
4. **MohnMenu submits sitemap** (`sitemaps.submit`)
5. **Data flows into tenant dashboard** same as Scenario A

### 3.4 Required Setup Steps

1. ✅ Create Google Cloud project (already have Firebase project)
2. 🔲 Enable Search Console API in Google Cloud Console
3. 🔲 Create service account with Search Console access
4. 🔲 Verify mohnmenu.com in Google Search Console
5. 🔲 Add service account as delegated user on Search Console property
6. 🔲 Store service account credentials in Firebase Secret Manager
7. 🔲 Build Cloud Function for Search Console data retrieval
8. 🔲 Build tenant dashboard component

---

## 4. Google Analytics Integration

### 4.1 Current Setup

- **GTM Container:** `GTM-P4KZDZQP`
- **GA4 Property:** `G-LQC1CSJGP6`
- **Implementation:** `components/GoogleAnalytics.tsx` + `lib/gtag.ts`
- **Events tracked:** pageview, event, ecommerce (add_to_cart, purchase, etc.)

### 4.2 Tenant Analytics Options

**Option A: Single GA4 property with custom dimensions (simpler)**
- All tenant traffic flows into MohnMenu's GA4
- Use `business_slug` as a custom dimension
- Filter by slug in dashboard
- Pro: Simple setup, one property
- Con: Data mixed together, privacy concerns

**Option B: Per-tenant GA4 properties (better for premium)**
- Create a GA4 property per tenant (Growth+ tier)
- Use Google Analytics Admin API to create properties
- Inject tenant-specific GTM/GA tag on their pages
- Pro: Clean data separation, tenants own their data
- Con: More complex, GA4 property limits

**Recommended: Hybrid approach**
- **Starter tier:** MohnMenu's GA4 with slug-based filtering
- **Growth+ tier:** Dedicated GA4 property created automatically
- **Professional tier:** Full GA4 + Search Console integration

### 4.3 Google Analytics Data API (GA4)

**API:** `google.analytics.data.v1beta`
- **runReport** — Custom report queries
- **runRealtimeReport** — Real-time active users

**Data we can pull:**
```
Realtime:
- Active users right now
- Active pages being viewed
- Active traffic sources

Historical:
- Sessions, users, pageviews
- Bounce rate, avg. session duration
- Top pages by views
- Traffic sources (organic, direct, social, referral)
- Device breakdown (mobile/desktop/tablet)
- Geographic breakdown (city, country)
- User acquisition channels
```

### 4.4 Live Traffic Dashboard (Real-Time)

Using the GA4 Realtime API, we can show tenants:
```
┌──────────────────────────────────────────┐
│  🟢 Live Visitors: 12                    │
│                                          │
│  Active Pages:                           │
│  • /china-wok-rva/ (5 users)             │
│  • /order/china-wok-rva/ (4 users)       │
│  • /china-wok-rva/services/delivery (3)  │
│                                          │
│  Traffic Sources:                        │
│  • Google Search: 7                      │
│  • Direct: 3                             │
│  • Instagram: 2                          │
│                                          │
│  Devices:                                │
│  📱 Mobile: 8  💻 Desktop: 4             │
└──────────────────────────────────────────┘
```

**Implementation:**
1. Cloud Function polls GA4 Realtime API every 30 seconds
2. Pushes to Firebase Realtime Database under `/analytics/{businessId}/realtime`
3. Tenant dashboard subscribes to RTDB path for live updates

---

## 5. Tenant Analytics Dashboard

### 5.1 Dashboard Features by Tier

| Feature | Starter ($19.99) | Growth ($49.99) | Professional ($99.99) |
|---------|:-:|:-:|:-:|
| Basic order analytics | ✅ | ✅ | ✅ |
| Revenue reports | ✅ | ✅ | ✅ |
| SEO page status (indexed/not) | — | ✅ | ✅ |
| Google impressions & clicks | — | ✅ | ✅ |
| Top search queries | — | ✅ | ✅ |
| Traffic sources breakdown | — | ✅ | ✅ |
| Device analytics | — | ✅ | ✅ |
| Live visitor count | — | — | ✅ |
| Real-time traffic dashboard | — | — | ✅ |
| Search Console full data | — | — | ✅ |
| Custom domain analytics | — | — | ✅ |
| Export reports (CSV/PDF) | — | — | ✅ |
| Custom GA4 property | — | — | ✅ |

### 5.2 Dashboard Pages (Owner Portal)

```
/owner/dashboard/analytics/          → Overview dashboard
/owner/dashboard/analytics/traffic/  → Traffic & visitors
/owner/dashboard/analytics/seo/      → SEO performance
/owner/dashboard/analytics/live/     → Real-time dashboard (Pro only)
```

### 5.3 Data Flow Architecture

```
Google Search Console API  ─┐
                            ├──→  Cloud Functions  ──→  Firestore Cache  ──→  Dashboard
Google Analytics Data API  ─┘        (hourly)           (per-tenant)        (client-side)

GA4 Realtime API  ──→  Cloud Function (30s poll)  ──→  Firebase RTDB  ──→  Live Dashboard
```

---

## 6. Domain Management & Cloudflare

### 6.1 Strategy Overview

**Goal:** Let tenants register custom domains through MohnMenu so we can manage DNS, SSL, and analytics configuration for them.

**Cloudflare approach:**
1. MohnMenu has a Cloudflare account (already exists)
2. When a tenant wants a custom domain:
   - Option A: They register through our Cloudflare reseller/API
   - Option B: They transfer their existing domain's DNS to Cloudflare
   - Option C: They point a CNAME to mohnmenu.com (simplest)

### 6.2 Cloudflare API Integration

**Required APIs:**
- `zones` — Create/manage DNS zones for custom domains
- `dns_records` — Add CNAME, TXT, A records
- `ssl/certificate_packs` — Manage SSL certificates
- `page_rules` — URL forwarding rules

**Automatic Setup Steps (when tenant enables custom domain):**
1. Create Cloudflare zone for `theirdomain.com`
2. Add DNS records:
   ```
   CNAME @ → mohnmenu.com
   CNAME www → mohnmenu.com
   TXT _google → Search Console verification
   ```
3. Enable Universal SSL (free)
4. Configure page rules for proper routing
5. Update MohnMenu's `next.config.ts` to handle the custom domain
6. Submit new sitemap for custom domain

### 6.3 Custom Domain Architecture

```
Customer visits theirdomain.com
        ↓
Cloudflare DNS → CNAME → mohnmenu.com
        ↓
Firebase App Hosting receives request
        ↓
Next.js middleware detects custom domain
        ↓
Routes to /{businessSlug}/* with x-custom-domain header
        ↓
Tenant pages render with custom domain URLs
```

### 6.4 Domain Pricing Options

| Option | Cost to MohnMenu | Price to Tenant | Notes |
|--------|-----------------|----------------|-------|
| Cloudflare Registrar | ~$10-15/yr (at-cost) | $15-25/yr | Best value |
| CNAME pointing (BYO domain) | $0 | Free | Tenant manages their own domain |
| Subdomain (slug.mohnmenu.com) | $0 | Free | No custom domain needed |

### 6.5 Required Implementation

1. 🔲 Cloudflare API integration (Cloud Function)
2. 🔲 Domain registration flow in onboarding wizard
3. 🔲 DNS configuration automation
4. 🔲 SSL certificate provisioning
5. 🔲 Next.js middleware for custom domain detection
6. 🔲 Sitemap generation for custom domains
7. 🔲 Search Console auto-verification for custom domains

---

## 7. Search Console Setup Wizard

### 7.1 For Tenants on mohnmenu.com/{slug} (Free)

**No action needed from tenant.** MohnMenu's Search Console covers all pages.

Dashboard shows:
- "Your SEO website is being indexed by Google automatically"
- "You'll start seeing impressions within 5-7 days"
- Link to their public pages

### 7.2 For Tenants with Custom Domain (Growth+ Tier)

**Guided wizard in the owner dashboard:**

```
Step 1: Enter your domain → theirdomain.com
Step 2: Choose DNS method:
        a) "Let MohnMenu manage" (Cloudflare) → Auto-setup
        b) "I'll manage my own DNS" → Show CNAME instructions
Step 3: Wait for DNS propagation (auto-check every 30 seconds)
Step 4: SSL certificate provisioned ✅
Step 5: Google Search Console verified ✅
Step 6: Sitemap submitted ✅
Step 7: "You're live! Data will appear in 5-7 days."
```

### 7.3 Analytics Tag Setup Wizard

For tenants who want their own GA4 property:

```
Step 1: "Would you like analytics tracking on your website?"
        → Included with Growth plan
Step 2: Auto-create GA4 property via Admin API
Step 3: GTM tag automatically configured
Step 4: Data streams to their dashboard
```

---

## 8. Subscription Tier Feature Matrix

### 8.1 Complete Feature Map (Updated)

| Feature | Starter ($19.99) | Growth ($49.99) | Professional ($99.99) |
|---------|:-:|:-:|:-:|
| **Ordering** | | | |
| Unlimited menu items | ✅ | ✅ | ✅ |
| White-label storefront | ✅ | ✅ | ✅ |
| Card payments (Stripe) | ✅ | ✅ | ✅ |
| Crypto payments | ✅ | ✅ | ✅ |
| Cash toggle | ✅ | ✅ | ✅ |
| QR code ordering | ✅ | ✅ | ✅ |
| Quick Order modal | ✅ | ✅ | ✅ |
| Fraud protection | ✅ | ✅ | ✅ |
| **Website & SEO** | | | |
| Auto-generated SEO website | ✅ | ✅ | ✅ |
| Service pages | ✅ | ✅ | ✅ |
| Location/city pages | ✅ | ✅ | ✅ |
| JSON-LD structured data | ✅ | ✅ | ✅ |
| Sitemap auto-submission | ✅ | ✅ | ✅ |
| Custom domain | — | ✅ | ✅ |
| **Analytics & Tracking** | | | |
| Basic sales dashboard | ✅ | ✅ | ✅ |
| Order analytics | ✅ | ✅ | ✅ |
| SEO impressions & clicks | — | ✅ | ✅ |
| Top search queries | — | ✅ | ✅ |
| Traffic source breakdown | — | ✅ | ✅ |
| Dedicated GA4 property | — | — | ✅ |
| Real-time visitor dashboard | — | — | ✅ |
| Search Console full data | — | — | ✅ |
| Export reports (CSV/PDF) | — | — | ✅ |
| **Operations** | | | |
| Kitchen Display System | — | ✅ | ✅ |
| Real-time order tracking | — | ✅ | ✅ |
| Sales & product analytics | — | ✅ | ✅ |
| GPS fleet tracking | — | — | ✅ |
| Live Chef Cam | — | — | ✅ |
| Driver dispatch | — | — | ✅ |
| Advanced reporting | — | — | ✅ |

---

## 9. Implementation Phases

### Phase 1: Platform SEO Foundation ✅ (COMPLETE)
- [x] Per-page metadata on all 17+ marketing pages
- [x] OpenGraph & Twitter Cards
- [x] JSON-LD structured data (Organization, SoftwareApplication, FAQPage, Product, BreadcrumbList)
- [x] metadataBase + canonical URLs
- [x] Robots.txt
- [x] Sitemap with feature subpages
- [x] Features index page (/features/)

### Phase 2: Tenant SEO Engine ✅ (COMPLETE)
- [x] JSON-LD on tenant homepage (LocalBusiness/Restaurant)
- [x] JSON-LD on service pages (Service + FAQPage)
- [x] JSON-LD on location pages (GeoCoordinates + LocalBusiness)
- [x] Breadcrumb structured data on all tenant pages
- [x] Enhanced generateMetadata() with auto-keywords
- [x] ISR on location + service pages

### Phase 3: Google API Setup (NEXT)
- [ ] Enable Search Console API in Google Cloud Console
- [ ] Create service account + add to Search Console
- [ ] Enable Analytics Data API in Google Cloud Console
- [ ] Store credentials in Firebase Secret Manager
- [ ] Build Cloud Function: `/api/tenant-seo/search-console`
- [ ] Build Cloud Function: `/api/tenant-seo/analytics`
- [ ] Build Cloud Function: `/api/tenant-seo/realtime`

### Phase 4: Tenant Analytics Dashboard
- [ ] Design dashboard UI (wire frames)
- [ ] Build SEO overview component (impressions, clicks, CTR)
- [ ] Build traffic sources component
- [ ] Build top queries component
- [ ] Build device breakdown component
- [ ] Build page performance component
- [ ] Build real-time visitor widget (Professional tier)
- [ ] Add tier-gating logic (Growth vs Professional features)

### Phase 5: Custom Domain System
- [ ] Cloudflare API integration
- [ ] Domain setup wizard in onboarding
- [ ] DNS management automation
- [ ] SSL provisioning
- [ ] Next.js middleware for domain routing
- [ ] Search Console auto-verification
- [ ] Per-domain sitemap generation

### Phase 6: Advanced Features
- [ ] Domain registration through MohnMenu
- [ ] Blog infrastructure for content marketing
- [ ] ROI calculator on pricing page
- [ ] Automated SEO audit reports for tenants
- [ ] Competitive analysis features

### Phase 7: Industry Expansion (Church + Music)
- [ ] Publish church and music industry landing pages with unique metadata
- [ ] Expand demo content: church projector mode, streaming hub, and role-based views
- [ ] Define keyword clusters for church and music use-cases
- [ ] Add structured data variants for non-restaurant industries

---

## 10. Technical Architecture

### 10.1 SEO Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    MOHNMENU SEO ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐     ┌────────────┐     ┌─────────────────┐   │
│  │ WebBuilder│ ──→ │  Firestore  │ ──→ │   Next.js SSR   │   │
│  │  Wizard   │     │  (business) │     │   + ISR Pages   │   │
│  └──────────┘     └────────────┘     └────────┬────────┘   │
│                                                │             │
│                                    ┌───────────┼──────────┐  │
│                                    ↓           ↓          ↓  │
│                              ┌──────────┐ ┌────────┐ ┌─────┐│
│                              │ Metadata │ │JSON-LD │ │ OG  ││
│                              │ <title>  │ │ Schema │ │Tags ││
│                              │ <meta>   │ │  Data  │ │     ││
│                              └──────────┘ └────────┘ └─────┘│
│                                    │           │          │  │
│                                    └───────────┼──────────┘  │
│                                                ↓             │
│                                         ┌─────────────┐     │
│                                         │  Sitemap.xml │     │
│                                         │  (chunked)   │     │
│                                         └──────┬──────┘     │
│                                                ↓             │
│                                    ┌───────────────────────┐ │
│                                    │    Google Crawlers     │ │
│                                    └───────────┬───────────┘ │
│                                                ↓             │
│               ┌────────────────────────────────────────────┐ │
│               │          Google Search Results              │ │
│               │  ✦ Rich snippets (FAQ, Product, LocalBiz)  │ │
│               │  ✦ Knowledge panels                        │ │
│               │  ✦ Sitelinks                               │ │
│               └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Analytics Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 ANALYTICS ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User visits tenant page                                     │
│         ↓                                                    │
│  GTM fires GA4 event with business_slug dimension            │
│         ↓                                                    │
│  GA4 collects data (pageviews, events, conversions)          │
│         ↓                                                    │
│  ┌─────────────────────┐    ┌──────────────────────┐        │
│  │ Search Console API   │    │ Analytics Data API    │        │
│  │ (impressions, clicks │    │ (sessions, pageviews  │        │
│  │  queries, position)  │    │  sources, devices)    │        │
│  └──────────┬──────────┘    └──────────┬───────────┘        │
│             ↓                           ↓                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │            Cloud Functions (Scheduled)             │       │
│  │  • Runs hourly for Growth tier                     │       │
│  │  • Runs every 30s (realtime) for Pro tier          │       │
│  │  • Filters data by business_slug / domain          │       │
│  └──────────────────────┬───────────────────────────┘       │
│                          ↓                                   │
│  ┌──────────────────────────────────────┐                   │
│  │      Firestore: /analytics/{bizId}/   │                   │
│  │  • searchConsole: { impressions, ... } │                   │
│  │  • ga4: { sessions, pageviews, ... }   │                   │
│  │  • lastUpdated: timestamp              │                   │
│  └──────────────────┬───────────────────┘                   │
│                      ↓                                       │
│  ┌──────────────────────────────────┐                       │
│  │   Firebase RTDB: /realtime/{bizId} │ ← Pro tier only     │
│  │   • activeUsers: 12                 │                     │
│  │   • topPages: [...]                 │                     │
│  └──────────────────┬─────────────────┘                     │
│                      ↓                                       │
│  ┌──────────────────────────────────────┐                   │
│  │        Tenant Owner Dashboard         │                   │
│  │  📊 SEO Performance                   │                   │
│  │  📈 Traffic Analytics                 │                   │
│  │  🟢 Live Visitors (Pro)               │                   │
│  │  🔍 Top Search Queries                │                   │
│  └──────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. API Reference

### 11.1 Existing API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/cities` | GET | Search 135K US cities for typeahead | Public |
| `/api/checkout` | POST | Process Stripe payments | Public |
| `/api/crypto/create-payment` | POST | Create crypto payment | Public |
| `/api/crypto/ipn` | POST | Crypto payment webhook | Public |

### 11.2 Planned API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/tenant-seo/search-console` | GET | Get Search Console data for a business | Owner |
| `/api/tenant-seo/analytics` | GET | Get GA4 analytics for a business | Owner |
| `/api/tenant-seo/realtime` | GET | Get real-time visitors | Owner (Pro) |
| `/api/tenant-seo/submit-sitemap` | POST | Submit sitemap to Google | Owner |
| `/api/tenant-seo/index-status` | GET | Check page index status | Owner |
| `/api/domains/check` | GET | Check domain availability | Owner |
| `/api/domains/register` | POST | Register domain via Cloudflare | Owner |
| `/api/domains/configure` | POST | Configure DNS for custom domain | Owner |
| `/api/domains/verify` | GET | Check domain verification status | Owner |

### 11.3 Firebase Secret Manager Keys (Required)

| Secret Name | Purpose |
|-------------|---------|
| `GOOGLE_SEARCH_CONSOLE_SA` | Service account JSON for Search Console API |
| `GOOGLE_ANALYTICS_SA` | Service account JSON for Analytics Data API |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for DNS management |
| `CLOUDFLARE_ZONE_ID` | Cloudflare zone ID for mohnmenu.com |
| `GA4_PROPERTY_ID` | GA4 property ID (`G-LQC1CSJGP6`) |

---

## Notes & Decisions Log

### Feb 6, 2026 — SEO Foundation Complete
- All 17+ marketing pages now have unique metadata, OG tags, and JSON-LD
- Tenant pages have LocalBusiness, Service, FAQ, and GeoCoordinates schema
- Feature index page created, all 7 subpages added to sitemap
- Decision: Use layout.tsx pattern for SEO (server component metadata wrapping client-side pages)
- Decision: Hybrid analytics approach (shared GA4 for Starter, dedicated for Pro)
- Decision: Cloudflare for domain management (at-cost registrar + DNS automation)

### Open Questions
1. Should we create a Cloudflare reseller account or use standard API?
2. GA4 property limit: Free tier allows 100 properties per account — may need GA4 360 for scale
3. Search Console API quota: 1,200 queries/day — need to batch and cache intelligently
4. Should real-time analytics use WebSocket or Firebase RTDB? (RTDB recommended for simplicity)
5. Domain pricing: Pass through at-cost or mark up for revenue?
