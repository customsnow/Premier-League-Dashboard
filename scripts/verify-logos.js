#!/usr/bin/env node

import fs from 'fs';

const teams = JSON.parse(fs.readFileSync('data/teams.json', 'utf-8')).teams;
const logos = JSON.parse(fs.readFileSync('data/logos.json', 'utf-8')).logos;

const teamNames = new Set(teams.map(t => t.name));
const covered = teams.filter(t => logos[t.name]);
const missing = teams.filter(t => !logos[t.name]);

console.log('📊 Logo Coverage Report\n');
console.log(`Total teams: ${teams.length}`);
console.log(`Teams with logos: ${covered.length}`);
console.log(`Teams missing logos: ${missing.length}`);
console.log(`Coverage: ${((covered.length / teams.length) * 100).toFixed(1)}%\n`);

if (missing.length > 0) {
  console.log('Missing logos:');
  missing.forEach(t => console.log(`  ✗ ${t.name}`));
}

