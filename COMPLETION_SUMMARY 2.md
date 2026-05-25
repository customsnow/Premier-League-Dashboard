# 2.0 transformation — completion summary

> **Historical milestone.** This file records what was delivered in the v2.0 rewrite. For the **current** architecture and file layout, read `CLAUDE.md` and `ARCHITECTURE.md` — those are kept up to date as the codebase evolves.

## What changed

The dashboard went from a 332 KB monolithic `index.html` (with all data hardcoded inline) to a data-driven, template-based, automated system.

### Phase 1 — Data extraction
- `scripts/extract-data.js` extracts the inline JS constants to JSON.
- Hand-curated data landed in `static/` (teams, logos, short-names, notes, …).
- Per-season fetched data landed in `data/{standings,matches,fixtures}/<season>.json`.

### Phase 2 — Template + build
- `template/index.html.template` is the single source for HTML/CSS/JS.
- `scripts/build-html.js` composes `window.__DATA` from `static/` + `data/` and injects it at the template's `/* __DATA_INJECTION_POINT__ */` marker.
- `index.html` is now a **build artifact**, not a source file.

### Phase 3 — Fetchers
- `scripts/fetcher.js` is the unified CLI for all sources and seasons (replaced the per-source `fetch-live-standings.js` / `fetch-all.js` scripts from the initial design).
- Per-season modules live in `scripts/fetchers/` (`fetch-matches.js`, `fetch-fixtures.js`, `fetch-logos.js`).
- ESPN API client at `scripts/utils/espn-api.js`.
- TTL-gated API calls; SHA-256-gated file writes; cache sidecars in `data/.cache/` (gitignored).

### Phase 4 — CI/CD
- `.github/workflows/nightly-update.yml` — 02:00 UTC: fetch → build → commit if data changed.
- `.github/workflows/deploy-pages.yml` — deploys `index.html` to GitHub Pages.

### Phase 5 — Documentation
- `CLAUDE.md` — agent guide (read first).
- `ARCHITECTURE.md` — design rationale + data shapes.
- `QUICK_REFERENCE.md` — common task recipes.
- This file — milestone record.

## Where things actually live now

For the current file layout, see `ARCHITECTURE.md`. The short version:

```
template/index.html.template     ← edit for HTML/CSS/JS
static/*.json                    ← curated (hand-edited)
data/<type>/<season>.json        ← fetched (one file per season)
index.html                       ← BUILD ARTIFACT — never hand-edit
```

## Key commands

```bash
npm run build       # template + data → index.html
npm run dev         # build + serve on :8000
npm run fetch …     # see fetcher flags in ARCHITECTURE.md
```

## Status

✅ All phases complete. System is in steady-state operation:
- Nightly updates run unattended.
- Manual edits go through the template + JSON + rebuild flow.
- See `CLAUDE.md` before touching the codebase.

---

**Original completion**: 2026-05-20
**Architecture version**: 2.0 (data-driven, fully automated)
