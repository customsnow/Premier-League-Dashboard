#!/usr/bin/env node
// Fetch upcoming fixtures for the active season from ESPN and write to
// data/fixtures/<active>.json. The fetched list replaces the file's
// contents — fixtures are authoritative from the API, not merged.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import espnApi from '../utils/espn-api.js';
import { activeSeason } from '../utils/active-season.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..', '..');
const dataDir = path.join(rootDir, 'data');

export async function fetchFixtures({ season = activeSeason() } = {}) {
  const fixturesPath = path.join(dataDir, 'fixtures', `${season}.json`);

  try {
    console.log(`  🔄 Fetching upcoming fixtures for ${season} (next 30 days)…`);

    const fixtures = await espnApi.getFixtures(30);
    if (!fixtures || fixtures.length === 0) {
      console.log('     ⚠️  No fixture data retrieved from ESPN');
      return false;
    }

    fixtures.sort((a, b) => {
      const da = new Date(a.d.split('/').reverse().join('-'));
      const db = new Date(b.d.split('/').reverse().join('-'));
      return da - db;
    });

    fs.mkdirSync(path.dirname(fixturesPath), { recursive: true });
    fs.writeFileSync(fixturesPath, JSON.stringify(fixtures, null, 2) + '\n');

    console.log(`     ✓ data/fixtures/${season}.json (${fixtures.length} upcoming)`);
    return true;
  } catch (error) {
    console.error('     ❌ Error fetching fixtures:', error.message);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const success = await fetchFixtures();
  process.exit(success ? 0 : 1);
}

export default { fetchFixtures };
