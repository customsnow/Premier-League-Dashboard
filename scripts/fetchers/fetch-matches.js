// Fetch match results for a single season from ESPN.
//
// Returns a fresh array of matches in our canonical shape:
//   [{ d: "DD/MM/YYYY", h: "Home", a: "Away", hg: 1, ag: 0, status?: "STATUS_FINAL" }, …]
//
// For the active season the simple /scoreboard endpoint returns recent matches.
// For past seasons ESPN's scoreboard requires date ranges; we don't iterate
// those yet — caller will receive `null` and is expected to leave the existing
// data file alone.

import { activeSeason } from '../utils/active-season.js';
import espnApi from '../utils/espn-api.js';

// Map league IDs to ESPN league IDs
const LEAGUE_ESPN_ID = {
  'premier-league': 'eng.1',
  'championship': 'eng.2',
  'efl-league-one': 'eng.3',
};

export async function fetchMatchesForSeason(season, leagueId = 'premier-league') {
  if (season !== activeSeason()) {
    // No date-range fetcher yet. Callers must preserve existing data.
    return null;
  }

  const espnLeagueId = LEAGUE_ESPN_ID[leagueId] || 'eng.1';
  const fetched = await espnApi.getMatchResults(null, 100, espnLeagueId);
  if (!fetched || fetched.length === 0) return null;
  return fetched;
}
