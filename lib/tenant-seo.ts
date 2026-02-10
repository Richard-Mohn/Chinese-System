/**
 * Tenant SEO Library — MohnMenu
 * 
 * Generates JSON-LD structured data for tenant (business) pages.
 * This is the core SEO engine that powers every auto-generated business website.
 * 
 * Schema types generated:
 * - LocalBusiness / Restaurant / FoodEstablishment / Store
 * - Menu (for restaurant menu pages)
 * - Service (for service pages like delivery, takeout, catering)
 * - GeoCoordinates (for location pages)
 * - BreadcrumbList (for all tenant pages)
 * - FAQPage (for service pages with FAQs)
 * 
 * Usage:
 *   import { generateTenantJsonLd, generateTenantMenuJsonLd } from '@/lib/tenant-seo';
 *   const jsonLd = generateTenantJsonLd(business, baseUrl);
 */

import type { MohnMenuBusiness } from '@/lib/types';
import { SERVICE_INFO } from '@/lib/types';
import { CUISINE_TYPES } from '@/lib/seo-data';

const PLATFORM_URL = 'https://mohnmenu.com';

// ─────────────────────────────────────────────────────────────────
// BUSINESS TYPE → SCHEMA TYPE MAPPING
// ─────────────────────────────────────────────────────────────────

function getSchemaType(businessType: string): string {
  const typeMap: Record<string, string> = {
    restaurant: 'Restaurant',
    chinese_restaurant: 'Restaurant',
    pizza: 'Restaurant',
    mexican: 'Restaurant',
    bakery: 'Bakery',
    convenience_store: 'ConvenienceStore',
    grocery: 'GroceryStore',
    food_truck: 'FoodEstablishment',
    bar_grill: 'BarOrPub',
    boutique: 'Store',
    antique_shop: 'Store',
    market: 'GroceryStore',
    music_artist: 'MusicGroup',
    church: 'Church',
    other: 'LocalBusiness',
  };
  return typeMap[businessType] || 'LocalBusiness';
}

// Get the cuisine type as a schema-compatible string
function getCuisineSchema(cuisineKey?: string): string | undefined {
  if (!cuisineKey) return undefined;
  const cuisine = CUISINE_TYPES.find(c => c.key === cuisineKey);
  return cuisine ? `${cuisine.label} cuisine` : undefined;
}

// ─────────────────────────────────────────────────────────────────
// MAIN TENANT JSON-LD GENERATOR
// Produces LocalBusiness/Restaurant schema for the tenant homepage
// ─────────────────────────────────────────────────────────────────

export function generateTenantJsonLd(
  business: MohnMenuBusiness,
  baseUrl: string, // e.g., 'https://mohnmenu.com/china-wok-rva'
) {
  const schemaType = getSchemaType(business.type);
  const cuisineServed = getCuisineSchema(business.website?.cuisineType);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: business.name,
    url: baseUrl,
    description: business.description || `${business.name} — order online for delivery or pickup.`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.zipCode,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.latitude || business.location?.lat,
      longitude: business.longitude || business.location?.lng,
    },
    image: business.logo || business.settings?.logoUrl,
    priceRange: '$$',
    paymentAccepted: buildPaymentAccepted(business),
    ...(business.businessPhone && { telephone: business.businessPhone }),
    ...(business.ownerEmail && { email: business.ownerEmail }),
    ...(cuisineServed && { servesCuisine: cuisineServed }),
    hasMenu: `${baseUrl}/menu`,
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${PLATFORM_URL}/order/${business.slug}`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      deliveryMethod: buildDeliveryMethods(business),
    },
    // Areas served
    ...(business.website?.selectedCities && business.website.selectedCities.length > 0 && {
      areaServed: business.website.selectedCities.map(city => ({
        '@type': 'City',
        name: city,
        ...(business.website.selectedStates?.[0] && {
          containedInPlace: {
            '@type': 'State',
            name: business.website.selectedStates[0],
          },
        }),
      })),
    }),
    // Published by MohnMenu  
    isPartOf: {
      '@type': 'WebSite',
      name: 'MohnMenu',
      url: PLATFORM_URL,
    },
  };

  return jsonLd;
}

// ─────────────────────────────────────────────────────────────────
// MENU JSON-LD — for /menu page
// ─────────────────────────────────────────────────────────────────

export function generateTenantMenuJsonLd(
  business: MohnMenuBusiness,
  baseUrl: string,
  menuItems?: Array<{ name: string; description: string; category: string; prices: Record<string, number> }>,
) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: `${business.name} Menu`,
    url: `${baseUrl}/menu`,
    mainEntity: {
      '@type': schemaTypeForBusiness(business.type),
      name: business.name,
    },
  };

  // If we have menu items, include menu sections
  if (menuItems && menuItems.length > 0) {
    const categories = [...new Set(menuItems.map(item => item.category))];
    jsonLd.hasMenuSection = categories.map(category => ({
      '@type': 'MenuSection',
      name: category,
      hasMenuItem: menuItems
        .filter(item => item.category === category)
        .slice(0, 10) // limit to 10 per category for JSON-LD size
        .map(item => {
          const firstPrice = Object.values(item.prices)[0];
          return {
            '@type': 'MenuItem',
            name: item.name,
            description: item.description,
            ...(firstPrice && {
              offers: {
                '@type': 'Offer',
                price: firstPrice.toFixed(2),
                priceCurrency: 'USD',
              },
            }),
          };
        }),
    }));
  }

  return jsonLd;
}

function schemaTypeForBusiness(type: string): string {
  return getSchemaType(type);
}

// ─────────────────────────────────────────────────────────────────
// LOCATION PAGE JSON-LD
// ─────────────────────────────────────────────────────────────────

export function generateLocationJsonLd(
  business: MohnMenuBusiness,
  city: string,
  state: string,
  baseUrl: string,
  locationUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': getSchemaType(business.type),
    name: `${business.name} — ${city}, ${state}`,
    url: locationUrl,
    description: `Order from ${business.name} in ${city}, ${state}. ${business.description || 'Fresh food delivered to your door or ready for pickup.'}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: state,
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'City',
      name: city,
      containedInPlace: {
        '@type': 'State',
        name: state,
      },
    },
    ...(getCuisineSchema(business.website?.cuisineType) && {
      servesCuisine: getCuisineSchema(business.website?.cuisineType),
    }),
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${PLATFORM_URL}/order/${business.slug}`,
      },
    },
    parentOrganization: {
      '@type': 'Organization',
      name: business.name,
      url: baseUrl,
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// SERVICE PAGE JSON-LD
// ─────────────────────────────────────────────────────────────────

export function generateServiceJsonLd(
  business: MohnMenuBusiness,
  serviceKey: string,
  baseUrl: string,
  serviceUrl: string,
) {
  const info = SERVICE_INFO[serviceKey];
  if (!info) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${info.label} — ${business.name}`,
    description: info.description,
    url: serviceUrl,
    provider: {
      '@type': getSchemaType(business.type),
      name: business.name,
      url: baseUrl,
      address: {
        '@type': 'PostalAddress',
        addressLocality: business.city,
        addressRegion: business.state,
        addressCountry: 'US',
      },
    },
    areaServed: business.website?.selectedCities?.map(city => ({
      '@type': 'City',
      name: city,
    })) || [],
    serviceType: info.label,
  };
}

