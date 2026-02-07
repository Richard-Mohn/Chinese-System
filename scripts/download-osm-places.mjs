#!/usr/bin/env node
/**
 * Download ALL US places from OpenStreetMap via Overpass API
 * Includes: cities, towns, villages, hamlets (+ optionally localities)
 * 
 * Queries state-by-state to avoid timeouts
 * Output: data/us-cities.json in compact format {n, s, lat, lng, t}
 * 
 * Usage: node scripts/download-osm-places.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'us-cities.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'data', 'osm-progress.json');

// Overpass API endpoint
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Delay between requests (ms) - be nice to the API
const DELAY_MS = 6000;

// All 50 states + DC
const STATES = [
  { name: 'Alabama', code: 'AL' },
  { name: 'Alaska', code: 'AK' },
  { name: 'Arizona', code: 'AZ' },
  { name: 'Arkansas', code: 'AR' },
  { name: 'California', code: 'CA' },
  { name: 'Colorado', code: 'CO' },
  { name: 'Connecticut', code: 'CT' },
  { name: 'Delaware', code: 'DE' },
  { name: 'Florida', code: 'FL' },
  { name: 'Georgia', code: 'GA' },
  { name: 'Hawaii', code: 'HI' },
  { name: 'Idaho', code: 'ID' },
  { name: 'Illinois', code: 'IL' },
  { name: 'Indiana', code: 'IN' },
  { name: 'Iowa', code: 'IA' },
  { name: 'Kansas', code: 'KS' },
  { name: 'Kentucky', code: 'KY' },
  { name: 'Louisiana', code: 'LA' },
  { name: 'Maine', code: 'ME' },
  { name: 'Maryland', code: 'MD' },
  { name: 'Massachusetts', code: 'MA' },
  { name: 'Michigan', code: 'MI' },
  { name: 'Minnesota', code: 'MN' },
  { name: 'Mississippi', code: 'MS' },
  { name: 'Missouri', code: 'MO' },
  { name: 'Montana', code: 'MT' },
  { name: 'Nebraska', code: 'NE' },
  { name: 'Nevada', code: 'NV' },
  { name: 'New Hampshire', code: 'NH' },
  { name: 'New Jersey', code: 'NJ' },
  { name: 'New Mexico', code: 'NM' },
  { name: 'New York', code: 'NY' },
  { name: 'North Carolina', code: 'NC' },
  { name: 'North Dakota', code: 'ND' },
  { name: 'Ohio', code: 'OH' },
  { name: 'Oklahoma', code: 'OK' },
  { name: 'Oregon', code: 'OR' },
  { name: 'Pennsylvania', code: 'PA' },
  { name: 'Rhode Island', code: 'RI' },
  { name: 'South Carolina', code: 'SC' },
  { name: 'South Dakota', code: 'SD' },
  { name: 'Tennessee', code: 'TN' },
  { name: 'Texas', code: 'TX' },
  { name: 'Utah', code: 'UT' },
  { name: 'Vermont', code: 'VT' },
  { name: 'Virginia', code: 'VA' },
  { name: 'Washington', code: 'WA' },
  { name: 'West Virginia', code: 'WV' },
  { name: 'Wisconsin', code: 'WI' },
  { name: 'Wyoming', code: 'WY' },
  { name: 'District of Columbia', code: 'DC' },
];

/**
 * Send a query to the Overpass API
 */
