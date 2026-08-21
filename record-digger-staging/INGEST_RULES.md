# Record Digger catalog ingest rules

This branch is a staging area only. Do not merge into the old random_note app.

## HARD-GATED WORKFLOW

### Stage 1 — Candidate hunt
Build about 1,000 unique album candidates first. Until candidateCount reaches about 1,000, do not start Stage 2 for any subset.

Stage 1 fields only:
- artist
- album
- normalizedKey
- sourceEvidence when available
- priceEvidence when available
- priceHeuristic

The roughly JPY 1,000 used-LP target is a soft heuristic only. Do not claim a current price without direct evidence. Do not research track lists, years, labels, covers, YouTube, timestamps, or production IDs during this stage unless encountered incidentally.

### Stage 2 — Metadata pass
Only after Stage 1 is complete, verify artist, album, track list, year, and label for the full candidate set.

### Stage 3 — YouTube pass
Only after Stage 2 is attempted across the full set, search for real usable YouTube playlists or full-album videos. Never invent IDs or timestamps.

### Stage 4 — Production JSON
Only after Stage 3 is attempted across the full set, write production album JSON for candidates with sufficient verified metadata and usable YouTube sources. Assign permanent rec_XXXXXXXX IDs here.

## Selection
Favor mainly 1950s–1960s jazz, lesser-known leaders, sidemen, secondary sessions, and catalogs around Prestige, Savoy, Contemporary, Vanguard, Riverside, Bethlehem, Pacific Jazz, Argo, EmArcy, Roost, Jubilee, Mode and related labels. Avoid turning the list into only famous canonical titles.

## Duplicate rule
Normalize artist + album and do not add duplicate albums because of different pressings or reissues.
