// The "active" season is the last entry in static/seasons.json — the one CI
// is allowed to overwrite on a nightly basis. Past seasons are immutable on
// disk; if you need to backfill one, use scripts/backfill.js.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seasonsPath = path.join(__dirname, '..', '..', 'static', 'seasons.json');

export function activeSeason() {
  const { seasons } = JSON.parse(fs.readFileSync(seasonsPath, 'utf8'));
  if (!Array.isArray(seasons) || seasons.length === 0) {
    throw new Error('static/seasons.json is empty or malformed');
  }
  return seasons[seasons.length - 1];
}
