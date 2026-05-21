#!/usr/bin/env node
// Orchestrate nightly fetches. The matches fetcher also derives standings
// for the active season, so there's no separate standings fetcher.

import { fetchMatches } from './fetchers/fetch-matches.js';
import { fetchFixtures } from './fetchers/fetch-fixtures.js';
import { activeSeason } from './utils/active-season.js';

async function fetchAllData() {
  const season = activeSeason();
  console.log('🔄 Premier League Dashboard — Fetching Latest Data');
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log(`🎯 Active season: ${season}\n`);

  const results = { matches: false, fixtures: false };

  console.log('📥 Fetching data from APIs…\n');
  results.matches = await fetchMatches();
  console.log('');
  results.fixtures = await fetchFixtures();
  console.log('');

  console.log('📊 Fetch Summary:');
  console.log(`  ${results.matches  ? '✓' : '✗'} Matches  (+ derived standings): ${results.matches  ? 'Updated' : 'Failed'}`);
  console.log(`  ${results.fixtures ? '✓' : '✗'} Fixtures:                       ${results.fixtures ? 'Updated' : 'Failed'}`);
  console.log('');

  if (Object.values(results).every(Boolean)) {
    console.log('✅ All data sources fetched successfully');
  } else if (Object.values(results).some(Boolean)) {
    console.log('⚠️  Partial success — some sources failed, continuing with existing data');
  } else {
    console.log('❌ All sources failed — keeping previous data');
  }
  // Always exit 0; the build step downstream uses whatever data is on disk.
  process.exit(0);
}

fetchAllData();
