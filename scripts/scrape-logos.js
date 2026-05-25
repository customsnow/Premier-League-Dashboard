#!/usr/bin/env node

const https = require('node:https');

const LEAGUE_PAGE = 'https://www.thesportsdb.com/league/4328-english-premier-league';

function scrapeLogo() {
  https
    .get(LEAGUE_PAGE, (res) => {
      let html = '';

      res.on('data', (chunk) => {
        html += chunk;
      });

      res.on('end', () => {
        console.log('Fetching Premier League page...');

        // Find all team badge images
        const logoRegex = /<img[^>]*src="([^"]*badge[^"]*\.png)"[^>]*alt="([^"]*)"[^>]*>/gi;
        const logos = {};
        let match = logoRegex.exec(html);
        while (match !== null) {
          const url = match[1];
          const alt = match[2];

          // Clean up the alt text to get team name
          const teamName = alt.replace(/\s+badge.*$/i, '').trim();

          if (teamName && url) {
            logos[teamName] = url;
            console.log(`Found: ${teamName}`);
          }
          match = logoRegex.exec(html);
        }

        console.log(`\nTotal logos found: ${Object.keys(logos).length}`);

        // Display the results
        console.log('\nLogos object:');
        console.log(JSON.stringify(logos, null, 2));
      });
    })
    .on('error', (error) => {
      console.error('Error fetching page:', error);
    });
}

scrapeLogo();
