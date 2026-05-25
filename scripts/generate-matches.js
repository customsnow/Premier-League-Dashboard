#!/usr/bin/env node

// Generate realistic match data for a season based on final standings
// Usage: node scripts/generate-matches.js <league> <season>

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

function generateMatches(standings, numMatches) {
  const teams = standings.map(([_, name]) => name);
  const matches = [];
  const matchCount = {};

  // Initialize match counters
  teams.forEach(team => {
    matchCount[team] = 0;
  });

  // Shuffle teams for random scheduling
  const shuffled = [...teams].sort(() => Math.random() - 0.5);

  // Generate round-robin schedule
  for (let day = 1; day <= numMatches; day++) {
    for (let i = 0; i < teams.length - 1; i++) {
      if (matches.length >= numMatches) break;

      const homeIdx = (i + day - 1) % teams.length;
      const awayIdx = (i + day) % teams.length;
      const home = teams[homeIdx];
      const away = teams[awayIdx];

      if (home === away || matchCount[home] >= numMatches || matchCount[away] >= numMatches) {
        continue;
      }

      // Generate realistic score based on league standings
      const homeStanding = standings.find(s => s[1] === home);
      const awayStanding = standings.find(s => s[1] === away);

      const homePos = standings.indexOf(homeStanding) + 1;
      const awayPos = standings.indexOf(awayStanding) + 1;

      // Higher ranked teams tend to win more
      const homeWinChance = 0.3 + (awayPos - homePos) * 0.05;
      const drawChance = 0.25;

      let homeGoals, awayGoals;
      const rand = Math.random();

      if (rand < homeWinChance) {
        homeGoals = Math.floor(Math.random() * 3) + 1;
        awayGoals = Math.floor(Math.random() * homeGoals);
      } else if (rand < homeWinChance + drawChance) {
        const goals = Math.floor(Math.random() * 3) + 1;
        homeGoals = goals;
        awayGoals = goals;
      } else {
        awayGoals = Math.floor(Math.random() * 3) + 1;
        homeGoals = Math.floor(Math.random() * awayGoals);
      }

      const dateObj = new Date('2025-08-01');
      dateObj.setDate(dateObj.getDate() + Math.floor(day * 3));
      const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

      matches.push({
        d: dateStr,
        h: home,
        a: away,
        hg: homeGoals,
        ag: awayGoals
      });

      matchCount[home]++;
      matchCount[away]++;
    }
  }

  return matches;
}

async function main() {
  const args = process.argv.slice(2);
  const league = args[0] || 'championship';
  const season = args[1] || '2025-26';

  const standingsPath = path.join(dataDir, league, 'standings', `${season}.json`);

  if (!fs.existsSync(standingsPath)) {
    console.error(`❌ Standings file not found: ${standingsPath}`);
    process.exit(1);
  }

  const standings = JSON.parse(fs.readFileSync(standingsPath, 'utf8'));

  // Determine number of matches (38 for PL, 46 for Championship/League One)
  const numMatches = league === 'premier-league' ? 38 : 46;

  const matches = generateMatches(standings, numMatches);

  const outputPath = path.join(dataDir, league, 'matches', `${season}.json`);

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(matches, null, 2));
  console.log(`✅ Generated ${matches.length} matches for ${league} ${season}`);
  console.log(`   Saved to: ${outputPath}`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
