#!/usr/bin/env node

import fetch from 'node-fetch';

const missingTeams = [
  'Bradford City',
  'Hull City',
  'Oldham Athletic',
  'Portsmouth',
  'Reading',
  'Swansea City',
  'Swindon Town',
];

async function findLogos() {
  console.log('🔍 Searching for missing team logos...\n');

  const foundLogos = {};

  for (const team of missingTeams) {
    console.log(`Searching for ${team}...`);

    try {
      // Try to fetch TheSportsDB team search
      const searchUrl = `https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?n=${team}`;
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        if (result.strTeamBadge) {
          let badgeUrl = result.strTeamBadge;
          // Convert to r2 CDN format if needed
          badgeUrl = badgeUrl
            .replace('www.thesportsdb.com', 'r2.thesportsdb.com')
            .replace('/medium', '');
          foundLogos[team] = badgeUrl;
          console.log(`  ✓ Found: ${badgeUrl}\n`);
        } else {
          console.log(`  ⚠ Found team but no badge URL\n`);
        }
      } else {
        console.log(`  ✗ Team not found\n`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  return foundLogos;
}

findLogos().then((logos) => {
  console.log('\n📊 Results:\n');
  Object.entries(logos).forEach(([team, url]) => {
    console.log(`"${team}": "${url}",`);
  });

  if (Object.keys(logos).length === 0) {
    console.log('No logos found via API search');
  }
});
