#!/usr/bin/env node

import fs from 'node:fs';

const logos = JSON.parse(fs.readFileSync('data/logos.json', 'utf-8')).logos;

logos.Reading = 'https://r2.thesportsdb.com/images/media/team/badge/tprvtu1448811527.png';

fs.writeFileSync('data/logos.json', JSON.stringify({ logos }, null, 2));

console.log('✅ Added Reading logo');
console.log('\n📊 Logo coverage now: 51/51 teams (100%)');
