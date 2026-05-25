#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

const missingTeams = {
  'Bradford City': 'https://www.thesportsdb.com/league/4396-english-league-1',
  'Hull City': 'https://www.thesportsdb.com/league/4329-english-league-championship',
  'Oldham Athletic': 'https://www.thesportsdb.com/league/4397-english-league-2',
  Portsmouth: 'https://www.thesportsdb.com/league/4329-english-league-championship',
  Reading: 'https://www.thesportsdb.com/league/4329-english-league-championship',
  'Swansea City': 'https://www.thesportsdb.com/league/4329-english-league-championship',
  'Swindon Town': 'https://www.thesportsdb.com/league/4397-english-league-2',
};

async function findLogosOnPage(teamName, pageUrl) {
  try {
    const response = await fetch(pageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Look for the team in the page
    let foundUrl = null;

    // Search through all links and images near text containing the team name
    const allElements = doc.querySelectorAll('*');
    for (const el of allElements) {
      if (el.textContent.includes(teamName)) {
        // Look for badge image near this element
        const parent = el.closest('td, tr, div');
        if (parent) {
          const img = parent.querySelector('img[src*="badge"]');
          if (img) {
            let src = img.src;
            src = src.replace('/medium', '').replace('/tiny', '');

            // Only accept team badges
            if (src.includes('/team/badge/')) {
              foundUrl = src;
              break;
            }
          }
        }
      }
    }

    return foundUrl;
  } catch (error) {
    console.error(`Error fetching ${pageUrl}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🔍 Finding missing team logos...\n');

  const results = {};

  for (const [team, url] of Object.entries(missingTeams)) {
    console.log(`Searching for ${team}...`);
    const logoUrl = await findLogosOnPage(team, url);

    if (logoUrl) {
      results[team] = logoUrl;
      console.log(`  ✓ Found: ${logoUrl}\n`);
    } else {
      console.log(`  ✗ Not found\n`);
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  console.log('\n📝 Results:\n');
  Object.entries(results).forEach(([team, url]) => {
    console.log(`"${team}": "${url}",`);
  });

  console.log(`\n✅ Found ${Object.keys(results).length} logos`);
}

main().catch(console.error);
