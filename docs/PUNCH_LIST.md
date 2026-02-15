# MohnMenu — MVP Punch List

> **Target:** Launch with the convenience store next door  
> **Validation Plan:** Deliver on scooter, give store free website, OGAds offer wall for customer rewards  
> **Status:** Core delivery tracking + OGAds + rewards implemented; compliance and checkout hardening remain  
> **Last Updated:** 2026-02-14

---

## 🎯 Launch Strategy: Convenience Store First

1. **Walk next door** — pitch free website + ordering system
2. **They change nothing** — Stripe handles 1099-K tax reporting, they just file income as usual
3. **You deliver on scooter** — self-validate the delivery flow end-to-end
4. **OGAds Offer Wall** — customers (anyone, including people at the store) watch ads / complete offers → earn credits → spend at the store
5. **Store benefits** — they mark up items (e.g., $2 beer → $2.75 on app), make extra margin on "free" purchases
6. **You benefit** — 50-75% of ALL affiliate revenue from OGAds, plus platform fees

---

## 🔴 CRITICAL — Must Fix Before Launch

### 1. Customer Delivery Tracking Page ⭐ PRIORITY
**Status:** ✅ Implemented  
**What exists:** Driver dashboard (783 lines), realTimeTracking.ts (366 lines), trackingHooks.ts (214 lines) — all driver-side  
**What's missing:** Customer-facing page that shows:
- Real-time driver location on Mapbox map
- Animated driver marker with heading indicator  
- Live ETA countdown
- Order status stepper (Confirmed → Preparing → Ready → Out for Delivery → Delivered)
- Driver name + vehicle type
- Delivery address confirmation

**Created files:**
- `app/order/[businessSlug]/tracking/page.tsx` — Customer tracking page
- `app/track-delivery/[orderId]/page.tsx` — Direct tracking route
- `components/OrderTrackingPanel.tsx` — Shared real-time tracking UI

**Backend already done:**
- ✅ `lib/realTimeTracking.ts` — subscribeToDriverLocation(), subscribeToCourierLocation(), calculateETA()
- ✅ `lib/trackingHooks.ts` — useDriverTracking() hook with real-time location + ETA
- ✅ Firebase RTDB paths: `restaurants/{bizId}/drivers/{driverId}/location` and `couriers/{courierId}/location`
- ✅ Driver dashboard writes GPS every 1 second via watchPosition

### 2. OGAds Offer Wall Integration ⭐ PRIORITY
**Status:** ✅ Functional in MohnMenu  
**What exists in MohnMenu:**
- `lib/offerwall/offerwall-engine.ts` — payout computation engine (73 lines)
- `lib/offerwall/offerwall-tracking.ts` — role-aware tracking context
- `app/features/offerwall-rewards/page.tsx` — marketing showcase page only (NOT functional)

**What exists in MohnMint (canonical implementation):**
- `apps/webapp/components/offerwall/OGAdsOfferWall.tsx` — React component (341 lines, compact + full modes)
- `apps/webapp/app/api/offerwall/get-offers/route.ts` — Proxies to OGAds API (151 lines)
- `apps/webapp/app/api/offerwall/postback/route.ts` — Centralized postback handler (321 lines)
- `apps/webapp/lib/offerwall/site-registry.ts` — Per-site revenue splits
- `apps/webapp/lib/offerwall/types.ts` — Shared type definitions
- `apps/webapp/lib/offerwall/tracking.ts` — aff_sub builder + session IDs

**Implemented files:**
- `app/api/offerwall/get-offers/route.ts`
- `app/api/offerwall/postback/route.ts`
- `components/OGAdsOfferWall.tsx`
- `app/rewards/page.tsx`
- `lib/offerwall/ogads-types.ts`
- `lib/offerwall/ogads-tracking.ts`
- `lib/offerwall/revenue-splits.ts`

