/**
 * Google Analytics & Search Console Server Library
 * 
 * Provides server-side access to:
 * - Google Search Console API (site performance, index status)
 * - Google Analytics Data API (GA4 traffic, sources, realtime)
 * - Google Analytics Admin API (property management)
 * 
 * Uses the firebase-adminsdk service account for authentication.
 * APIs must be enabled in Google Cloud Console for project "chinese-system".
 */

import { google, Auth } from 'googleapis';
import path from 'path';

// ── Auth ─────────────────────────────────────────────────────

let authClient: Auth.GoogleAuth | null = null;

function getAuth() {
  if (authClient) return authClient;
  
  authClient = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), 'serviceAccountKey.json'),
    scopes: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/analytics.edit',
    ],
  });
  
  return authClient;
}

// ── GA4 Property ID ──────────────────────────────────────────

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || ''; // e.g. "properties/XXXXXXXXX"
const SITE_URL = 'https://mohnmenu.com';

// ── Demo showcase sites ──────────────────────────────────────
// These are real sites we own, verified in Google Search Console,
// and linked to GA4. Used to show real SEO data in demo dashboards.
export interface DemoSiteConfig {
  siteUrl: string;
  ga4PropertyId?: string;  // If different GA4 property; falls back to main
  label: string;
}

export const DEMO_SHOWCASE_SITES: Record<string, DemoSiteConfig> = {
  'neighbortechs': {
    siteUrl: 'https://neighbortechs.com',
    ga4PropertyId: process.env.GA4_PROPERTY_NEIGHBORTECHS || '',
    label: 'NeighborTechs.com',
  },
  'flamingsocialmedia': {
    siteUrl: 'https://flamingsocialmedia.com',
    ga4PropertyId: process.env.GA4_PROPERTY_FLAMINGSOCIAL || '',
    label: 'FlamingSocialMedia.com',
  },
};

/**
 * Get site-wide Search Console data for a demo showcase site.
 * No slug filter — returns the full site performance.
 */
export async function getDemoSiteSearchConsoleData(
  siteUrl: string,
  startDate: string,
  endDate: string,
): Promise<SearchConsoleData> {
  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  // Overview (totals — no dimension filter)
  const overviewRes = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: { startDate, endDate },
  });
  const overview = overviewRes.data.rows?.[0] || {};

  // Top queries
  const queriesRes = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: { startDate, endDate, dimensions: ['query'], rowLimit: 50 },
  });
  const topQueries = (queriesRes.data.rows || []).map(row => ({
    query: row.keys?.[0] || '',
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));

  // Top pages
  const pagesRes = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: { startDate, endDate, dimensions: ['page'], rowLimit: 50 },
  });
  const topPages = (pagesRes.data.rows || []).map(row => ({
    page: row.keys?.[0] || '',
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));

  // Devices
  const devicesRes = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: { startDate, endDate, dimensions: ['device'] },
  });
  const devices = (devicesRes.data.rows || []).map(row => ({
    device: row.keys?.[0] || '',
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
  }));

  return {
    impressions: (overview as { impressions?: number }).impressions || 0,
    clicks: (overview as { clicks?: number }).clicks || 0,
    ctr: (overview as { ctr?: number }).ctr || 0,
    position: (overview as { position?: number }).position || 0,
    topQueries,
    topPages,
    devices,
    dateRange: { start: startDate, end: endDate },
  };
}

/**
 * Get site-wide GA4 analytics for a demo showcase site.
 * No slug/page filter — returns full property traffic.
 */
