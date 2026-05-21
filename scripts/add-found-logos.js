#!/usr/bin/env node

import fs from 'fs';

// Load current logos
const logos = JSON.parse(fs.readFileSync('data/logos.json', 'utf-8')).logos;

// Add found logos
const found = {
  'Bradford City': 'https://r2.thesportsdb.com/images/media/team/badge/trwxxv1424033151.png',
  'Hull City': 'https://r2.thesportsdb.com/images/media/team/badge/fbqqda1601726113.png',
  'Oldham Athletic': 'https://r2.thesportsdb.com/images/media/team/badge/36hve81625514026.png',
  'Portsmouth': 'https://r2.thesportsdb.com/images/media/team/badge/j13pfe1601726274.png',
  'Swansea City': 'https://r2.thesportsdb.com/images/media/team/badge/474rco1686920744.png',
  'Swindon Town': 'https://r2.thesportsdb.com/images/media/team/badge/uwsyup1424033445.png'
};

console.log('Adding found logos:\n');
let addedCount = 0;

for (const [team, url] of Object.entries(found)) {
  if (!logos[team]) {
    logos[team] = url;
    console.log(`  ✓ ${team}`);
    addedCount++;
  } else {
    console.log(`  ~ ${team} (already exists)`);
  }
}

// Save
fs.writeFileSync('data/logos.json', JSON.stringify({ logos }, null, 2));

console.log(`\n✅ Added ${addedCount} logos`);
console.log(`\nNote: Reading still missing (not found on Championship page)`);

