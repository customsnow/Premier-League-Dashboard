#!/usr/bin/env node

import fs from 'fs';

// Load existing Premier League logos
const existingLogos = JSON.parse(fs.readFileSync('data/logos.json', 'utf-8'));
const plLogos = existingLogos.logos;

// Load newly scraped EFL logos
const eflLogos = JSON.parse(fs.readFileSync('scraped-logos-extended.json', 'utf-8'));

// Cleanup function: remove /medium and /tiny suffixes, filter bad URLs
function cleanupUrl(url) {
  return url.replace(/\/(medium|tiny)$/, '');
}

// Filter function: only keep team badges, not league badges
function isValidTeamBadge(url) {
  // Keep team badges, exclude league badges
  return url.includes('/team/badge/');
}

// Merge and deduplicate
const mergedLogos = { ...plLogos };
let addedCount = 0;
let skippedCount = 0;

for (const [team, url] of Object.entries(eflLogos)) {
  const cleanUrl = cleanupUrl(url);
  
  if (!isValidTeamBadge(cleanUrl)) {
    console.log(`  ⊘ ${team}: Not a team badge (skipped)`);
    skippedCount++;
    continue;
  }
  
  // Check if team already exists in Premier League
  if (mergedLogos[team]) {
    console.log(`  ~ ${team}: Already exists in PL logos (keeping PL version)`);
    continue;
  }
  
  mergedLogos[team] = cleanUrl;
  addedCount++;
  console.log(`  ✓ ${team}`);
}

// Save merged logos
const outputData = { logos: mergedLogos };
fs.writeFileSync('data/logos.json', JSON.stringify(outputData, null, 2));

console.log(`\n📊 Summary`);
console.log(`   Existing PL logos: ${Object.keys(plLogos).length}`);
console.log(`   EFL logos added: ${addedCount}`);
console.log(`   League badges skipped: ${skippedCount}`);
console.log(`   Total teams: ${Object.keys(mergedLogos).length}`);
console.log(`\n✅ Updated data/logos.json with ${addedCount} new team logos`);

// Show teams now covered
const uniqueTeams = Object.keys(mergedLogos).sort();
console.log(`\n📋 Teams now covered (${uniqueTeams.length}):`);
uniqueTeams.forEach((team, i) => {
  if ((i + 1) % 5 === 0) {
    console.log(`   ${i+1}. ${team}`);
  }
});
console.log(`   ... and more`);

