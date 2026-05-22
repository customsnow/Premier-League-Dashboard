#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

async function findReadingLogo() {
  console.log('🔍 Searching for Reading logo...\n');

  // Try Championship page
  const response = await fetch(
    'https://www.thesportsdb.com/league/4329-english-league-championship',
    {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    },
  );
  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Find all images with badge
  const images = doc.querySelectorAll('img[src*="badge"]');
  console.log(`Total badge images found: ${images.length}\n`);

  // Look through all and find those near "Reading"
  let found = false;
  images.forEach((img, i) => {
    const src = img.src;
    const parent = img.closest('td, tr, div, span');
    if (parent) {
      const text = parent.textContent;
      if (text && (text.includes('Reading') || text.includes('reading'))) {
        console.log(`${i}. ${img.alt || 'no-alt'}`);
        console.log(`   Text: ${text.substring(0, 100)}`);
        console.log(`   URL: ${src.replace('/medium', '').replace('/tiny', '')}`);
        console.log('');
        found = true;
      }
    }
  });

  if (!found) {
    console.log('❌ Reading not found on Championship page');
    console.log('\nTrying alternative search...');

    // Search through all text nodes for "Reading"
    const walker = doc.createTreeWalker(
      doc.body,
      4, // NodeFilter.SHOW_TEXT
      null,
      false,
    );

    let searchCount = 0;
    let node = walker.nextNode();
    while (node) {
      if (node.textContent?.includes('Reading')) {
        searchCount++;
        const parent = node.parentElement;
        if (parent) {
          const badgeImg = parent.closest('tr, td, div')?.querySelector('img[src*="badge"]');
          if (badgeImg) {
            console.log(`Found: ${badgeImg.src}`);
            found = true;
          }
        }
      }
      if (searchCount > 50) break;
      node = walker.nextNode();
    }

    if (!found) {
      console.log('Reading not found anywhere on the page');
    }
  }
}

findReadingLogo().catch(console.error);