// ─────────────────────────────────────────────────────────────────
// SERVICE PAGE FAQ JSON-LD
// ─────────────────────────────────────────────────────────────────

export function generateServiceFaqJsonLd(
  faq: Array<{ q: string; a: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

// ─────────────────────────────────────────────────────────────────
// TENANT BREADCRUMB GENERATOR
// ─────────────────────────────────────────────────────────────────

export function generateTenantBreadcrumb(
  businessName: string,
  businessUrl: string,
  pageName?: string,
  pageUrl?: string,
  subPageName?: string,
  subPageUrl?: string,
) {
  const items = [
    { '@type': 'ListItem' as const, position: 1, name: businessName, item: businessUrl },
  ];
  if (pageName && pageUrl) {
    items.push({ '@type': 'ListItem', position: 2, name: pageName, item: pageUrl });
  }
  if (subPageName && subPageUrl) {
    items.push({ '@type': 'ListItem', position: 3, name: subPageName, item: subPageUrl });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

// ─────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────

function buildPaymentAccepted(business: MohnMenuBusiness): string[] {
  const methods: string[] = ['Credit Card', 'Debit Card'];
  if (business.settings?.cashPaymentsEnabled) {
    methods.push('Cash');
  }
  // Crypto is always available on MohnMenu
  methods.push('Cryptocurrency');
  return methods;
}

function buildDeliveryMethods(business: MohnMenuBusiness): string[] {
  const methods: string[] = [];
  const services = business.website?.selectedServices || business.services || [];
  if (services.includes('delivery')) methods.push('http://purl.org/goodrelations/v1#DeliveryModeDirectDownload');
  if (services.includes('takeout') || services.includes('pickup')) methods.push('http://purl.org/goodrelations/v1#DeliveryModePickUp');
  if (methods.length === 0) methods.push('http://purl.org/goodrelations/v1#DeliveryModeDirectDownload');
  return methods;
}

// ─────────────────────────────────────────────────────────────────
// SEO META HELPERS FOR TENANT PAGES
// ─────────────────────────────────────────────────────────────────

/**
 * Generate comprehensive SEO keywords for a tenant business page.
 */
export function generateTenantKeywords(business: MohnMenuBusiness): string[] {
  const keywords: string[] = [];
  const cuisine = CUISINE_TYPES.find(c => c.key === business.website?.cuisineType);

  // Business name
  keywords.push(business.name);

  // Location keywords
  if (business.city && business.state) {
    keywords.push(`${business.name} ${business.city}`);
    keywords.push(`${business.city} ${business.state}`);
    if (cuisine) {
      keywords.push(`${cuisine.label} food ${business.city}`);
      keywords.push(`${cuisine.label} restaurant ${business.city}`);
    }
    keywords.push(`food delivery ${business.city}`);
    keywords.push(`order food online ${business.city}`);
    keywords.push(`restaurant ${business.city}`);
  }

  // Cuisine keywords
  if (cuisine) {
    keywords.push(...cuisine.keywords.slice(0, 5));
  }

  // Service keywords
  const services = business.website?.selectedServices || [];
  for (const service of services.slice(0, 4)) {
    const info = SERVICE_INFO[service];
    if (info) {
      keywords.push(...info.keywords.slice(0, 3));
    }
  }

  // Custom keywords
  if (business.website?.seo?.keywords) {
    keywords.push(...business.website.seo.keywords);
  }

  // Deduplicate and limit
  return [...new Set(keywords)].slice(0, 25);
}
