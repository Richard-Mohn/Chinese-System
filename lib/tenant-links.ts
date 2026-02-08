/**
 * Tenant Link Utilities
 * 
 * Generates correct URLs based on whether the visitor is on a custom domain
 * or on the main MohnMenu platform domain.
 * 
 * On custom domain (e.g., chinawok.com):
 *   /about → /about
 *   /order → /order
 * 
 * On platform domain (e.g., mohnmenu.com/china-wok):
 *   /about → /china-wok/about
 *   /order → /order/china-wok
 */

// ─── Client-Side Utilities ───────────────────────────────────────────

/**
 * Get the base path for a tenant in client components.
 * Call this in client components to generate correct links.
 * 
 * @param slug - The business slug (e.g., "china-wok")
 * @param isCustomDomain - Whether the visitor is on a custom domain
 * @returns "" on custom domain, "/china-wok" on platform
 */
export function getClientBasePath(slug: string, isCustomDomain: boolean = false): string {
  if (isCustomDomain) return '';
  return `/${slug}`;
}

/**
 * Get the order/booking path for a tenant in client components.
 */
export function getClientOrderPath(slug: string, isCustomDomain: boolean = false): string {
  if (isCustomDomain) return '/order';
  return `/order/${slug}`;
}

/**
 * Build a full tenant page URL in client components.
 */
export function getClientTenantUrl(slug: string, path: string, isCustomDomain: boolean = false): string {
  const base = getClientBasePath(slug, isCustomDomain);
  if (path === '/' || path === '') return base || '/';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

// ─── Server-Side Utilities ───────────────────────────────────────────

/**
 * Get the base path for a tenant in server components.
 * Reads the x-custom-domain header set by proxy.ts.
 * 
 * @param slug - The business slug
 * @param customDomainHeader - The x-custom-domain header value (from headers())
 * @returns "" on custom domain, "/china-wok" on platform
 */
export function getServerBasePath(slug: string, customDomainHeader?: string | null): string {
  if (customDomainHeader === '1') return '';
  return `/${slug}`;
}

/**
 * Get the order/booking path for a tenant in server components.
 */
export function getServerOrderPath(slug: string, customDomainHeader?: string | null): string {
  if (customDomainHeader === '1') return '/order';
  return `/order/${slug}`;
}

/**
 * Build a full tenant page URL in server components.
 */
export function getServerTenantUrl(slug: string, path: string, customDomainHeader?: string | null): string {
  const base = getServerBasePath(slug, customDomainHeader);
  if (path === '/' || path === '') return base || '/';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

// ─── Location Parsing ────────────────────────────────────────────────

/**
 * Parse a location slug like "richmond-va" into { city: "Richmond", state: "VA" }
 */
export function parseLocation(locationSlug: string): { city: string; state: string } | null {
  // Expected format: city-name-st (e.g., "richmond-va", "virginia-beach-va")
  const parts = locationSlug.split('-');
  if (parts.length < 2) return null;
  
  const state = parts[parts.length - 1].toUpperCase();
  if (state.length !== 2) return null;
  
  const cityParts = parts.slice(0, -1);
  const city = cityParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  
  return { city, state };
}

/**
 * Generate a location slug from city and state.
 */
export function toLocationSlug(city: string, state: string): string {
  return `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`;
}

// ─── Domain Detection ────────────────────────────────────────────────

const MAIN_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'mohnmenu.com',
  'www.mohnmenu.com',
  // Add your Firebase App Hosting domain here
];

/**
 * Check if a hostname is the main MohnMenu platform domain.
 */
export function isMainDomain(hostname: string): boolean {
  const clean = hostname.split(':')[0]; // Remove port
  return MAIN_DOMAINS.some(d => clean === d) ||
    clean.endsWith('.hosted.app') ||
    clean.endsWith('.apphosting.dev') ||
    clean.endsWith('.run.app') ||
    clean.endsWith('.web.app') ||
    clean.endsWith('.firebaseapp.com') ||
    clean.endsWith('.vercel.app');
}
