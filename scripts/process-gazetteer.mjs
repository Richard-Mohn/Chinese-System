/**
 * process-gazetteer.mjs
 *
 * Reads the US Census Gazetteer file and produces a compact JSON
 * file at data/us-cities.json.
 *
 * Format per entry:
 *   { n: "City Name", s: "VA", p: 12345, lat: 37.54, lng: -77.43, t: "city" }
 *
 * Filters:
 *   - Only FUNCSTAT = A (Active government) or S (Statistical / CDP)
 *   - Strips suffixes like " city", " town", " CDP", " village" etc. from names
 *   - Sorted by state then population descending
 */

import { readFileSync, writeFileSync } from 'fs';

const INPUT = 'scripts/gazetteer/2024_Gaz_place_national.txt';
const OUTPUT = 'data/us-cities.json';

const raw = readFileSync(INPUT, 'utf8');
const lines = raw.split('\n').filter(l => l.trim());
const header = lines[0].split('\t').map(h => h.trim());

// Find column indices
const col = (name) => header.indexOf(name);
const iUSPS = col('USPS');
const iNAME = col('NAME');
const iLSAD = col('LSAD');
const iFUNC = col('FUNCSTAT');
const iLAT  = col('INTPTLAT');
const iLNG  = col('INTPTLONG');

// LSAD codes we care about
const LSAD_MAP = {
  '25': 'city',
  '43': 'town',
  '57': 'cdp',    // Census Designated Place (unincorporated)
  '47': 'village',
  '53': 'borough',
  '21': 'borough',
  '37': 'municipality',
};

const places = [];

for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split('\t').map(c => c.trim());
  if (cols.length < header.length) continue;

  const func = cols[iFUNC];
  if (func !== 'A' && func !== 'S') continue; // Active or Statistical only

  const lsad = cols[iLSAD];
  const type = LSAD_MAP[lsad];
  if (!type) continue; // Skip non-place entities

  const state = cols[iUSPS];
  let name = cols[iNAME];

  // Strip the type suffix from name (e.g., "Richmond city" → "Richmond")
  const suffixPatterns = [
    / city$/i, / town$/i, / CDP$/i, / village$/i, / borough$/i,
    / municipality$/i, / comunidad$/i, / zona urbana$/i,
  ];
  for (const pat of suffixPatterns) {
    name = name.replace(pat, '');
  }
  name = name.trim();

  const lat = parseFloat(cols[iLAT]);
  const lng = parseFloat(cols[iLNG]);

  if (!name || !state || isNaN(lat) || isNaN(lng)) continue;

  places.push({
    n: name,
    s: state,
    lat: Math.round(lat * 10000) / 10000,   // 4 decimal places ≈ 11m precision
    lng: Math.round(lng * 10000) / 10000,
    t: type,
  });
}

// Sort: state ASC, then name ASC  
places.sort((a, b) => {
  if (a.s !== b.s) return a.s.localeCompare(b.s);
  return a.n.localeCompare(b.n);
});

// Deduplicate (same name + state, keep first occurrence)
const seen = new Set();
const deduped = places.filter(p => {
  const key = `${p.n}|${p.s}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

writeFileSync(OUTPUT, JSON.stringify(deduped));

console.log(`Processed ${lines.length - 1} records → ${deduped.length} unique places`);
console.log(`Output: ${OUTPUT} (${(readFileSync(OUTPUT).length / 1024).toFixed(0)} KB)`);

// Stats
const states = new Set(deduped.map(p => p.s));
const types = {};
deduped.forEach(p => { types[p.t] = (types[p.t] || 0) + 1; });
console.log(`States: ${states.size}`);
console.log('By type:', types);