export async function getDemoSiteAnalyticsData(
  ga4PropertyId: string,
  startDate: string,
  endDate: string,
): Promise<AnalyticsData> {
  const auth = getAuth();
  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });
  const property = ga4PropertyId || GA4_PROPERTY_ID;

  // Overview metrics (no dimension filter)
  const overviewRes = await analyticsdata.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'newUsers' },
      ],
    },
  });
  const overviewRow = overviewRes.data.rows?.[0]?.metricValues || [];
  const overview: AnalyticsOverview = {
    sessions: parseInt(overviewRow[0]?.value || '0'),
    totalUsers: parseInt(overviewRow[1]?.value || '0'),
    pageviews: parseInt(overviewRow[2]?.value || '0'),
    avgSessionDuration: parseFloat(overviewRow[3]?.value || '0'),
    bounceRate: parseFloat(overviewRow[4]?.value || '0'),
    newUsers: parseInt(overviewRow[5]?.value || '0'),
  };

  // Traffic sources
  const sourcesRes = await analyticsdata.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: '15',
    },
  });
  const trafficSources: TrafficSource[] = (sourcesRes.data.rows || []).map(row => ({
    source: row.dimensionValues?.[0]?.value || '(direct)',
    medium: row.dimensionValues?.[1]?.value || '(none)',
    sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    users: parseInt(row.metricValues?.[1]?.value || '0'),
  }));

  // Top pages
  const pagesRes = await analyticsdata.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'averageSessionDuration' }, { name: 'bounceRate' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: '20',
    },
  });
  const topPages: PagePerformance[] = (pagesRes.data.rows || []).map(row => ({
    pagePath: row.dimensionValues?.[0]?.value || '',
    pageviews: parseInt(row.metricValues?.[0]?.value || '0'),
    avgTimeOnPage: parseFloat(row.metricValues?.[1]?.value || '0'),
    bounceRate: parseFloat(row.metricValues?.[2]?.value || '0'),
  }));

  // Devices
  const devicesRes = await analyticsdata.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
    },
  });
  const totalDeviceSessions = (devicesRes.data.rows || []).reduce(
    (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'), 0
  );
  const devices: DeviceBreakdown[] = (devicesRes.data.rows || []).map(row => {
    const sessions = parseInt(row.metricValues?.[0]?.value || '0');
    return {
      deviceCategory: row.dimensionValues?.[0]?.value || 'unknown',
      sessions,
      users: parseInt(row.metricValues?.[1]?.value || '0'),
      percentage: totalDeviceSessions > 0 ? (sessions / totalDeviceSessions) * 100 : 0,
    };
  });

  // Geography
  const geoRes = await analyticsdata.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'city' }, { name: 'country' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: '15',
    },
  });
  const geography: GeographicData[] = (geoRes.data.rows || []).map(row => ({
    city: row.dimensionValues?.[0]?.value || '(not set)',
    country: row.dimensionValues?.[1]?.value || '',
    sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    users: parseInt(row.metricValues?.[1]?.value || '0'),
  }));

  // Daily traffic
  const dailyRes = await analyticsdata.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    },
  });
  const dailyTraffic: DailyTraffic[] = (dailyRes.data.rows || []).map(row => ({
    date: row.dimensionValues?.[0]?.value || '',
    sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    users: parseInt(row.metricValues?.[1]?.value || '0'),
    pageviews: parseInt(row.metricValues?.[2]?.value || '0'),
  }));

  return { overview, trafficSources, topPages, devices, geography, dailyTraffic, dateRange: { start: startDate, end: endDate } };
}

// ── Search Console API ───────────────────────────────────────

export interface SearchConsoleData {
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  topQueries: { query: string; impressions: number; clicks: number; ctr: number; position: number }[];
  topPages: { page: string; impressions: number; clicks: number; ctr: number; position: number }[];
  devices: { device: string; impressions: number; clicks: number }[];
  dateRange: { start: string; end: string };
}

export async function getSearchConsoleData(
  slug: string,
  startDate: string,
  endDate: string,
): Promise<SearchConsoleData> {
  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const urlFilter = {
    dimension: 'page' as const,
    operator: 'includingRegex' as const,
    expression: `${SITE_URL}/${slug}/.*|${SITE_URL}/${slug}$`,
  };

  // Fetch overview (totals)
  const overviewRes = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensionFilterGroups: [{ filters: [urlFilter] }],
    },
  });

  const overview = overviewRes.data.rows?.[0] || {};

  // Fetch top queries
  const queriesRes = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query'],
      dimensionFilterGroups: [{ filters: [urlFilter] }],
      rowLimit: 25,
    },
  });

  const topQueries = (queriesRes.data.rows || []).map(row => ({
    query: row.keys?.[0] || '',
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));

  // Fetch top pages
  const pagesRes = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page'],
      dimensionFilterGroups: [{ filters: [urlFilter] }],
      rowLimit: 25,
    },
  });

  const topPages = (pagesRes.data.rows || []).map(row => ({
    page: (row.keys?.[0] || '').replace(SITE_URL, ''),
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));

  // Fetch device breakdown
  const devicesRes = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['device'],
      dimensionFilterGroups: [{ filters: [urlFilter] }],
    },
  });

  const devices = (devicesRes.data.rows || []).map(row => ({
    device: row.keys?.[0] || '',
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
  }));

  return {
    impressions: (overview as { impressions?: number }).impressions || 0,
    clicks: (overview as { clicks?: number }).clicks || 0,
    ctr: (overview as { ctr?: number }).ctr || 0,
    position: (overview as { position?: number }).position || 0,
    topQueries,
    topPages,
    devices,
    dateRange: { start: startDate, end: endDate },
  };
}