function queryOverpass(query) {
  return new Promise((resolve, reject) => {
    const postData = `data=${encodeURIComponent(query)}`;
    
    const url = new URL(OVERPASS_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'MohnMenu-SEO-Data/1.0',
      },
      timeout: 180000, // 3 min timeout
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON parse error: ${e.message}\nResponse: ${data.substring(0, 500)}`));
          }
        } else if (res.statusCode === 429) {
          reject(new Error('RATE_LIMITED'));
        } else if (res.statusCode === 504) {
          reject(new Error('TIMEOUT'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('TIMEOUT'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Build Overpass query for a state
 * Gets all place=city|town|village|hamlet nodes
 */
function buildQuery(stateCode) {
  return `
[out:json][timeout:120];
area["ISO3166-2"="US-${stateCode}"]->.searchArea;
(
  node["place"~"^(city|town|village|hamlet)$"](area.searchArea);
);
out body;
`;
}

/**
 * Sleep for ms milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Map OSM place type to our short type code
 */
function mapPlaceType(osmPlace) {
  switch (osmPlace) {
    case 'city': return 'city';
    case 'town': return 'town';
    case 'village': return 'village';
    case 'hamlet': return 'hamlet';
    default: return osmPlace;
  }
}

/**
 * Extract places from Overpass response
 */
function extractPlaces(response, stateCode) {
  if (!response.elements) return [];
  
  return response.elements
    .filter(el => el.type === 'node' && el.tags && el.tags.name)
    .map(el => ({
      n: el.tags.name,
      s: stateCode,
      lat: Math.round(el.lat * 10000) / 10000,
      lng: Math.round(el.lon * 10000) / 10000,
      t: mapPlaceType(el.tags.place),
    }));
}

/**
 * Load progress from previous run (for resumability)
 */
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
  } catch (e) {
    // ignore
  }
  return { completedStates: [], places: [] };
}

/**
 * Save progress
 */
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress), 'utf8');
}

/**
 * Main download function
 */
async function main() {
  console.log('=== OSM Places Downloader for MohnMenu SEO ===\n');
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log(`States to query: ${STATES.length}`);
  console.log(`Delay between requests: ${DELAY_MS}ms`);
  console.log(`Place types: city, town, village, hamlet\n`);

  // Load progress from previous run
  let progress = loadProgress();
  let allPlaces = progress.places || [];
  const completedStates = new Set(progress.completedStates || []);
  
  if (completedStates.size > 0) {
    console.log(`Resuming from previous run: ${completedStates.size} states already done, ${allPlaces.length} places collected\n`);
  }

  const remainingStates = STATES.filter(s => !completedStates.has(s.code));
  
  for (let i = 0; i < remainingStates.length; i++) {
    const state = remainingStates[i];
    const stateNum = completedStates.size + i + 1;
    const total = STATES.length;
    
    process.stdout.write(`[${stateNum}/${total}] ${state.name} (${state.code})... `);
    
    let retries = 3;
    let success = false;
    
    while (retries > 0 && !success) {
      try {
        const query = buildQuery(state.code);
        const response = await queryOverpass(query);
        const places = extractPlaces(response, state.code);
        
        allPlaces.push(...places);
        completedStates.add(state.code);
        
        // Count by type
        const typeCounts = {};
        places.forEach(p => {
          typeCounts[p.t] = (typeCounts[p.t] || 0) + 1;
        });
        const typeStr = Object.entries(typeCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([t, c]) => `${c} ${t}s`)
          .join(', ');
        
        console.log(`${places.length} places (${typeStr})`);
        success = true;
        
        // Save progress after each state
        saveProgress({
          completedStates: Array.from(completedStates),
          places: allPlaces,
        });
        
      } catch (err) {
        retries--;
        if (err.message === 'RATE_LIMITED') {
          console.log(`Rate limited, waiting 30s... (${retries} retries left)`);
          await sleep(30000);
        } else if (err.message === 'TIMEOUT') {
          console.log(`Timeout, waiting 15s... (${retries} retries left)`);
          await sleep(15000);
        } else {
          console.log(`Error: ${err.message} (${retries} retries left)`);
          await sleep(10000);
        }
      }
    }
    
    if (!success) {
      console.log(`  FAILED after all retries - skipping ${state.name}`);
    }
    
    // Delay before next request
    if (i < remainingStates.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Sort by state, then by name
  allPlaces.sort((a, b) => {
    if (a.s !== b.s) return a.s.localeCompare(b.s);
    return a.n.localeCompare(b.n);
  });

  // Deduplicate (same name + state + similar coords)
  const seen = new Set();
  const deduped = allPlaces.filter(p => {
    const key = `${p.n}|${p.s}|${p.lat}|${p.lng}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Write output
  const json = JSON.stringify(deduped);
  fs.writeFileSync(OUTPUT_FILE, json, 'utf8');

  // Cleanup progress file
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }

  // Summary
  console.log('\n=== DOWNLOAD COMPLETE ===');
  console.log(`Total places: ${deduped.length}`);
  
  const typeTotals = {};
  deduped.forEach(p => {
    typeTotals[p.t] = (typeTotals[p.t] || 0) + 1;
  });
  console.log('\nBy type:');
  Object.entries(typeTotals)
    .sort((a, b) => b[1] - a[1])
    .forEach(([t, c]) => console.log(`  ${t}: ${c}`));

  const stateTotals = {};
  deduped.forEach(p => {
    stateTotals[p.s] = (stateTotals[p.s] || 0) + 1;
  });
  console.log(`\nStates covered: ${Object.keys(stateTotals).length}`);
  console.log(`File size: ${(Buffer.byteLength(json) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\nSaved to: ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
