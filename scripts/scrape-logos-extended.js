#!/usr/bin/env node

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs';

const leagues = [
  { name: 'Championship', url: 'https://www.thesportsdb.com/league/4329-english-league-championship' },
  { name: 'League 1', url: 'https://www.thesportsdb.com/league/4396-english-league-1' },
  { name: 'League 2', url: 'https://www.thesportsdb.com/league/4397-english-league-2' }
];

const allLogos = {};

async function scrapeLeague(league) {
  console.log(`\n🔍 Scraping ${league.name}...`);
  
  try {
    const response = await fetch(league.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Find all team names and their associated logos
    const teamNames = new Set();
    const teamLogos = {};
    
    // Method 1: Find from team-fixture-name-full spans (in fixtures/results)
    doc.querySelectorAll('.team-fixture-name-full').forEach(span => {
      const teamName = span.textContent.trim();
      if (teamName && teamName.length > 0 && teamName.length < 50) {
        teamNames.add(teamName);
      }
    });
    
    // Method 2: Find from team links in tables
    doc.querySelectorAll('a[href*="/team/"]').forEach(link => {
      const text = link.textContent.trim();
      if (text && text.length > 0 && text.length < 50 && !text.includes('http')) {
        teamNames.add(text);
      }
    });
    
    // Now find logos for each team by looking at the page structure
    // Look for image tags near team names
    doc.querySelectorAll('img[src*="badge"]').forEach(img => {
      let src = img.src;
      // Remove /tiny suffix if present
      src = src.replace('/tiny', '');
      
      // Look backwards in the DOM to find associated team name
      let parent = img.parentElement;
      let teamName = null;
      let depth = 0;
      
      while (parent && depth < 5) {
        const textContent = parent.textContent;
        // Look for team-fixture-name-full or team links
        const nameSpan = parent.querySelector('.team-fixture-name-full');
        if (nameSpan) {
          teamName = nameSpan.textContent.trim();
          break;
        }
        
        // Also check text content directly
        for (const name of teamNames) {
          if (textContent.includes(name)) {
            teamName = name;
            break;
          }
        }
        
        if (teamName) break;
        parent = parent.parentElement;
        depth++;
      }
      
      if (teamName && !teamLogos[teamName]) {
        teamLogos[teamName] = src;
      }
    });
    
    // Merge into main object
    Object.assign(allLogos, teamLogos);
    console.log(`   Found ${teamNames.size} teams, extracted ${Object.keys(teamLogos).length} logos`);
    
    // Show sample
    Object.entries(teamLogos).slice(0, 5).forEach(([team, url]) => {
      console.log(`   ✓ ${team}`);
    });
    if (Object.keys(teamLogos).length > 5) {
      console.log(`   ... and ${Object.keys(teamLogos).length - 5} more`);
    }
    
  } catch (error) {
    console.error(`   ❌ Error scraping ${league.name}:`, error.message);
  }
}

async function main() {
  console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿 Scraping English Football League Logos\n');
  
  for (const league of leagues) {
    await scrapeLeague(league);
  }
  
  console.log(`\n\n📊 Summary`);
  console.log(`   Total teams found: ${Object.keys(allLogos).length}`);
  
  // Save to file
  fs.writeFileSync('scraped-logos-extended.json', JSON.stringify(allLogos, null, 2));
  console.log(`\n✅ Saved ${Object.keys(allLogos).length} logos to scraped-logos-extended.json`);
  
  // Show all
  console.log(`\n📝 All teams:\n`);
  Object.entries(allLogos).sort().forEach(([team, url]) => {
    console.log(`   "${team}": "${url}",`);
  });
}

main().catch(console.error);
