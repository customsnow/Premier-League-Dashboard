#!/usr/bin/env node
// Explicitly backfill a single past-season data file. The nightly fetchers
// only touch the active season; everything else is treated as immutable on
// disk. If an API correction or a manual data fix is needed for a historical
// season, run this script.
//
// Usage:
//   node scripts/backfill.js --season=2024-25 --type=matches
//   node scripts/backfill.js --season=2024-25 --type=fixtures
//
// Note: "type=standings" is not supported as a direct fetch — for the active
// season, standings are derived from matches. For historical seasons, edit
// data/standings/<season>.json by hand (or extend this script if you wire up
// a historical-standings fetcher).

import { fetchMatches } from './fetchers/fetch-matches.js';
import { fetchFixtures } from './fetchers/fetch-fixtures.js';

function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    const m = arg.match(/^--([\w-]+)=(.+)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const { season, type } = args;

if (!season || !type) {
  console.error('Usage: node scripts/backfill.js --season=YYYY-YY --type=matches|fixtures');
  process.exit(1);
}

if (!/^\d{4}-\d{2}$/.test(season)) {
  console.error(`Invalid season format: ${season}. Expected YYYY-YY (e.g., 2024-25).`);
  process.exit(1);
}

console.log(`🔧 Backfilling ${type} for ${season}\n`);

let ok = false;
switch (type) {
  case 'matches':
    ok = await fetchMatches({ season });
    break;
  case 'fixtures':
    ok = await fetchFixtures({ season });
    break;
  default:
    console.error(`Unknown type: ${type}. Supported: matches, fixtures.`);
    process.exit(1);
}

process.exit(ok ? 0 : 1);
