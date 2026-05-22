#!/usr/bin/env node

import fs from 'node:fs';

const standings = JSON.parse(fs.readFileSync('data/standings.json', 'utf-8'));

console.log('🔍 Checking for Wolves vs Wolverhampton variations...\n');

let fixedCount = 0;

for (const [season, teams] of Object.entries(standings)) {
  const hasWolves = teams.some((t) => t[1] === 'Wolves');
  const _hasWolverh = teams.some((t) => t[1] === 'Wolverhampton');

  if (hasWolves) {
    console.log(`Found "Wolves" in ${season}`);
    // Fix it
    teams.forEach((t) => {
      if (t[1] === 'Wolves') {
        t[1] = 'Wolverhampton';
        fixedCount++;
      }
    });
  }
}

// Save fixed data
fs.writeFileSync('data/standings.json', JSON.stringify(standings, null, 2));

console.log(`\n✅ Fixed ${fixedCount} instances of "Wolves" → "Wolverhampton"`);
