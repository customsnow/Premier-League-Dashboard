# Agent guide — Premier League Dashboard

**Read this before editing anything.** This project is data-driven and template-based. `index.html` is a **build artifact**, not a source file.

## Hard rules

1. **Never write or edit `index.html` by hand.** It's generated from `template/index.html.template` + `data/` + `static/` by `scripts/build-html.js`. Hand-rolling HTML defeats the entire architecture and will be overwritten on the next build.
2. **Never create a new `index.html`, `index 2.html`, or any other top-level HTML page.** If you think the site needs new HTML, edit the template.
3. **Never embed data (standings, matches, fixtures, team metadata) directly into the template or any JS.** Data goes in `data/` or `static/` as JSON; the build injects it as `window.__DATA`.
4. **Don't bypass the fetcher.** Use `npm run fetch` (and its flags) to refresh `data/`. Don't hand-write fetched season files unless patching a specific bug.

## Architecture in one screen

```
template/index.html.template     ← edit for HTML/CSS/JS changes
        │
        ▼
scripts/build-html.js            ← composes window.__DATA, injects at /* __DATA_INJECTION_POINT__ */
        │   ▲
        │   ├── static/*.json    ← CURATED (hand-edited): teams, logos, short-names, seasons, notes, …
        │   └── data/<type>/<season>.json
        │                        ← FETCHED (CI/fetcher): standings, matches, fixtures
        ▼
index.html                       ← BUILD ARTIFACT. Do not edit.
```

The template reads everything from `window.__DATA`. Aliases like `const RAW = window.__DATA.standings;` give the in-template JS familiar names.

## Where to make a change

| You want to change… | Edit this | Then run |
|---|---|---|
| Page layout, styles, client-side JS | `template/index.html.template` | `npm run build` |
| Team colors, abbreviations, logos | `static/teams.json`, `static/short-names.json`, `static/logos.json` | `npm run build` |
| Season notes, fun facts, team notes | `static/notes.json`, `static/fun-facts.json`, `static/team-notes.json` | `npm run build` |
| Season list / fetcher config | `static/seasons.json` | `npm run build` (and re-fetch if needed) |
| Standings / matches / fixtures | **Don't hand-edit.** Use `npm run fetch` | `npm run build` |
| Build composition logic | `scripts/build-html.js` | `npm run build` |
| Fetching logic | `scripts/fetcher.js`, `scripts/fetchers/*` | `npm run fetch -- …` |

## Commands

```bash
npm run build                        # template + data → index.html
npm run dev                          # build + serve on :8000
npm run fetch                        # fetch active season
npm run fetch -- --all               # iterate fetchFrom → active
npm run fetch -- --season=2024-25    # one season
npm run fetch -- --type=matches      # one data type
npm run fetch -- --no-cache          # bypass TTL gate
```

Active season is derived from the current date (Aug → May rollover). Nothing hardcodes a season.

## Data shapes (canonical)

```jsonc
// static/teams.json
{ "teams": [ { "name": "Arsenal", "color": "#EF0107" } ] }

// data/standings/<season>.json
[ [1, "Manchester United", 42, 24, 12, 6, 80, 47, 84] ]   // P, team, GP, W, D, L, GF, GA, Pts

// data/matches/<season>.json
[ { "d": "15/08/2025", "h": "Man Utd", "a": "Fulham", "hg": 1, "ag": 0 } ]

// data/fixtures/<season>.json
[ { "d": "24/05/2026", "h": "Brighton", "a": "Man Utd", "time": "15:00" } ]

// static/notes.json
{ "1992-93": { "champion": "Manchester United",
                "topScorer": { "name": "Alan Shearer", "team": "Blackburn Rovers", "goals": 34 } } }
```

## CI

- `.github/workflows/nightly-update.yml` — fetches data, rebuilds, commits if changed
- `.github/workflows/deploy-pages.yml` — deploys `index.html` to GitHub Pages

Don't add steps that hand-edit `index.html` in CI. The build is the only writer.

## If you're tempted to…

- **"Just write a quick standalone HTML page to test something"** → don't. Add it to the template behind a flag, or build a minimal script that reads the JSON directly. Stray HTML files have been deleted from this repo (see commit `5c11892`); don't reintroduce them.
- **"Inline a small bit of data so I don't have to rebuild"** → don't. Add it to the right JSON file under `static/` or `data/` and rebuild.
- **"Edit `index.html` because the template diff is noisier"** → don't. `index.html` is gitignored-in-spirit (currently persisted only for an iCloud sync quirk; see `.gitignore`).

## Further reading

- `ARCHITECTURE.md` — full design rationale and history
- `QUICK_REFERENCE.md` — common task recipes