// ── GA4 Analytics Data API ───────────────────────────────────

export interface AnalyticsOverview {
  sessions: number;
  totalUsers: number;
  pageviews: number;
  avgSessionDuration: number;
  bounceRate: number;
  newUsers: number;
}

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
}

export interface PagePerformance {
  pagePath: string;
  pageviews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export interface DeviceBreakdown {
  deviceCategory: string;
  sessions: number;
  users: number;
  percentage: number;
}

export interface GeographicData {
  city: string;
  country: string;
  sessions: number;
  users: number;
}

export interface DailyTraffic {
  date: string;
  sessions: number;
  users: number;
  pageviews: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  trafficSources: TrafficSource[];
  topPages: PagePerformance[];
  devices: DeviceBreakdown[];
  geography: GeographicData[];
  dailyTraffic: DailyTraffic[];
  dateRange: { start: string; end: string };
}

export async function getAnalyticsData(
  slug: string,
  startDate: string,
  endDate: string,
): Promise<AnalyticsData> {
  const auth = getAuth();
  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });

  const pageFilter = {
    filter: {
      fieldName: 'pagePath',
      stringFilter: {
        matchType: 'CONTAINS' as const,
        value: `/${slug}`,
      },
    },
  };

  // Overview metrics
  const overviewRes = await analyticsdata.properties.runReport({
    property: GA4_PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'newUsers' },
      ],
      dimensionFilter: pageFilter,
    },
  });

  const overviewRow = overviewRes.data.rows?.[0]?.metricValues || [];
  const overview: AnalyticsOverview = {
    sessions: parseInt(overviewRow[0]?.value || '0'),
    totalUsers: parseInt(overviewRow[1]?.value || '0'),
    pageviews: parseInt(overviewRow[2]?.value || '0'),
    avgSessionDuration: parseFloat(overviewRow[3]?.value || '0'),
    bounceRate: parseFloat(overviewRow[4]?.value || '0'),
    newUsers: parseInt(overviewRow[5]?.value || '0'),
  };

  // Traffic sources
  const sourcesRes = await analyticsdata.properties.runReport({
    property: GA4_PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
      ],
      dimensionFilter: pageFilter,
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: '15',
    },
  });

  const trafficSources: TrafficSource[] = (sourcesRes.data.rows || []).map(row => ({
    source: row.dimensionValues?.[0]?.value || '(direct)',
    medium: row.dimensionValues?.[1]?.value || '(none)',
    sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    users: parseInt(row.metricValues?.[1]?.value || '0'),
  }));

  // Top pages
  const pagesRes = await analyticsdata.properties.runReport({
    property: GA4_PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
      dimensionFilter: pageFilter,
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: '20',
    },
  });

  const topPages: PagePerformance[] = (pagesRes.data.rows || []).map(row => ({
    pagePath: row.dimensionValues?.[0]?.value || '',
    pageviews: parseInt(row.metricValues?.[0]?.value || '0'),
    avgTimeOnPage: parseFloat(row.metricValues?.[1]?.value || '0'),
    bounceRate: parseFloat(row.metricValues?.[2]?.value || '0'),
  }));

  // Device breakdown
  const devicesRes = await analyticsdata.properties.runReport({
    property: GA4_PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
      ],
      dimensionFilter: pageFilter,
    },
  });

  const totalDeviceSessions = (devicesRes.data.rows || []).reduce(
    (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'), 0
  );

  const devices: DeviceBreakdown[] = (devicesRes.data.rows || []).map(row => {
    const sessions = parseInt(row.metricValues?.[0]?.value || '0');
    return {
      deviceCategory: row.dimensionValues?.[0]?.value || 'unknown',
      sessions,
      users: parseInt(row.metricValues?.[1]?.value || '0'),
      percentage: totalDeviceSessions > 0 ? (sessions / totalDeviceSessions) * 100 : 0,
    };
  });

  // Geography
  const geoRes = await analyticsdata.properties.runReport({
    property: GA4_PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'city' },
        { name: 'country' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
      ],
      dimensionFilter: pageFilter,
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: '15',
    },
  });

  const geography: GeographicData[] = (geoRes.data.rows || []).map(row => ({
    city: row.dimensionValues?.[0]?.value || '(not set)',
    country: row.dimensionValues?.[1]?.value || '',
    sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    users: parseInt(row.metricValues?.[1]?.value || '0'),
  }));

  // Daily traffic (for chart)
  const dailyRes = await analyticsdata.properties.runReport({
    property: GA4_PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
      ],
      dimensionFilter: pageFilter,
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    },
  });

  const dailyTraffic: DailyTraffic[] = (dailyRes.data.rows || []).map(row => ({
    date: row.dimensionValues?.[0]?.value || '',
    sessions: parseInt(row.metricValues?.[0]?.value || '0'),
    users: parseInt(row.metricValues?.[1]?.value || '0'),
    pageviews: parseInt(row.metricValues?.[2]?.value || '0'),
  }));

  return {
    overview,
    trafficSources,
    topPages,
    devices,
    geography,
    dailyTraffic,
    dateRange: { start: startDate, end: endDate },
  };
}

