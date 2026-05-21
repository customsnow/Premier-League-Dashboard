# Data-Driven Dashboard Architecture

> **Agents: read `CLAUDE.md` first.** Short version: never hand-edit `index.html`; it's a build artifact.

## Overview

The Premier League Dashboard is a data-driven static site. A single template (`template/index.html.template`) is composed with JSON in `data/` and `static/` into one `index.html` at build time. The build is deterministic, runs locally with `npm run build`, and runs nightly in CI.

## Layout

```
premier-league-dashboard/
├── index.html                           ← BUILD ARTIFACT (do not edit)
├── CLAUDE.md                            ← Agent guide (read first)
├── ARCHITECTURE.md                      ← This file
├── QUICK_REFERENCE.md                   ← Common task recipes
├── template/
│   └── index.html.template              ← Edit this for HTML/CSS/JS
├── static/                              ← CURATED data (hand-edited)
│   ├── teams.json
│   ├── short-names.json
│   ├── logos.json                       ← team → local logo path
│   ├── logos/                           ← downloaded PNGs (committed)
│   ├── seasons.json                     ← fetcher config (fetchFrom)
│   ├── notes.json
│   ├── team-notes.json
│   ├── fun-facts.json
│   ├── european-cups.json
│   └── espn-names.json
├── data/                                ← FETCHED data, one file per season
│   ├── standings/<season>.json
│   ├── matches/<season>.json
│   └── fixtures/<season>.json
├── scripts/
│   ├── build-html.js                    ← template + data + static → index.html
│   ├── fetcher.js                       ← unified fetcher CLI (all sources, all seasons)
│   ├── fetchers/
│   │   ├── fetch-matches.js             ← per-season matches module
│   │   ├── fetch-fixtures.js            ← per-season fixtures module
│   │   └── fetch-logos.js               ← one-shot logo downloader
│   └── utils/
│       ├── active-season.js             ← derives active season from current date
│       ├── derive-standings.js          ← computes standings from matches
│       └── espn-api.js                  ← ESPN API client
├── .github/workflows/
│   ├── nightly-update.yml               ← nightly fetch + rebuild + commit
│   └── deploy-pages.yml                 ← deploy index.html to GitHub Pages
└── package.json
```

## Build pipeline

```
   static/*.json   ──┐
                     ├──► build-html.js ──► template/index.html.template
   data/<type>/      │         │                       │
     <season>.json ──┘         │                       │
                     window.__DATA = {…}               │
                               └──► injected at /* __DATA_INJECTION_POINT__ */
                                                       │
                                                       ▼
                                                  index.html
```

`build-html.js`:
1. Reads curated JSON from `static/` (`teams`, `shortNames`, `logos`, `notes`, `europeanCups`, `funFacts`, `teamNotes`, `espnNames`).
2. Reads per-season files from `data/standings/`, `data/matches/`, `data/fixtures/` and merges each into `{ "1992-93": …, "2025-26": … }`.
3. Composes one `{ teams, shortNames, logos, seasons, notes, standings, matches, fixtures, … }` object.
4. Injects it at the template marker as `<script>window.__DATA = {…};</script>`.
5. Writes `index.html`.

Inside the template, aliases like `const RAW = window.__DATA.standings;` give the in-template JS familiar names.

## Fetcher

`scripts/fetcher.js` is one CLI for all sources and seasons:

```bash
npm run fetch                        # active season (default)
npm run fetch -- --all               # iterate fetchFrom → active
npm run fetch -- --season=2024-25    # one season
npm run fetch -- --type=matches      # one data type
npm run fetch -- --no-cache          # bypass TTL gate
```

- **Active season** is derived from the current date (Aug → May rollover). Nothing in the repo hardcodes a specific season.
- **Cache**: TTL gates the API call; SHA-256 of merged data gates the file write. Cache sidecars live in `data/.cache/` (gitignored).
- **Safety**: existing data is never lost — empty/null fetches preserve what's on disk.

## Commands

```bash
npm install
npm run build       # template + data → index.html
npm run dev         # build + serve on http://localhost:8000
npm run fetch …     # see fetcher flags above
npm run fetch-logos # one-shot logo downloader
npm run extract     # legacy: extract JSON from old monolithic HTML
npm run validate    # validate JSON shapes
npm run test        # run tests
```

## CI

- **`.github/workflows/nightly-update.yml`** — daily at 02:00 UTC: fetch → rebuild → commit only if data changed.
- **`.github/workflows/deploy-pages.yml`** — deploys `index.html` to GitHub Pages.

Both run `npm run build`. Neither hand-edits `index.html`. Don't add steps that do.

## Data shapes

### `static/teams.json`
```json
{ "teams": [ { "name": "Arsenal", "color": "#EF0107" } ] }
```

### `data/standings/<season>.json`
```json
[ [1, "Manchester United", 42, 24, 12, 6, 80, 47, 84] ]
```
Tuple order: Position, Team, GP, W, D, L, GF, GA, Pts.

### `data/matches/<season>.json`
```json
[ { "d": "15/08/2025", "h": "Man Utd", "a": "Fulham", "hg": 1, "ag": 0 } ]
```

### `data/fixtures/<season>.json`
```json
[ { "d": "24/05/2026", "h": "Brighton", "a": "Man Utd", "time": "15:00" } ]
```

### `static/notes.json`
```json
{
  "1992-93": {
    "champion": "Manchester United",
    "topScorer": { "name": "Alan Shearer", "team": "Blackburn Rovers", "goals": 34 }
  }
}
```

## Design decisions

- **Build-time data injection (not runtime fetch)** — no CORS issues on GitHub Pages, deterministic builds, data changes visible in git history.
- **Per-season files in `data/`** — past seasons are immutable, only the active season churns nightly.
- **Curated vs. fetched split (`static/` vs. `data/`)** — anything a human hand-tunes (logos, abbreviations, notes) lives in `static/`; anything refreshable from an API lives in `data/`.
- **Unified fetcher** — one CLI, one cache strategy, one cache layout. Easier to reason about than per-source scripts.
- **Graceful degradation** — fetch failures preserve prior data; the dashboard never goes blank.

## History

The original `index.html` was a 332 KB monolith with all data hardcoded inline. The 2.0 rewrite extracted data into JSON and introduced the template + build pipeline. Stray top-level HTML files (`index.html`, `index 2.html`) were removed in commit `5c11892`. Do not reintroduce them.