**Revenue split (founder's model):**
- Platform (founder): **50-75%** — ALWAYS the majority
- User (ad completer): 15-35% — paid as store credits 
- Business owner: 5-15% — varies by subscription tier
- Tiered by business subscription: Free tier = founder gets 75%, Premium = founder gets 50%

### 3. Onboarding Geocoding
**Status:** ✅ Implemented  
**File:** `app/onboarding/page.tsx` line ~160  
**Fix:** Use browser geolocation or geocoded coordinates to persist non-zero lat/lng during onboarding  
**Impact:** Delivery radius and ETA become usable for local rollout

### 4. Age-Restricted Commerce (Alcohol + Tobacco) ⭐ COMPLIANCE BLOCKER
**Status:** ❌ Not implemented  
**Must-have rules before launch:**
- Restricted products must require verified 21+ identity before checkout
- Delivery must require in-person ID + face check at handoff
- No unattended drop-off for restricted products
- Checkout must reject restricted items when verification is missing/expired
- Geo/time compliance checks (state/local restrictions and sale windows)

**Implementation path:**
1. Add product flags in menu items (`isRestricted`, `restrictionType`, `minAge`).
2. Add verification state on user profile (`ageVerified`, `verificationProvider`, `verifiedAt`).
3. Integrate third-party verification provider first (recommended), not custom document parsing for MVP.
4. Add driver completion guard: restricted order cannot be completed until handoff check is passed.
5. Store immutable audit events for every verification decision.

### 5. Guest Checkout
**Status:** ❌ Requires Firebase auth for card payments  
**File:** `app/order/[businessSlug]/page.tsx`  
**Fix:** Allow name + email + phone for guest orders (Stripe doesn't need Firebase auth)  
**Impact:** Convenience store customers won't want to create accounts just to order

### 6. Order Confirmation / Status Page
**Status:** ❌ No post-checkout status page  
**Fix:** After payment success, redirect to order status page showing:
- Order number + timestamp
- Items ordered
- Estimated preparation time
- Link to delivery tracking (when out for delivery)

### 7. Business Hours Enforcement
**Status:** ❌ No hours checking  
**Fix:** Check `business.hours` before allowing orders. Show "Currently Closed" banner.

---

## 🟡 IMPORTANT — Should Fix Before Launch

### 8. Push Notifications (Order Updates)
**Status:** ❌ No notification system  
**Minimum:** Toast notifications in-app when order status changes  
**Nice-to-have:** Firebase Cloud Messaging for push notifications

### 9. Order Confirmation Emails
**Status:** ❌ No transactional emails  
**Fix:** Send email via SendGrid/Resend on order placement + status updates

### 10. Menu Image Uploads
**Status:** ⚠️ Uses URL input (no file upload)  
**Fix:** Add Firebase Storage upload for menu item photos

### 11. Driver Assignment UI for Owners
**Status:** ⚠️ Partial — drivers auto-discover orders, but owner can't manually assign  
**Fix:** Add driver dispatch panel to owner dashboard

---

## 🟢 NICE TO HAVE — Post-Launch

### 12. Multi-location Support
Business owners managing multiple stores from one account

### 13. Analytics Dashboard  
Sales graphs, popular items, peak hours, customer retention

### 14. Promo Codes / Discounts
Business owners create discount codes for their menu

### 15. Customer Reviews
Star ratings + text reviews per business

### 16. Inventory Management
Track stock levels, auto-disable out-of-stock items

---

## 📁 File Reference Map

### Delivery Tracking (EXISTS — driver side only)
| File | Lines | Purpose |
|------|-------|---------|
| `lib/realTimeTracking.ts` | 366 | Core GPS tracking, RTDB read/write, ETA calc |
| `lib/trackingHooks.ts` | 214 | React hooks: useDriverTracking, useAllDrivers, useGPSTracking |
| `app/driver/page.tsx` | 783 | Driver dashboard (go online, accept orders, GPS) |

### OGAds Offer Wall (PARTIAL — needs API routes + UI)
| File | Lines | Purpose |
|------|-------|---------|
| `lib/offerwall/offerwall-engine.ts` | 73 | Payout computation engine |
| `lib/offerwall/offerwall-tracking.ts` | — | Role-aware tracking context |
| `app/features/offerwall-rewards/page.tsx` | — | Marketing page (NOT functional) |

### Order Flow (WORKING)
| File | Lines | Purpose |
|------|-------|---------|
| `app/order/[businessSlug]/page.tsx` | 2,063 | Full customer ordering (menu → cart → checkout) |
| `app/api/stripe/*` | — | Stripe Connect payments |
| `app/api/crypto/*` | — | NOWPayments crypto |

### Business Management (WORKING)
| File | Lines | Purpose |
|------|-------|---------|
| `app/owner/page.tsx` | 420 | Owner dashboard |
| `app/onboarding/page.tsx` | 565 | Business setup wizard |
| `app/[businessSlug]/page.tsx` | — | Public business storefront |

---

## 🏗️ Build Order (Sprint Plan)

### Sprint 1: "First Delivery" (This Week)
1. ~~Fix Stripe Connect link~~ ✅ DONE
2. ~~Fix hardcoded payments status~~ ✅ DONE  
3. **Build customer delivery tracking page**
4. **Fix onboarding geocoding** (lat/lng from address)
5. **Add order confirmation/status page**

### Sprint 2: "Offer Wall Revenue" (Next)
6. **Port OGAds types + tracking to MohnMenu**
7. **Build /api/offerwall/get-offers route**
8. **Build OGAdsOfferWall component for MohnMenu**
9. **Create customer rewards/wallet page**
10. **Update revenue split model** (founder 50-75%)

### Sprint 3: "Store Ready" (Launch Week)
11. **Guest checkout** (no auth required)
12. **Business hours enforcement**
13. **Basic notifications** (in-app toasts)
14. Walk next door to the convenience store

---

## 💰 OGAds Revenue Split Model

### How It Works
```
Customer watches ad / completes offer at convenience store
  ↓
OGAds pays $X to Mohn Empire affiliate account
  ↓
Revenue splits by tier:
  • Platform (founder): 50-75%  ← ALWAYS the majority
  • User (customer): 15-35%    ← credited as store balance
  • Business owner: 5-15%      ← incentive to promote offer wall
```

### Subscription Tiers
| Tier | Monthly | Platform Cut | User Cut | Business Cut |
|------|---------|-------------|----------|-------------|
| Free | $0 | 75% | 20% | 5% |
| Basic | $29/mo | 65% | 20% | 15% |
| Pro | $79/mo | 55% | 25% | 20% |  
| Enterprise | $149/mo | 50% | 25% | 25% |

### Example: $2 OGAds Payout (Free Tier Store)
- Platform (founder): $1.50
- User (customer): $0.40 → credited to their store wallet
- Business owner: $0.10

### The Convenience Store Pitch
> "People standing outside your store asking for money? Imagine them downloading the app, 
> watching some ads, earning credits, and walking in to buy something. You list a $2 beer 
> for $2.75 on the app — they pay with credits (costs them nothing), you make 75 cents 
> extra profit, and I handle everything. Stripe does your tax reporting. You change nothing."

---

## 🔑 Environment Variables Needed

```env
# OGAds (already configured in MohnMint — need in MohnMenu too)
OGADS_API_KEY=your_ogads_affiliate_id
OGADS_POSTBACK_SECRET=your_postback_secret

# Mapbox (already used in MohnMenu for maps)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Firebase (already configured)
# Stripe (already configured)
```
