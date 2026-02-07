/**
 * Domain Registrar Service — GoDaddy API Integration
 *
 * Handles domain search, purchase, DNS configuration, and renewal.
 * Domains are registered under the platform's GoDaddy account and
 * resold to tenants with a configurable markup (default $5).
 *
 * Requires env vars:
 *   GODADDY_API_KEY      — Production API key
 *   GODADDY_API_SECRET   — Production API secret
 *   GODADDY_ACCOUNT_ID   — (Optional) Shopper ID for reseller accounts
 *
 * GoDaddy API docs: https://developer.godaddy.com/doc/endpoint/domains
 */

// ── Config ───────────────────────────────────────────────────

const GODADDY_API_KEY = process.env.GODADDY_API_KEY || '';
const GODADDY_API_SECRET = process.env.GODADDY_API_SECRET || '';

// Use OTE (test) environment if keys aren't set or in development
const GODADDY_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.godaddy.com'
    : 'https://api.ote-godaddy.com';

// How much to mark up per domain per year ($5 profit per domain)
const DOMAIN_MARKUP_CENTS = 500; // $5.00

// Firebase App Hosting target for CNAME records
const APP_HOSTING_CNAME = process.env.FIREBASE_APP_HOSTING_DOMAIN || 'mohnmenu.com';

// ── Types ────────────────────────────────────────────────────

export interface DomainSearchResult {
  domain: string;
  available: boolean;
  price: number;       // Cost in cents (GoDaddy wholesale)
  currency: string;
  period: number;      // Years
  totalPrice: number;  // Cost + markup in cents (what tenant pays)
  markup: number;      // Markup in cents
}

export interface DomainSuggestion {
  domain: string;
  price?: number;      // cents
  totalPrice?: number; // cents with markup
}

export interface DomainPurchaseRequest {
  domain: string;
  years?: number;
  contact: DomainContact;
}

export interface DomainContact {
  nameFirst: string;
  nameLast: string;
  email: string;
  phone: string;
  addressMailing: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string; // ISO 3166 (e.g., "US")
  };
  organization?: string;
}

export interface DomainPurchaseResult {
  domain: string;
  orderId: number;
  total: number;       // cents charged to GoDaddy
  currency: string;
  itemCount: number;
}

export interface DomainInfo {
  domain: string;
  status: string;
  expires: string;
  nameServers: string[];
  locked: boolean;
  autoRenew: boolean;
  createdAt: string;
}

export interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'SOA' | 'SRV' | 'TXT';
  name: string;
  data: string;
  ttl?: number;
  priority?: number;
}

// ── Helpers ──────────────────────────────────────────────────

