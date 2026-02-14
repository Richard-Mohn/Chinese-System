/**
 * Dynamic Sitemap Generation for MohnMenu
 * 
 * Generates chunked sitemaps for Google:
 * - Sitemap 0: Static platform pages
 * - Sitemap 1+: Per-business location & service pages
 * 
 * Uses Next.js generateSitemaps() for automatic sitemap index.
 * ISR-compatible: regenerates every hour.
 * 
 * Google limits: 50,000 URLs per sitemap, 50MB uncompressed.
 * Our chunks stay well under both limits.
 */

import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MohnMenuBusiness } from '@/lib/types';
import { toLocationSlug } from '@/lib/tenant-links';

const BASE_URL = 'https://mohnmenu.com';

// Revalidate sitemaps every hour
export const revalidate = 3600;

/**
 * Generate sitemap IDs: 0 = static pages, 1+ = one per business
 */
export async function generateSitemaps(): Promise<{ id: number }[]> {
  try {
    const businessesRef = collection(db, 'businesses');
    const snapshot = await getDocs(businessesRef);
    // Sitemap 0 = static pages, 1-N = businesses
    const ids = [{ id: 0 }];
    let i = 1;
    snapshot.forEach(() => {
      ids.push({ id: i++ });
    });
    return ids;
  } catch {
    return [{ id: 0 }];
  }
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  
  // ── Sitemap 0: Static platform pages ─────────────────────
  if (id === 0) {
    return [
      { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${BASE_URL}/about/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/pricing/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE_URL}/features/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/faq/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: `${BASE_URL}/contact/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: `${BASE_URL}/comparison/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/privacy/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
      { url: `${BASE_URL}/terms/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
      // Industry landing pages
      { url: `${BASE_URL}/for-restaurants/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${BASE_URL}/for-grocery-markets/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${BASE_URL}/for-convenience-stores/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${BASE_URL}/for-bakeries-cafes/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${BASE_URL}/for-food-trucks/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${BASE_URL}/for-bars-nightlife/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${BASE_URL}/for-retail-shops/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${BASE_URL}/for-coffee-shops/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${BASE_URL}/for-uber-drivers/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${BASE_URL}/for-churches/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${BASE_URL}/for-music-artists/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      // Feature subpages
      { url: `${BASE_URL}/features/online-ordering/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/gps-tracking/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/crypto-payments/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/delivery-management/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/kitchen-display/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/real-time-orders/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/white-label-website/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/community-delivery/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/reservations/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/staff-marketplace/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/bar-entertainment/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/peer-delivery/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/offerwall-rewards/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/features/roadside-assistance/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/careers/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE_URL}/apply/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE_URL}/apply/delivery-driver/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE_URL}/apply/community-courier/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE_URL}/apply/bartender-server/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE_URL}/apply/kitchen-staff/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE_URL}/apply/church-volunteer/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE_URL}/apply/operations-manager/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE_URL}/demo/bars/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/coffee/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/music/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/driver/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/roadside/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/pizza/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/bakery/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/food-truck/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/grocery/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/boutique/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/antique/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/convenience/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/shepherds-gate/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/demo/shepherds-gate/menu-board/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: `${BASE_URL}/quick-delivery/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    ];
  }

  // ── Sitemap 1+: Business-specific pages ──────────────────
  try {
    const businessesRef = collection(db, 'businesses');
    const snapshot = await getDocs(businessesRef);
    const businesses: MohnMenuBusiness[] = [];
    snapshot.forEach(doc => businesses.push(doc.data() as MohnMenuBusiness));

    // The id maps to businesses array (1-indexed: id=1 → businesses[0])
    const businessIndex = id - 1;
    if (businessIndex < 0 || businessIndex >= businesses.length) {
      return [];
    }

    const business = businesses[businessIndex];
    if (!business.slug || !business.website?.enabled) return [];

    const entries: MetadataRoute.Sitemap = [];
    const slug = business.slug;

    // Business homepage
    entries.push({
      url: `${BASE_URL}/${slug}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });

    // Order page
    entries.push({
      url: `${BASE_URL}/order/${slug}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });

    if (business.type === 'chinese_restaurant') {
      entries.push({
        url: `${BASE_URL}/${slug}/zh/`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    // Service pages
    const services = business.website?.selectedServices || [];
    for (const service of services) {
      entries.push({
        url: `${BASE_URL}/${slug}/services/${service}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    // Location pages — the big SEO play
    const cities = business.website?.selectedCities || [];
    const states = business.website?.selectedStates || [];
    const defaultState = states[0] || business.state || '';

    for (const city of cities) {
      // Determine which state this city belongs to
      // For now use defaultState — in future could store city+state pairs
      const locationSlug = toLocationSlug(city, defaultState);
      entries.push({
        url: `${BASE_URL}/${slug}/${locationSlug}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }

    return entries;
  } catch {
    return [];
  }
}
