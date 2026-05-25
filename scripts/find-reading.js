#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

async function findReading() {
  console.log('🔍 Searching for Reading logo on all EFL league pages...\n');

  const leagues = [
    {
      name: 'Championship',
      url: 'https://www.thesportsdb.com/league/4329-english-league-championship',
    },
    { name: 'League 1', url: 'https://www.thesportsdb.com/league/4396-english-league-1' },
    { name: 'League 2', url: 'https://www.thesportsdb.com/league/4397-english-league-2' },
  ];

  for (const league of leagues) {
    console.log(`Checking ${league.name}...`);

    try {
      const response = await fetch(league.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await response.text();
      const dom = new JSDOM(html);
      const doc = dom.window.document;

      // Find all images and text
      const allText = doc.body.textContent;
      if (allText.includes('Reading')) {
        console.log(`  ✓ Found "Reading" on page`);

        // Search for badge near Reading
        const images = doc.querySelectorAll('img[src*="/team/badge/"]');
        for (const img of images) {
          const parent = img.closest('tr, td, div, li');
          if (parent?.textContent?.includes('Reading')) {
            const url = img.src.replace('/medium', '').replace('/tiny', '');
            if (url.includes('/team/badge/')) {
              console.log(`    Found badge: ${url}\n`);
              return url;
            }
          }
        }

        console.log(`  Partial match found but no team badge\n`);
      } else {
        console.log(`  Not on this page\n`);
      }
    } catch (error) {
      console.error(`  Error: ${error.message}\n`);
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  console.log('❌ Reading logo not found on any EFL page');
  console.log('\nTrying direct TheSportsDB search...');

  // Try API search
  try {
    const response = await fetch(
      'https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?n=Reading',
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const reading = data.results.find(
        (t) => t.strTeam === 'Reading FC' || t.strTeam === 'Reading',
      );
      if (reading?.strTeamBadge) {
        const url = reading.strTeamBadge
          .replace('www.thesportsdb.com', 'r2.thesportsdb.com')
          .replace('/medium', '');
        console.log(`Found via API: ${url}`);
        return url;
      }
    }
  } catch (error) {
    console.error(`API search error: ${error.message}`);
  }

  return null;
}

findReading().then((url) => {
  if (url) {
    console.log(`\n✅ Found Reading logo: "${url}"`);
  } else {
    console.log(`\n❌ Unable to find Reading logo`);
  }
});
