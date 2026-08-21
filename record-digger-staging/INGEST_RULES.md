# Record Digger catalog ingest rules

This branch is a staging area only. Do not merge into the old random_note app.
The final target is a dedicated GitHub Pages site at `bluenote4239-hash.github.io/record-digger/`.

## Goal
Build an exploration catalog of roughly 1,000 jazz albums as the first large seed set, expandable later to tens of thousands.

## Two-phase ingest policy
Do not complete one album end-to-end before moving to the next. Build breadth first, then enrich.

### Phase 1: build the 1,000-album shelf
While totalAlbums is below 1,000, prioritize fast, reliable identification of albums.

Required Phase 1 fields:
- id: fixed `rec_XXXXXXXX` ID
- artist
- album
- year
- label
- normalizedKey for duplicate checking
- cover: null
- tracks: []
- youtube: null
- playbackStatus: `metadata_only`

Do NOT spend Phase 1 time hunting cover images, full track lists, YouTube videos, timestamps, or current used prices.

### Phase 2: make the shelf playable
After totalAlbums reaches at least 1,000, enrich existing `metadata_only` records in batches.

Enrichment targets:
- cover source(s)
- verified track list
- actual YouTube playlist or full-album video
- reliable track timestamps where available
- provenance/source references

Set `playbackStatus` to `playable` only when enough verified information exists for correct playback. Missing or unverifiable data must remain unresolved rather than guessed.

## Selection policy
- Start mainly from 1950s–1960s jazz, but do not hard-filter to the user's established taste.
- Prefer worthwhile, less-obvious records: sidemen, minor leaders, secondary sessions, small labels and overlooked catalog titles.
- Labels of interest include Prestige, Savoy, Contemporary, Vanguard, Riverside, Bethlehem, Pacific Jazz, Argo, EmArcy, Roost, Jubilee, Mode and related catalogs.
- The used-LP target of roughly JPY 1,000 is a SOFT criterion, not a claim about a specific pressing or current shop inventory. Used price varies by pressing, condition, country and time.
- Avoid building a list made mostly of famous canonical albums.

## Verification policy
Do not invent fields. Prefer cross-checking album metadata against MusicBrainz, Discogs, label discographies, reliable catalog sources and other trustworthy references.

YouTube enrichment:
- Prefer an album playlist (one track per video) when available.
- Otherwise use a full-album video.
- Never fabricate a video ID or playlist ID.
- If a full-album video has reliable timestamps, store track start seconds.
- If timestamps cannot be verified, leave start values absent rather than guessing.

Covers enrichment:
- Prefer Cover Art Archive/MusicBrainz release-group/release art where available.
- Additional external image URLs may be stored as fallbacks.
- Do not store bulk image binaries in GitHub.

## File layout
- `data/catalog.json`: manifest only, with revision and file counts.
- `data/albums-0001.json`, etc.: album data.
- Target about 100 albums per album file. Exact count is not required.

## IDs
IDs are permanent and never reused. Continue monotonically from the highest existing ID.

## Catalog revision
Increment `catalog.json.revision` whenever album files are added or changed. Update `totalAlbums` and file counts at the same time.

## Duplicate policy
Before adding an album, check existing staging JSONs by normalized artist + album. Do not add the same album twice merely because another pressing/reissue exists.
