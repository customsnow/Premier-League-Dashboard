# Quick Reference

> Agents: read `CLAUDE.md` first. `index.html` is generated — don't hand-edit it.

## Commands

```bash
npm install                          # first-time setup
npm run build                        # template + data → index.html
npm run dev                          # build + serve on :8000
npm run fetch                        # fetch active season
npm run fetch -- --all               # fetch every season from fetchFrom → active
npm run fetch -- --season=2024-25    # one season
npm run fetch -- --type=matches      # one type (standings|matches|fixtures)
npm run fetch -- --no-cache          # bypass TTL gate
npm run fetch-logos                  # one-shot logo download
npm run validate                     # validate JSON shapes
npm run test                         # run tests
```

## Where to edit

| Change | File | Then |
|---|---|---|
| HTML / CSS / client JS | `template/index.html.template` | `npm run build` |
| Team colors | `static/teams.json` | `npm run build` |
| Team abbreviations | `static/short-names.json` | `npm run build` |
| Logo mapping | `static/logos.json` | `npm run build` |
| Season notes / top scorers | `static/notes.json` | `npm run build` |
| Per-team notes | `static/team-notes.json` | `npm run build` |
| Fun facts | `static/fun-facts.json` | `npm run build` |
| European cups | `static/european-cups.json` | `npm run build` |
| Fetcher config (seasons) | `static/seasons.json` | `npm run fetch -- --all` then `npm run build` |
| Standings / matches / fixtures | **don't hand-edit** — `npm run fetch …` | `npm run build` |
| Build composition | `scripts/build-html.js` | `npm run build` |
| Fetcher logic | `scripts/fetcher.js`, `scripts/fetchers/*` | re-run fetcher |
| **`index.html`** | ❌ never — it's generated | — |

## Data layout

```
static/                          ← curated (hand-edited)
  teams.json
  short-names.json
  logos.json
  notes.json
  …

data/                            ← fetched (one file per season)
  standings/<season>.json
  matches/<season>.json
  fixtures/<season>.json
```

## Data shapes

```jsonc
// static/teams.json
{ "teams": [ { "name": "Arsenal", "color": "#EF0107" } ] }

// static/short-names.json
{ "shortNames": { "Manchester United": "Man Utd" } }

// data/standings/<season>.json
[ [1, "Manchester United", 42, 24, 12, 6, 80, 47, 84] ]   // P, team, GP, W, D, L, GF, GA, Pts

// data/matches/<season>.json
[ { "d": "15/08/2025", "h": "Man Utd", "a": "Fulham", "hg": 1, "ag": 0 } ]

// data/fixtures/<season>.json
[ { "d": "24/05/2026", "h": "Brighton", "a": "Man Utd", "time": "15:00" } ]

// static/notes.json
{ "2025-26": { "champion": "TBD",
                "topScorer": { "name": "…", "team": "…", "goals": 0 } } }
```

## Typical flows

### Update standings/matches/fixtures
```bash
npm run fetch                    # active season (or --season=YYYY-YY)
npm run build
npm run dev                      # eyeball
git add data/<type>/<season>.json
git commit -m "chore: update <type> for <season>"
```

### Tweak the template
```bash
# edit template/index.html.template
npm run build
npm run dev
git add template/index.html.template
git commit -m "feat: …"
```

### Add or correct curated data
```bash
# edit the relevant static/*.json
npm run build
npm run dev
git add static/<file>.json
git commit -m "chore: …"
```

## CI

| Workflow | Trigger | What it does |
|---|---|---|
| `nightly-update.yml` | 02:00 UTC + manual | `npm run fetch`, `npm run build`, commit if data changed |
| `deploy-pages.yml` | push to main | deploy `index.html` to GitHub Pages |

Manual trigger: **Actions → Nightly Data Update → Run workflow**.

## Troubleshooting

| Problem | Check |
|---|---|
| Dashboard didn't update | Did you `npm run build` after editing? |
| Build fails | `template/index.html.template` present? JSON valid? |
| Dev server won't bind to 8000 | Something else on the port — `lsof -ti:8000` |
| JSON syntax error | `cat file.json \| python3 -m json.tool` |
| Nightly didn't run | Actions tab → Nightly Data Update → logs |
| ESPN API errors | Transient — fetcher preserves prior data, retry tomorrow |

## Notes

- **Active season** is derived from the current date (Aug → May rollover). Nothing hardcodes a specific season.
- **Cache**: TTL gates the API call, SHA-256 gates the file write. Sidecars in `data/.cache/` (gitignored).
- **Logos** live under `static/logos/` (committed PNGs). `static/logos.json` maps team name → file path.

## See also

- `CLAUDE.md` — agent guide and hard rules
- `ARCHITECTURE.md` — full design rationale and data shapes
