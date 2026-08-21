# Record Digger catalog ingest rules

This branch is a staging area only. Do not merge into the old random_note app.
The final target is a dedicated GitHub Pages site at `bluenote4239-hash.github.io/record-digger/`.

## Goal
Build an exploration catalog of roughly 1,000 jazz albums as the first large seed set, expandable later to tens of thousands.

## Selection policy
- Start mainly from 1950s–1960s jazz, but do not hard-filter to the user's established taste.
- Prefer worthwhile, less-obvious records: sidemen, minor leaders, secondary sessions, small labels and overlooked catalog titles.
- Labels of interest include Prestige, Savoy, Contemporary, Vanguard, Riverside, Bethlehem, Pacific Jazz, Argo, EmArcy, Roost, Jubilee, Mode and related catalogs.
- The used-LP target of roughly JPY 1,000 is a SOFT criterion, not a claim about a specific pressing or current shop inventory. Used price varies by pressing, condition, country and time.
- Avoid building a list made mostly of famous canonical albums.

## Verification policy
Do not invent fields. Prefer cross-checking album metadata against MusicBrainz/Discogs/label discographies/reliable catalog sources.

Required album fields:
- id: fixed `rec_XXXXXXXX` ID
- artist
- album
- year
- label
- tracks[] with title at minimum
- youtube object only when an actual playable YouTube candidate is found
- coverSources[] when a stable cover candidate is found
- sources[] for provenance

YouTube:
- Prefer an album playlist (one track per video) when available.
- Otherwise use a full-album video.
- Never fabricate a video ID.
- If a full-album video has reliable timestamps, store track start seconds.
- If timestamps cannot be verified, leave start values absent rather than guessing.
- A missing YouTube match is allowed during ingestion; mark playback status accordingly for later repair.

Covers:
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
