/**
 * Platform SEO Data Layer — MohnMenu Marketing Pages
 * 
 * Centralized metadata, JSON-LD structured data, and keyword strategy
 * for all platform marketing pages. This ensures Google sees unique,
 * keyword-optimized titles, descriptions, and structured data on every page.
 * 
 * Target Audience: Small business owners looking for ordering systems
 * (restaurants, bakeries, food trucks, convenience stores, bars, grocery, retail)
 * 
 * Keyword Strategy:
 * - Primary: "commission-free ordering platform", "online ordering system"
 * - Secondary: Industry-specific (restaurant ordering, bakery ordering, etc.)
 * - Long-tail: "DoorDash alternative", "Uber Eats alternative no commission"
 * - Local: "{city} restaurant ordering system" (handled by tenant SEO)
 */

import { Metadata } from 'next';

const BASE_URL = 'https://mohnmenu.com';
const SITE_NAME = 'MohnMenu';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

// ─────────────────────────────────────────────────────────────────
// ORGANIZATION JSON-LD — appears on every page via root layout
// ─────────────────────────────────────────────────────────────────

export const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MohnMenu',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: 'Commission-free ordering platform for local businesses. Accept cards, crypto, and cash with zero commissions.',
  foundingDate: '2025',
  sameAs: [
    // Add social media URLs as they're created
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    url: `${BASE_URL}/contact`,
    availableLanguage: 'English',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  },
};

// ─────────────────────────────────────────────────────────────────
// SOFTWARE APPLICATION JSON-LD — for the platform itself
// ─────────────────────────────────────────────────────────────────