function getHeaders(): Record<string, string> {
  if (!GODADDY_API_KEY || !GODADDY_API_SECRET) {
    throw new Error('GoDaddy API credentials not configured. Set GODADDY_API_KEY and GODADDY_API_SECRET env vars.');
  }
  return {
    Authorization: `sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function godaddyFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${GODADDY_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`GoDaddy API error [${res.status}] ${path}:`, errorBody);
    throw new Error(`GoDaddy API error: ${res.status} — ${errorBody}`);
  }

  // Some endpoints return no content (204)
  if (res.status === 204) return {} as T;

  return res.json();
}

// ── Domain Search & Availability ─────────────────────────────

/**
 * Check if a single domain is available for purchase
 */
export async function checkDomainAvailability(
  domain: string,
): Promise<DomainSearchResult> {
  const data = await godaddyFetch<{
    available: boolean;
    domain: string;
    definitive: boolean;
    price?: number;      // micros (millionths of currency unit)
    currency?: string;
    period?: number;
  }>(`/v1/domains/available?domain=${encodeURIComponent(domain)}&checkType=FULL&forTransfer=false`);

  // GoDaddy returns price in micros (1,000,000 = $1)
  const priceCents = data.price ? Math.round(data.price / 10000) : 0;

  return {
    domain: data.domain,
    available: data.available,
    price: priceCents,
    currency: data.currency || 'USD',
    period: data.period || 1,
    totalPrice: priceCents + DOMAIN_MARKUP_CENTS,
    markup: DOMAIN_MARKUP_CENTS,
  };
}

/**
 * Check availability for multiple domains at once
 */
export async function checkBulkAvailability(
  domains: string[],
): Promise<DomainSearchResult[]> {
  const data = await godaddyFetch<{
    domains: Array<{
      available: boolean;
      domain: string;
      price?: number;
      currency?: string;
      period?: number;
    }>;
  }>('/v1/domains/available', {
    method: 'POST',
    body: JSON.stringify(domains),
  });

  return (data.domains || []).map((d) => {
    const priceCents = d.price ? Math.round(d.price / 10000) : 0;
    return {
      domain: d.domain,
      available: d.available,
      price: priceCents,
      currency: d.currency || 'USD',
      period: d.period || 1,
      totalPrice: priceCents + DOMAIN_MARKUP_CENTS,
      markup: DOMAIN_MARKUP_CENTS,
    };
  });
}

/**
 * Get domain name suggestions based on a keyword/seed
 */
export async function getDomainSuggestions(
  keyword: string,
  limit = 10,
): Promise<DomainSuggestion[]> {
  const data = await godaddyFetch<Array<{ domain: string }>>( 
    `/v1/domains/suggest?query=${encodeURIComponent(keyword)}&limit=${limit}&waitMs=5000`,
  );

  return (data || []).map((s) => ({
    domain: s.domain,
  }));
}

/**
 * Get list of supported TLDs
 */
export async function getSupportedTLDs(): Promise<string[]> {
  const data = await godaddyFetch<Array<{ name: string; type: string }>>(
    '/v1/domains/tlds',
  );
  return (data || []).map((t) => t.name);
}

// ── Domain Purchase ──────────────────────────────────────────

/**
 * Purchase and register a domain.
 * The domain is registered under the platform's GoDaddy account.
 */
export async function purchaseDomain(
  request: DomainPurchaseRequest,
): Promise<DomainPurchaseResult> {
  const { domain, years = 1, contact } = request;

  // First, get the legal agreements the user must accept
  const tld = domain.split('.').slice(1).join('.');
  const agreements = await godaddyFetch<Array<{ agreementKey: string }>>(
    `/v1/domains/agreements?tlds=${encodeURIComponent(tld)}&privacy=false`,
  );

  const consentAgreementKeys = (agreements || []).map((a) => a.agreementKey);

  // Build purchase request
  const purchaseBody = {
    domain,
    consent: {
      agreementKeys: consentAgreementKeys,
      agreedBy: contact.email,
      agreedAt: new Date().toISOString(),
    },
    contactAdmin: contact,
    contactBilling: contact,
    contactRegistrant: contact,
    contactTech: contact,
    period: years,
    privacy: false, // Set to true for WHOIS privacy (extra cost)
    renewAuto: true,
    nameServers: [], // Use GoDaddy default nameservers initially
  };

  const result = await godaddyFetch<{
    orderId: number;
    total: number;
    currency: string;
    itemCount: number;
  }>('/v1/domains/purchase', {
    method: 'POST',
    body: JSON.stringify(purchaseBody),
  });

  return {
    domain,
    orderId: result.orderId,
    total: Math.round((result.total || 0) * 100), // Convert to cents
    currency: result.currency || 'USD',
    itemCount: result.itemCount || 1,
  };
}

/**
 * Validate a domain purchase request before actually buying
 */
export async function validateDomainPurchase(
  domain: string,
  contact: DomainContact,
): Promise<{ valid: boolean; errors?: string[] }> {
  const tld = domain.split('.').slice(1).join('.');

  try {
    const agreements = await godaddyFetch<Array<{ agreementKey: string }>>(
      `/v1/domains/agreements?tlds=${encodeURIComponent(tld)}&privacy=false`,
    );

    const consentAgreementKeys = (agreements || []).map((a) => a.agreementKey);

    await godaddyFetch<void>('/v1/domains/purchase/validate', {
      method: 'POST',
      body: JSON.stringify({
        domain,
        consent: {
          agreementKeys: consentAgreementKeys,
          agreedBy: contact.email,
          agreedAt: new Date().toISOString(),
        },
        contactAdmin: contact,
        contactBilling: contact,
        contactRegistrant: contact,
        contactTech: contact,
        period: 1,
        privacy: false,
        renewAuto: true,
      }),
    });

    return { valid: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { valid: false, errors: [msg] };
  }
}

// ── DNS Management ───────────────────────────────────────────

/**
 * Configure DNS records for a domain to point to Firebase App Hosting.
 * Sets up:
 *   - CNAME for www → Firebase App Hosting
 *   - A record / CNAME for root → Firebase App Hosting
 *   - TXT record for domain verification (if needed)
 */
export async function configureDNSForAppHosting(
  domain: string,
): Promise<{ success: boolean; records: DNSRecord[] }> {
  const records: DNSRecord[] = [
    // Root domain CNAME (or forwarding)
    {
      type: 'CNAME',
      name: '@',
      data: APP_HOSTING_CNAME,
      ttl: 600,
    },
    // www subdomain
    {
      type: 'CNAME',
      name: 'www',
      data: APP_HOSTING_CNAME,
      ttl: 600,
    },
  ];

  // Set the records via GoDaddy API
  for (const record of records) {
    await godaddyFetch<void>(
      `/v1/domains/${encodeURIComponent(domain)}/records/${record.type}/${record.name}`,
      {
        method: 'PUT',
        body: JSON.stringify([
          {
            data: record.data,
            ttl: record.ttl || 600,
            ...(record.priority !== undefined ? { priority: record.priority } : {}),
          },
        ]),
      },
    );
  }

  return { success: true, records };
}

/**
 * Add a specific DNS record to a domain
 */
export async function addDNSRecord(
  domain: string,
  record: DNSRecord,
): Promise<void> {
  await godaddyFetch<void>(
    `/v1/domains/${encodeURIComponent(domain)}/records`,
    {
      method: 'PATCH',
      body: JSON.stringify([
        {
          type: record.type,
          name: record.name,
          data: record.data,
          ttl: record.ttl || 3600,
          ...(record.priority !== undefined ? { priority: record.priority } : {}),
        },
      ]),
    },
  );
}

/**
 * Get all DNS records for a domain
 */
export async function getDNSRecords(
  domain: string,
): Promise<DNSRecord[]> {
  const data = await godaddyFetch<Array<{
    type: string;
    name: string;
    data: string;
    ttl: number;
    priority?: number;
  }>>(`/v1/domains/${encodeURIComponent(domain)}/records`);

  return (data || []).map((r) => ({
    type: r.type as DNSRecord['type'],
    name: r.name,
    data: r.data,
    ttl: r.ttl,
    ...(r.priority !== undefined ? { priority: r.priority } : {}),
  }));
}

// ── Domain Info & Management ─────────────────────────────────

/**
 * Get details about a registered domain
 */
export async function getDomainInfo(domain: string): Promise<DomainInfo> {
  const data = await godaddyFetch<{
    domain: string;
    status: string;
    expires: string;
    nameServers: string[];
    locked: boolean;
    renewAuto: boolean;
    createdAt: string;
  }>(`/v1/domains/${encodeURIComponent(domain)}`);

  return {
    domain: data.domain,
    status: data.status,
    expires: data.expires,
    nameServers: data.nameServers || [],
    locked: data.locked,
    autoRenew: data.renewAuto,
    createdAt: data.createdAt,
  };
}

/**
 * Renew a domain for additional years
 */
export async function renewDomain(
  domain: string,
  years = 1,
): Promise<{ orderId: number; total: number }> {
  const result = await godaddyFetch<{
    orderId: number;
    total: number;
  }>(`/v1/domains/${encodeURIComponent(domain)}/renew`, {
    method: 'POST',
    body: JSON.stringify({ period: years }),
  });

  return {
    orderId: result.orderId,
    total: Math.round((result.total || 0) * 100),
  };
}

/**
 * Get the markup amount in cents
 */
export function getDomainMarkup(): number {
  return DOMAIN_MARKUP_CENTS;
}

/**
 * Format cents to display price
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
