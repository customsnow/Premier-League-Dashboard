#!/usr/bin/env node

import fs from 'node:fs';

// Load all data
const teams = JSON.parse(fs.readFileSync('data/teams.json', 'utf-8')).teams;
const logos = JSON.parse(fs.readFileSync('data/logos.json', 'utf-8')).logos;

// Get all team names from teams.json
const teamNames = new Set(teams.map((t) => t.name));
console.log(`Teams in database: ${teamNames.size}`);

// Get all logo keys
const logoNames = Object.keys(logos);
console.log(`Teams with logos: ${logoNames.length}\n`);

// Find missing teams
console.log('📋 Teams missing logos:');
const missing = [];
teams.forEach((team) => {
  if (!logos[team.name]) {
    missing.push(team.name);
    console.log(`  ✗ ${team.name}`);
  }
});

// Find and fix mismatched names
console.log(`\n🔧 Fixing name mismatches...`);
const nameMapping = {
  'Accrington Stanle': 'Accrington Stanley',
  'AFC Wimbledon': 'Wimbledon',
  'Milton Keynes Don': 'Milton Keynes Dons',
  'Peterborough Unit': 'Peterborough United',
  'Queens Park Range': 'QPR',
  'Sheffield Wednesd': 'Sheffield Wednesday',
  'West Bromwich Alb': 'WBA',
  'West Bromwich Albion': 'WBA',
};

const fixedLogos = { ...logos };
let _fixedCount = 0;

for (const [badName, correctName] of Object.entries(nameMapping)) {
  if (fixedLogos[badName]) {
    const url = fixedLogos[badName];
    delete fixedLogos[badName];

    // Only set if not already present (preserve existing entries)
    if (!fixedLogos[correctName]) {
      fixedLogos[correctName] = url;
      console.log(`  ✓ "${badName}" → "${correctName}"`);
      _fixedCount++;
    } else {
      console.log(`  ~ "${badName}" exists, skipping (using existing)`);
    }
  }
}

// Remove duplicates - some teams may have multiple entries
console.log(`\n🧹 Checking for remaining issues...`);
const finalLogos = {};
for (const [name, url] of Object.entries(fixedLogos)) {
  // Normalize names - prefer exact matches from teams.json
  let finalName = name;
  for (const teamName of teamNames) {
    if (name === teamName || name.toLowerCase() === teamName.toLowerCase()) {
      finalName = teamName;
      break;
    }
  }

  if (!finalLogos[finalName]) {
    finalLogos[finalName] = url;
  } else {
    console.log(`  Duplicate found for "${finalName}", keeping first entry`);
  }
}

// Check final coverage
console.log(`\n📊 Final Status:`);
let _coveredCount = 0;
missing.forEach((team) => {
  if (finalLogos[team]) {
    console.log(`  ✓ ${team} (now has logo)`);
    _coveredCount++;
  }
});

const stillMissing = missing.filter((t) => !finalLogos[t]);
console.log(`\n  Total teams with logos: ${Object.keys(finalLogos).length}`);
console.log(`  Still missing: ${stillMissing.length}`);
if (stillMissing.length > 0) {
  console.log(`  Missing: ${stillMissing.join(', ')}`);
}

// Save
fs.writeFileSync('data/logos.json', JSON.stringify({ logos: finalLogos }, null, 2));
console.log(`\n✅ Updated data/logos.json`);