export const SOFTWARE_APP_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MohnMenu',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: BASE_URL,
  description: 'Commission-free online ordering platform for restaurants, bakeries, food trucks, convenience stores, and retail shops. Accept cards, crypto, and cash payments.',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '19.99',
    highPrice: '99.99',
    offerCount: 3,
  },
  featureList: [
    'Zero commission ordering',
    'Card payments via Stripe',
    'Cryptocurrency payments (BTC, ETH, LTC, DOGE)',
    'White-label branded storefront',
    'QR code ordering',
    'Real-time GPS delivery tracking',
    'Live kitchen camera streaming',
    'Kitchen Display System (KDS)',
    'Custom domain support',
    'SEO-optimized website generation',
  ],
  review: {
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5',
    },
    author: {
      '@type': 'Organization',
      name: 'MohnMenu',
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// WEBSITE JSON-LD — for sitelinks search box
// ─────────────────────────────────────────────────────────────────

export const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MohnMenu',
  url: BASE_URL,
  description: 'Commission-free ordering platform for local businesses',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// ─────────────────────────────────────────────────────────────────
// PRICING PAGE — Product/Offer JSON-LD
// ─────────────────────────────────────────────────────────────────

export const PRICING_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'MohnMenu Ordering Platform',
  description: 'Commission-free online ordering system for local businesses. Cards, crypto, cash — zero commissions.',
  brand: {
    '@type': 'Brand',
    name: 'MohnMenu',
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter Plan',
      price: '19.99',
      priceCurrency: 'USD',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/pricing`,
      description: 'Unlimited menu items, white-label storefront, card & crypto payments, QR code ordering, fraud protection.',
    },
    {
      '@type': 'Offer',
      name: 'Growth Plan',
      price: '49.99',
      priceCurrency: 'USD',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/pricing`,
      description: 'Everything in Starter plus Kitchen Display System, real-time tracking, analytics, custom domain support.',
    },
    {
      '@type': 'Offer',
      name: 'Professional Plan',
      price: '99.99',
      priceCurrency: 'USD',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/pricing`,
      description: 'Full platform with sub-second GPS fleet tracking, Live Chef Cam, driver dispatch, advanced reporting.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// FAQ PAGE — FAQPage JSON-LD
// ─────────────────────────────────────────────────────────────────

export const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is MohnMenu actually free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MohnMenu plans start at $39.99/month with a 3-day free trial. We never charge commissions on orders — you keep 100% of your revenue. All plans include unlimited menu items, card and crypto payments, QR ordering, and fraud protection.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do card payments work on MohnMenu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MohnMenu integrates directly with Stripe. When a customer pays by card, the funds go directly into your Stripe account. We never touch your revenue and never charge a commission. Stripe\'s standard processing fee (2.9% + 30¢) applies.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does crypto payment work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We use NOWPayments to generate inline payment addresses for each order. Customers can pay in Bitcoin, Ethereum, Litecoin, Dogecoin, and more. A QR code is generated at checkout that works with Cash App, Coinbase, and all crypto wallets.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I accept cash payments?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. In your MohnMenu dashboard, you can toggle cash-on-delivery with a single switch. Customers will see the cash option at checkout and pay when they receive their order.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use my own delivery drivers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. MohnMenu was built to help you manage your own delivery fleet. Our GPS module gives you sub-second real-time tracking of your drivers, so you can provide an Uber-like delivery experience without the 30% commission.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the Chef\'s Eye Cam?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Chef\'s Eye is a feature that lets you live-stream your kitchen preparation to customers while they wait for their order. The live feed appears directly on the customer\'s order tracking page — no extra apps needed.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need special hardware?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. MohnMenu is 100% browser-based and works on any device — phone, tablet, laptop, or desktop. Most businesses use an existing tablet for the Kitchen Display System (KDS).',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Order with Google?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Order with Google lets customers find your menu and place orders directly from Google Search and Google Maps. When someone searches for your business, they see an "Order Online" button that links directly to your MohnMenu storefront.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does fraud protection work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every digital transaction processed through MohnMenu is covered by our fraud protection system. If a customer files a fraudulent chargeback, we handle the dispute process at no extra cost to you.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel at any time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MohnMenu has zero contracts. All plans can be cancelled at any time from your dashboard. No cancellation fees, no lock-in periods. Every plan starts with a 3-day free trial.',
      },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// COMPARISON PAGE — JSON-LD (using Product with CompetitorProduct)
// ─────────────────────────────────────────────────────────────────

export const COMPARISON_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'MohnMenu vs DoorDash, Uber Eats & GrubHub — Platform Comparison',
  description: 'Compare MohnMenu\'s zero-commission ordering platform with DoorDash, Uber Eats, GrubHub, and other delivery platforms. See why local businesses are switching.',
  url: `${BASE_URL}/comparison`,
  mainEntity: {
    '@type': 'Product',
    name: 'MohnMenu',
    description: 'Zero-commission ordering platform for local businesses',
    brand: { '@type': 'Brand', name: 'MohnMenu' },
    offers: {
      '@type': 'Offer',
      price: '39.99',
      priceCurrency: 'USD',
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// PER-PAGE METADATA DEFINITIONS
// ─────────────────────────────────────────────────────────────────

function buildOG(title: string, description: string, path: string) {
  return {
    title,
    description,
    url: `${BASE_URL}${path}`,
    siteName: SITE_NAME,
    type: 'website' as const,
    locale: 'en_US',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
  };
}

function buildTwitter(title: string, description: string) {
  return {
    card: 'summary_large_image' as const,
    title,
    description,
    images: [DEFAULT_OG_IMAGE],
  };
}

// ── Homepage ────────────────────────────────────────────────────

export const HOME_METADATA: Metadata = {
  title: 'MohnMenu — Commission-Free Online Ordering for Local Businesses',
  description: 'MohnMenu is the ordering platform that gives restaurants, bakeries, food trucks, and stores 100% of their revenue. Accept cards, crypto, and cash — zero commissions. GPS tracking, live kitchen cameras, and more.',
  keywords: [
    'commission free ordering platform',
    'online ordering system for restaurants',
    'restaurant ordering platform no commission',
    'zero commission food ordering',
    'DoorDash alternative',
    'Uber Eats alternative',
    'restaurant ordering system',
    'white label ordering platform',
    'crypto payment restaurant',
    'QR code ordering system',
  ].join(', '),
  openGraph: buildOG(
    'MohnMenu — Commission-Free Ordering for Local Businesses',
    'Zero commissions. Cards, crypto, cash. GPS tracking. Live kitchen cameras. The ordering platform built for local businesses.',
    '/',
  ),
  twitter: buildTwitter(
    'MohnMenu — Commission-Free Ordering',
    'Zero commissions, Cards, crypto, cash. GPS tracking. Live kitchen cameras. Built for local businesses.',
  ),
  alternates: { canonical: BASE_URL },
};

// ── Pricing ─────────────────────────────────────────────────────

export const PRICING_METADATA: Metadata = {
  title: 'Pricing — MohnMenu | Plans Starting at $39.99/mo',
  description: 'Simple, transparent pricing for your ordering system. Starter $39.99/mo, Growth $79.99/mo, Professional $99.99/mo. Zero commissions on every plan. 3-day free trial, no credit card required.',
  keywords: [
    'restaurant ordering system pricing',
    'commission free ordering cost',
    'affordable restaurant POS',
    'online ordering system price',
    'restaurant technology pricing',
    'MohnMenu pricing',
    'ordering platform plans',
  ].join(', '),
  openGraph: buildOG(
    'Pricing — MohnMenu | From $39.99/mo, Zero Commissions',
    'Transparent pricing — Starter $39.99/mo, Growth $79.99/mo, Professional $99.99/mo. No commissions, no contracts, 3-day free trial.',
    '/pricing',
  ),
  twitter: buildTwitter('MohnMenu Pricing | From $39.99/mo', 'Zero commissions, transparent pricing. 3-day free trial.'),
  alternates: { canonical: `${BASE_URL}/pricing` },
};

// ── About ───────────────────────────────────────────────────────

export const ABOUT_METADATA: Metadata = {
  title: 'About MohnMenu — Our Mission to Empower Local Businesses',
  description: 'MohnMenu was built to end the unfair 30% commission model that delivery platforms impose on local businesses. Learn about our mission, technology, and commitment to keeping 100% of revenue where it belongs — with the business.',
  keywords: [
    'MohnMenu company',
    'about MohnMenu',
    'commission free ordering startup',
    'local business ordering platform',
    'fair ordering platform',
  ].join(', '),
  openGraph: buildOG(
    'About MohnMenu — Empowering Local Businesses',
    'We built MohnMenu to end the 30% commission model. Your food, your revenue, your business.',
    '/about',
  ),
  twitter: buildTwitter('About MohnMenu', 'Our mission to empower local businesses with commission-free ordering.'),
  alternates: { canonical: `${BASE_URL}/about` },
};

// ── FAQ ─────────────────────────────────────────────────────────

export const FAQ_METADATA: Metadata = {
  title: 'FAQ — MohnMenu | Common Questions About Our Ordering Platform',
  description: 'Frequently asked questions about MohnMenu\'s commission-free ordering platform. Learn about payments (cards, crypto, cash), delivery tracking, Chef Cam, fraud protection, and more.',
  keywords: [
    'MohnMenu FAQ',
    'restaurant ordering system questions',
    'commission free ordering FAQ',
    'online ordering platform help',
    'crypto payment restaurant FAQ',
  ].join(', '),
  openGraph: buildOG(
    'FAQ — MohnMenu | Your Questions Answered',
    'Everything you need to know about payments, features, pricing, and getting started with MohnMenu.',
    '/faq',
  ),
  twitter: buildTwitter('MohnMenu FAQ', 'Common questions about our commission-free ordering platform.'),
  alternates: { canonical: `${BASE_URL}/faq` },
};

// ── Contact ─────────────────────────────────────────────────────

export const CONTACT_METADATA: Metadata = {
  title: 'Contact MohnMenu — Get in Touch With Our Team',
  description: 'Contact the MohnMenu team for questions about our ordering platform, pricing, integrations, or partnerships. We\'re here to help your business succeed.',
  keywords: [
    'contact MohnMenu',
    'MohnMenu support',
    'ordering platform help',
    'restaurant ordering support',
  ].join(', '),
  openGraph: buildOG('Contact MohnMenu', 'Get in touch with our team. We\'re here to help.', '/contact'),
  twitter: buildTwitter('Contact MohnMenu', 'Questions? Our team is ready to help.'),
  alternates: { canonical: `${BASE_URL}/contact` },
};

// ── Demo ────────────────────────────────────────────────────────

export const DEMO_METADATA: Metadata = {
  title: 'Live Demo — MohnMenu | See the Platform in Action',
  description: 'Try the MohnMenu ordering platform live. Browse a demo restaurant, place a test order, and see how the kitchen display, GPS tracking, and payment systems work in real-time.',
  keywords: [
    'MohnMenu demo',
    'restaurant ordering demo',
    'ordering system demo',
    'try ordering platform',
    'restaurant POS demo',
  ].join(', '),
  openGraph: buildOG('Live Demo — MohnMenu', 'Try the ordering platform live. Place a test order and see how it works.', '/demo'),
  twitter: buildTwitter('MohnMenu Live Demo', 'See the ordering platform in action.'),
  alternates: { canonical: `${BASE_URL}/demo` },
};

// ── Comparison ────────────────────────────────────────────────

export const COMPARISON_METADATA: Metadata = {
  title: 'MohnMenu vs DoorDash, Uber Eats & GrubHub — Compare Ordering Platforms',
  description: 'Side-by-side comparison of MohnMenu vs DoorDash, Uber Eats, and GrubHub. See why local businesses save $1,350+/month by switching to our zero-commission ordering platform.',
  keywords: [
    'DoorDash alternative',
    'Uber Eats alternative no commission',
    'GrubHub alternative',
    'compare restaurant ordering platforms',
    'best online ordering system for restaurants',
    'DoorDash vs MohnMenu',
    'commission free ordering comparison',
    'restaurant platform comparison',
  ].join(', '),
  openGraph: buildOG(
    'MohnMenu vs DoorDash & Uber Eats — The Honest Comparison',
    '0% commission vs 30%. See the real difference in a side-by-side comparison.',
    '/comparison',
  ),
  twitter: buildTwitter('MohnMenu vs the Delivery Platforms', '0% commission vs 30%. See the difference.'),
  alternates: { canonical: `${BASE_URL}/comparison` },
};

// ── Features Index ──────────────────────────────────────────────

export const FEATURES_METADATA: Metadata = {
  title: 'Features — MohnMenu | Everything You Need to Sell Online',
  description: 'Explore MohnMenu\'s complete feature set: online ordering, QR menus, card & crypto payments, GPS delivery tracking, live kitchen cameras, Kitchen Display System, analytics, and more.',
  keywords: [
    'restaurant ordering features',
    'QR code ordering system',
    'delivery management software',
    'kitchen display system',
    'GPS delivery tracking',
    'live kitchen camera',
    'restaurant POS features',
    'crypto payment system',
    'white label ordering',
  ].join(', '),
  openGraph: buildOG(
    'Features — MohnMenu | Complete Ordering Platform',
    'Online ordering, QR menus, crypto payments, GPS tracking, live kitchen cameras, and more.',
    '/features',
  ),
  twitter: buildTwitter('MohnMenu Features', 'Everything you need to sell online — zero commissions.'),
  alternates: { canonical: `${BASE_URL}/features` },
};

// ─────────────────────────────────────────────────────────────────
// INDUSTRY LANDING PAGE METADATA
// ─────────────────────────────────────────────────────────────────

export const FOR_RESTAURANTS_METADATA: Metadata = {
  title: 'Online Ordering System for Restaurants — MohnMenu | Zero Commission',
  description: 'The #1 commission-free ordering platform for restaurants. Accept cards, crypto, and cash. GPS delivery tracking, live kitchen camera, Kitchen Display System. Keep 100% of your revenue.',
  keywords: [
    'online ordering system for restaurants',
    'restaurant ordering platform',
    'commission free restaurant ordering',
    'restaurant delivery platform no fees',
    'DoorDash alternative for restaurants',
    'restaurant POS system',
    'restaurant online ordering',
    'digital menu system',
  ].join(', '),
  openGraph: buildOG(
    'Online Ordering for Restaurants — MohnMenu',
    'Zero commissions. Cards, crypto, cash. GPS tracking. Live Chef Cam. Built for restaurants.',
    '/for-restaurants',
  ),
  twitter: buildTwitter('MohnMenu for Restaurants', 'Zero-commission ordering. Keep 100% of your revenue.'),
  alternates: { canonical: `${BASE_URL}/for-restaurants` },
};

export const FOR_BAKERIES_METADATA: Metadata = {
  title: 'Online Ordering System for Bakeries & Cafés — MohnMenu',
  description: 'Commission-free ordering for bakeries and cafés. Accept custom cake orders, pre-orders, and daily specials online. Cards, crypto, and cash. No fees on orders — ever.',
  keywords: [
    'bakery online ordering system',
    'cafe ordering platform',
    'bakery POS system',
    'custom cake ordering online',
    'bakery delivery system',
    'commission free bakery ordering',
    'cafe online ordering',
    'pastry shop ordering system',
  ].join(', '),
  openGraph: buildOG(
    'Online Ordering for Bakeries & Cafés — MohnMenu',
    'Zero-commission ordering for bakeries and cafés. Custom cakes, pre-orders, daily specials.',
    '/for-bakeries-cafes',
  ),
  twitter: buildTwitter('MohnMenu for Bakeries & Cafés', 'Commission-free ordering for bakeries and cafés.'),
  alternates: { canonical: `${BASE_URL}/for-bakeries-cafes` },
};

export const FOR_GROCERY_METADATA: Metadata = {
  title: 'Online Ordering for Grocery Stores & Markets — MohnMenu',
  description: 'Commission-free ordering and delivery platform for grocery stores and local markets. Product catalogs, delivery management, and real-time GPS tracking. Keep 100% of revenue.',
  keywords: [
    'grocery store ordering system',
    'grocery delivery platform',
    'market ordering system',
    'local grocery delivery',
    'grocery store POS',
    'commission free grocery ordering',
    'neighborhood market ordering',
    'grocery store online ordering',
  ].join(', '),
  openGraph: buildOG(
    'Online Ordering for Grocery Stores — MohnMenu',
    'Zero-commission ordering for groceries. Product catalogs, delivery, GPS tracking.',
    '/for-grocery-markets',
  ),
  twitter: buildTwitter('MohnMenu for Grocery Stores', 'Zero-commission ordering and delivery for grocery stores.'),
  alternates: { canonical: `${BASE_URL}/for-grocery-markets` },
};

export const FOR_FOOD_TRUCKS_METADATA: Metadata = {
  title: 'Online Ordering for Food Trucks — MohnMenu | Mobile Ordering System',
  description: 'The ordering platform built for food trucks. Accept pre-orders, share your location schedule, and let customers order ahead. Cards, crypto, and cash — zero commissions.',
  keywords: [
    'food truck ordering system',
    'food truck ordering app',
    'mobile food ordering system',
    'food truck POS',
    'food truck pre-order system',
    'commission free food truck ordering',
    'food truck online menu',
    'street food ordering platform',
  ].join(', '),
  openGraph: buildOG(
    'Online Ordering for Food Trucks — MohnMenu',
    'Pre-orders, schedule sharing, and instant payments for food trucks. Zero commissions.',
    '/for-food-trucks',
  ),
  twitter: buildTwitter('MohnMenu for Food Trucks', 'Pre-orders, location schedule, instant payments. Zero commissions.'),
  alternates: { canonical: `${BASE_URL}/for-food-trucks` },
};

export const FOR_BARS_METADATA: Metadata = {
  title: 'Online Ordering for Bars & Nightlife — MohnMenu',
  description: 'Commission-free ordering for bars, pubs, and nightlife venues. Tab management, drink menus, food ordering, and event promotions — all from one platform.',
  keywords: [
    'bar ordering system',
    'nightclub ordering app',
    'bar POS system',
    'pub ordering platform',
    'drink ordering system',
    'bar tab management',
    'nightlife ordering platform',
    'commission free bar ordering',
  ].join(', '),
  openGraph: buildOG(
    'Online Ordering for Bars & Nightlife — MohnMenu',
    'Tab management, drink menus, food ordering. Built for bars and nightlife venues.',
    '/for-bars-nightlife',
  ),
  twitter: buildTwitter('MohnMenu for Bars & Nightlife', 'Commission-free ordering for bars, pubs, and clubs.'),
  alternates: { canonical: `${BASE_URL}/for-bars-nightlife` },
};

export const FOR_CONVENIENCE_METADATA: Metadata = {
  title: 'Online Ordering for Convenience Stores — MohnMenu',
  description: 'Commission-free ordering and delivery for convenience stores and bodegas. Snacks, drinks, essentials — ordered online and delivered fast. Zero commissions on every order.',
  keywords: [
    'convenience store ordering system',
    'c-store delivery platform',
    'bodega ordering system',
    'convenience store POS',
    'convenience store delivery',
    'commission free convenience store',
    'corner store online ordering',
    'convenience store app',
  ].join(', '),
  openGraph: buildOG(
    'Online Ordering for Convenience Stores — MohnMenu',
    'Snacks, drinks, essentials — ordered online, delivered fast. Zero commissions.',
    '/for-convenience-stores',
  ),
  twitter: buildTwitter('MohnMenu for Convenience Stores', 'Commission-free ordering and delivery for c-stores.'),
  alternates: { canonical: `${BASE_URL}/for-convenience-stores` },
};

export const FOR_RETAIL_METADATA: Metadata = {
  title: 'Online Ordering for Retail Shops & Boutiques — MohnMenu',
  description: 'Commission-free online storefront for retail shops, boutiques, and specialty stores. Product catalogs, online ordering, local delivery, and curbside pickup.',
  keywords: [
    'retail shop ordering system',
    'boutique online ordering',
    'shop online storefront',
    'retail POS system',
    'boutique ecommerce platform',
    'local retail ordering',
    'commission free retail platform',
    'small shop online store',
  ].join(', '),
  openGraph: buildOG(
    'Online Ordering for Retail Shops — MohnMenu',
    'Product catalogs, online ordering, local delivery. Built for retail and boutiques.',
    '/for-retail-shops',
  ),
  twitter: buildTwitter('MohnMenu for Retail Shops', 'Commission-free online storefront for retail and boutiques.'),
  alternates: { canonical: `${BASE_URL}/for-retail-shops` },
};

export const FOR_UBER_DRIVERS_METADATA: Metadata = {
  title: 'Driver Marketplace for Uber & Rideshare Drivers — MohnMenu',
  description: 'Earn more between rides with MohnMenu Driver Marketplace. Accept local delivery requests and roadside assistance jobs like jump starts, lockouts, and tire help from one app.',
  keywords: [
    'uber driver side income',
    'rideshare driver marketplace',
    'driver roadside assistance app',
    'jump start gig jobs',
    'local delivery gigs for drivers',
    'multi-service driver app',
    'roadside dispatch platform',
    'mohnmenu driver marketplace',
  ].join(', '),
  openGraph: buildOG(
    'Driver Marketplace for Uber Drivers — MohnMenu',
    'Accept local delivery and roadside jobs from one platform. Turn downtime into extra earnings.',
    '/for-uber-drivers',
  ),
  twitter: buildTwitter('MohnMenu for Uber Drivers', 'Delivery + roadside gigs in one driver marketplace.'),
  alternates: { canonical: `${BASE_URL}/for-uber-drivers` },
};

// ─────────────────────────────────────────────────────────────────
// FEATURE SUBPAGE METADATA
// ─────────────────────────────────────────────────────────────────

export const FEATURE_PAGES_METADATA: Record<string, Metadata> = {
  'online-ordering': {
    title: 'Online Ordering System — MohnMenu Feature',
    description: 'Accept orders directly from your branded website. Card, crypto, or cash — no commissions, no third-party apps taking 30% of your revenue.',
    keywords: 'online ordering system, accept orders online, restaurant online ordering, commission free ordering',
    alternates: { canonical: `${BASE_URL}/features/online-ordering` },
  },
  'gps-tracking': {
    title: 'GPS Delivery Tracking — MohnMenu Feature',
    description: 'Sub-second GPS tracking for your delivery fleet. Automated dispatch, route optimization, and live customer tracking links.',
    keywords: 'GPS delivery tracking, delivery fleet management, real-time delivery tracking, driver tracking system',
    alternates: { canonical: `${BASE_URL}/features/gps-tracking` },
  },
  'crypto-payments': {
    title: 'Crypto Payments for Restaurants — MohnMenu Feature',
    description: 'Accept Bitcoin, Ethereum, Litecoin, Dogecoin and more. QR code checkout works with Cash App, Coinbase, and any crypto wallet.',
    keywords: 'crypto payments restaurant, accept bitcoin restaurant, cryptocurrency ordering, QR code crypto payment',
    alternates: { canonical: `${BASE_URL}/features/crypto-payments` },
  },
  'delivery-management': {
    title: 'Delivery Management System — MohnMenu Feature',
    description: 'Manage your own delivery drivers with GPS tracking, automated dispatch, and real-time customer notifications.',
    keywords: 'delivery management system, driver dispatch software, delivery fleet management, restaurant delivery software',
    alternates: { canonical: `${BASE_URL}/features/delivery-management` },
  },
  'kitchen-display': {
    title: 'Kitchen Display System (KDS) — MohnMenu Feature',
    description: 'Digital ticket management for your kitchen. Orders flow in real-time, color-coded by status. Reduce errors, speed up prep.',
    keywords: 'kitchen display system, KDS, digital kitchen tickets, restaurant kitchen management, order management system',
    alternates: { canonical: `${BASE_URL}/features/kitchen-display` },
  },
  'real-time-orders': {
    title: 'Real-Time Order Management — MohnMenu Feature',
    description: 'See every order the instant it\'s placed. Audio alerts, status updates, and live order tracking — all from any device.',
    keywords: 'real-time order management, live order tracking, restaurant order system, order notification system',
    alternates: { canonical: `${BASE_URL}/features/real-time-orders` },
  },
  'white-label-website': {
    title: 'White-Label Website Builder — MohnMenu Feature',
    description: 'Get a branded, SEO-optimized website for your business in minutes. Custom colors, logo, domain, and content — zero coding required.',
    keywords: 'white label restaurant website, branded ordering site, restaurant website builder, custom online storefront',
    alternates: { canonical: `${BASE_URL}/features/white-label-website` },
  },
  'roadside-assistance': {
    title: 'Roadside Assistance Dispatch — MohnMenu Feature',
    description: 'Dispatch nearby marketplace drivers for jump starts, lockouts, and tire support with live tracking and in-app completion workflow.',
    keywords: 'roadside assistance dispatch, jump start app, lockout support, tire help dispatch, driver marketplace roadside service',
    alternates: { canonical: `${BASE_URL}/features/roadside-assistance` },
  },
  'offerwall-rewards': {
    title: 'Offerwall Rewards for Restaurants, Drivers & Churches — MohnMenu Feature',
    description: 'Add an Earn page to your business website where customers complete app/game/video offers, earn wallet credits, and redeem them for food, drinks, and products.',
    keywords: 'offerwall rewards for restaurants, earn credits for food, church fundraising offerwall, driver side earnings, app install rewards platform',
    alternates: { canonical: `${BASE_URL}/features/offerwall-rewards` },
  },
};

// ─────────────────────────────────────────────────────────────────
// INDUSTRY-SPECIFIC JSON-LD GENERATORS
// ─────────────────────────────────────────────────────────────────

export function generateIndustryJsonLd(industry: string) {
  const industries: Record<string, { name: string; description: string; applicationSubCategory: string }> = {
    'restaurants': {
      name: 'MohnMenu for Restaurants',
      description: 'Commission-free online ordering platform for restaurants. Accept cards, crypto, and cash. GPS delivery tracking, live kitchen cameras, Kitchen Display System.',
      applicationSubCategory: 'Restaurant Management Software',
    },
    'bakeries-cafes': {
      name: 'MohnMenu for Bakeries & Cafés',
      description: 'Commission-free ordering for bakeries and cafés. Custom cake orders, pre-orders, daily specials, and delivery management.',
      applicationSubCategory: 'Bakery Management Software',
    },
    'grocery-markets': {
      name: 'MohnMenu for Grocery Stores',
      description: 'Commission-free ordering and delivery platform for grocery stores and local markets. Product catalogs, inventory management, and delivery.',
      applicationSubCategory: 'Grocery Store Management Software',
    },
    'food-trucks': {
      name: 'MohnMenu for Food Trucks',
      description: 'Mobile ordering platform for food trucks. Pre-orders, location scheduling, and instant payments with zero commissions.',
      applicationSubCategory: 'Food Truck Management Software',
    },
    'bars-nightlife': {
      name: 'MohnMenu for Bars & Nightlife',
      description: 'Ordering platform for bars, pubs, and nightlife venues. Tab management, drink menus, food ordering, and event promotions.',
      applicationSubCategory: 'Bar & Restaurant POS Software',
    },
    'convenience-stores': {
      name: 'MohnMenu for Convenience Stores',
      description: 'Ordering and delivery platform for convenience stores and bodegas. Snacks, drinks, essentials — fast ordering and delivery.',
      applicationSubCategory: 'Convenience Store POS Software',
    },
    'retail-shops': {
      name: 'MohnMenu for Retail Shops',
      description: 'Online storefront for retail shops and boutiques. Product catalogs, online ordering, local delivery, and curbside pickup.',
      applicationSubCategory: 'Retail Management Software',
    },
    'uber-drivers': {
      name: 'MohnMenu for Uber Drivers',
      description: 'Driver marketplace for rideshare drivers to accept delivery and roadside assistance jobs between rides.',
      applicationSubCategory: 'Driver Marketplace Software',
    },
  };

  const data = industries[industry];
  if (!data) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: data.name,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: data.applicationSubCategory,
    operatingSystem: 'Web',
    url: `${BASE_URL}/for-${industry}`,
    description: data.description,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '19.99',
      highPrice: '99.99',
      offerCount: 3,
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// BREADCRUMB JSON-LD GENERATOR
// ─────────────────────────────────────────────────────────────────

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
