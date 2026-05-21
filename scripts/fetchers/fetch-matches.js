#!/usr/bin/env node
// Fetch match results for the active season from ESPN and write to
// data/matches/<active>.json. Also derive standings from the matches and
// write data/standings/<active>.json — match-derived is the source of truth
// for the live season.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import espnApi from '../utils/espn-api.js';
import { activeSeason } from '../utils/active-season.js';
import { deriveStandings } from '../utils/derive-standings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..', '..');
const dataDir = path.join(rootDir, 'data');

export async function fetchMatches({ season = activeSeason() } = {}) {
  const matchesPath = path.join(dataDir, 'matches', `${season}.json`);
  const standingsPath = path.join(dataDir, 'standings', `${season}.json`);

  try {
    console.log(`  🔄 Fetching match results for ${season}…`);

    const fetched = await espnApi.getMatchResults(null, 100);
    if (!fetched || fetched.length === 0) {
      console.log('     ⚠️  No match data retrieved from ESPN');
      return false;
    }

    // Merge into existing season file (keeps any matches the API drops from its window).
    fs.mkdirSync(path.dirname(matchesPath), { recursive: true });
    const existing = fs.existsSync(matchesPath)
      ? JSON.parse(fs.readFileSync(matchesPath, 'utf8'))
      : [];
    const seen = new Set(existing.map(m => `${m.d}${m.h}${m.a}`));
    let added = 0;
    for (const m of fetched) {
      const key = `${m.d}${m.h}${m.a}`;
      if (!seen.has(key)) { existing.push(m); seen.add(key); added++; }
    }
    existing.sort((a, b) => {
      const da = new Date(a.d.split('/').reverse().join('-'));
      const db = new Date(b.d.split('/').reverse().join('-'));
      return db - da;
    });
    fs.writeFileSync(matchesPath, JSON.stringify(existing, null, 2) + '\n');
    console.log(`     ✓ data/matches/${season}.json (${existing.length} total, ${added} new)`);

    // Re-derive standings from the merged matches.
    fs.mkdirSync(path.dirname(standingsPath), { recursive: true });
    const standings = deriveStandings(existing);
    fs.writeFileSync(standingsPath, JSON.stringify(standings, null, 2) + '\n');
    console.log(`     ✓ data/standings/${season}.json (${standings.length} teams, match-derived)`);

    return true;
  } catch (error) {
    console.error('     ❌ Error fetching match results:', error.message);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const success = await fetchMatches();
  process.exit(success ? 0 : 1);
}

export default { fetchMatches };