// ── GA4 Realtime API ─────────────────────────────────────────

export interface RealtimeData {
  activeUsers: number;
  activePages: { pagePath: string; activeUsers: number }[];
  activeSources: { source: string; activeUsers: number }[];
  activeDevices: { deviceCategory: string; activeUsers: number }[];
}

export async function getRealtimeData(slug: string): Promise<RealtimeData> {
  const auth = getAuth();
  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });

  const pageFilter = {
    filter: {
      fieldName: 'unifiedScreenName',
      stringFilter: {
        matchType: 'CONTAINS' as const,
        value: `/${slug}`,
      },
    },
  };

  // Active users
  const realtimeRes = await analyticsdata.properties.runRealtimeReport({
    property: GA4_PROPERTY_ID,
    requestBody: {
      metrics: [{ name: 'activeUsers' }],
      dimensionFilter: pageFilter,
    },
  });

  const activeUsers = parseInt(
    realtimeRes.data.rows?.[0]?.metricValues?.[0]?.value || '0'
  );

  // Active pages
  const pagesRes = await analyticsdata.properties.runRealtimeReport({
    property: GA4_PROPERTY_ID,
    requestBody: {
      dimensions: [{ name: 'unifiedScreenName' }],
      metrics: [{ name: 'activeUsers' }],
      dimensionFilter: pageFilter,
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: '10',
    },
  });

  const activePages = (pagesRes.data.rows || []).map(row => ({
    pagePath: row.dimensionValues?.[0]?.value || '',
    activeUsers: parseInt(row.metricValues?.[0]?.value || '0'),
  }));

  // Active sources
  const sourcesRes = await analyticsdata.properties.runRealtimeReport({
    property: GA4_PROPERTY_ID,
    requestBody: {
      dimensions: [{ name: 'firstUserSource' }],
      metrics: [{ name: 'activeUsers' }],
      dimensionFilter: pageFilter,
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: '10',
    },
  });

  const activeSources = (sourcesRes.data.rows || []).map(row => ({
    source: row.dimensionValues?.[0]?.value || '(direct)',
    activeUsers: parseInt(row.metricValues?.[0]?.value || '0'),
  }));

  // Active devices
  const devicesRes = await analyticsdata.properties.runRealtimeReport({
    property: GA4_PROPERTY_ID,
    requestBody: {
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }],
      dimensionFilter: pageFilter,
    },
  });

  const activeDevices = (devicesRes.data.rows || []).map(row => ({
    deviceCategory: row.dimensionValues?.[0]?.value || 'unknown',
    activeUsers: parseInt(row.metricValues?.[0]?.value || '0'),
  }));

  return { activeUsers, activePages, activeSources, activeDevices };
}

// ── URL Inspection API ───────────────────────────────────────

export interface IndexStatus {
  url: string;
  coverageState: string;
  indexingState: string;
  lastCrawlTime: string;
  pageFetchState: string;
  robotsTxtState: string;
}

export async function getUrlIndexStatus(pageUrl: string): Promise<IndexStatus> {
  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const res = await searchconsole.urlInspection.index.inspect({
    requestBody: {
      inspectionUrl: pageUrl,
      siteUrl: SITE_URL,
    },
  });

  const result = res.data.inspectionResult;
  const indexResult = result?.indexStatusResult;

  return {
    url: pageUrl,
    coverageState: indexResult?.coverageState || 'UNKNOWN',
    indexingState: indexResult?.indexingState || 'UNKNOWN',
    lastCrawlTime: indexResult?.lastCrawlTime || '',
    pageFetchState: indexResult?.pageFetchState || 'UNKNOWN',
    robotsTxtState: indexResult?.robotsTxtState || 'UNKNOWN',
  };
}

// ── Helpers ──────────────────────────────────────────────────

/** Get date string N days ago in YYYY-MM-DD format */
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

/** Get today's date in YYYY-MM-DD format */
export function today(): string {
  return new Date().toISOString().split('T')[0];
}
