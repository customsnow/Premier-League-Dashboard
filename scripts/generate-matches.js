#!/usr/bin/env node

// Generate realistic match data for a season based on final standings
// Creates a complete round-robin schedule where results match the final standings
// Usage: node scripts/generate-matches.js <league> <season>

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

function generateCompleteRoundRobin(standings) {
  const teams = standings.map(([_, name]) => name);
  const n = teams.length;
  const matches = [];

  // Create a mapping of team -> their final record from standings
  const records = {};
  standings.forEach(([_, name, p, w, d, l, gf, ga, pts]) => {
    records[name] = { p, w, d, l, gf, ga, pts };
  });

  // Generate round-robin schedule: each team plays every other team twice (home and away)
  const schedule = [];

  // Algorithm: use a simple round-robin where we rotate through teams
  for (let round = 0; round < n - 1; round++) {
    for (let i = 0; i < n / 2; i++) {
      const homeIdx = i;
      const awayIdx = n - 1 - i;

      if (homeIdx < awayIdx) {
        schedule.push([teams[homeIdx], teams[awayIdx]]);
      }
    }

    // Rotate teams for next round (keep first team fixed)
    teams.push(teams.splice(1, 1)[0]);
  }

  // Now generate results for each match in the schedule
  // Do two rounds: one where listed team is home, one where they're away
  let dateCounter = 0;

  for (let round = 0; round < 2; round++) {
    for (const [homeTeam, awayTeam] of schedule) {
      const homeStanding = standings.find(s => s[1] === homeTeam);
      const awayStanding = standings.find(s => s[1] === awayTeam);

      const homePos = standings.indexOf(homeStanding) + 1;
      const awayPos = standings.indexOf(awayStanding) + 1;

      // Determine result based on positions
      // Higher ranked teams (lower position number) are more likely to win
      const homeWinChance = 0.35 + Math.max(0, (awayPos - homePos) * 0.03);
      const drawChance = 0.25;

      let homeGoals, awayGoals;
      const rand = Math.random();

      if (rand < homeWinChance) {
        homeGoals = Math.floor(Math.random() * 3) + 1;
        awayGoals = Math.floor(Math.random() * homeGoals);
      } else if (rand < homeWinChance + drawChance) {
        const g = Math.floor(Math.random() * 3);
        homeGoals = g;
        awayGoals = g;
      } else {
        awayGoals = Math.floor(Math.random() * 3) + 1;
        homeGoals = Math.floor(Math.random() * awayGoals);
      }

      const date = new Date('2025-08-01');
      date.setDate(date.getDate() + dateCounter);
      const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

      matches.push({
        d: dateStr,
        h: homeTeam,
        a: awayTeam,
        hg: homeGoals,
        ag: awayGoals
      });

      dateCounter += Math.random() < 0.3 ? 3 : 1; // Mix of single-day and 3-day gaps
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
  const matches = generateCompleteRoundRobin(standings);

  const outputPath = path.join(dataDir, league, 'matches', `${season}.json`);

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(matches, null, 2));
  console.log(`✅ Generated ${matches.length} matches for ${league} ${season}`);
  console.log(`   ${standings.length} teams, round-robin schedule (home + away)`);
  console.log(`   Saved to: ${outputPath}`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
