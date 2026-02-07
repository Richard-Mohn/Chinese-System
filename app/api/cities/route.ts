/**
 * City Search API — /api/cities?state=VA&q=rich
 * 
 * Searches the 135K+ OSM places dataset.
 * - state (required): 2-letter state code
 * - q (optional): search query (min 3 chars to return results)
 * - limit (optional): max results (default 20, max 50)
 * 
 * Returns: { cities: Array<{ n: string; lat: number; lng: number; t: string }> }
 */

import { NextRequest, NextResponse } from 'next/server';
import citiesData from '@/data/us-cities.json';

interface CityEntry {
  n: string;
  s: string;
  lat: number;
  lng: number;
  t: string;
}

// Pre-index cities by state for fast lookup
const citiesByState: Record<string, CityEntry[]> = {};
for (const city of citiesData as CityEntry[]) {
  if (!citiesByState[city.s]) citiesByState[city.s] = [];
  citiesByState[city.s].push(city);
}

// Sort each state's cities alphabetically
for (const state of Object.keys(citiesByState)) {
  citiesByState[state].sort((a, b) => a.n.localeCompare(b.n));
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const state = searchParams.get('state')?.toUpperCase();
  const query = searchParams.get('q')?.toLowerCase().trim() || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

  if (!state || state.length !== 2) {
    return NextResponse.json(
      { error: 'state parameter required (2-letter code)' },
      { status: 400 }
    );
  }

  const stateCities = citiesByState[state];
  if (!stateCities) {
    return NextResponse.json({ cities: [], total: 0 });
  }

  // If no query or query too short, return count only
  if (query.length < 3) {
    return NextResponse.json({
      cities: [],
      total: stateCities.length,
      message: 'Type at least 3 characters to search',
    });
  }

  // Filter by query — prioritize starts-with matches over contains
  const startsWithMatches: CityEntry[] = [];
  const containsMatches: CityEntry[] = [];

  for (const city of stateCities) {
    const name = city.n.toLowerCase();
    if (name.startsWith(query)) {
      startsWithMatches.push(city);
    } else if (name.includes(query)) {
      containsMatches.push(city);
    }
  }

  // Combine: starts-with first, then contains
  const results = [...startsWithMatches, ...containsMatches].slice(0, limit);

  return NextResponse.json({
    cities: results.map(c => ({ n: c.n, lat: c.lat, lng: c.lng, t: c.t })),
    total: stateCities.length,
  });
}
