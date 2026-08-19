# SEASIDE 90s ARENA

The only active and approved background is:

`images/approved/kof90s_marina/background.webp`

Its lock and checksum are stored in
`images/approved/kof90s_marina/ASSET_LOCK.json` and `../../ACTIVE_RELEASE.json`.

Retired stage art is stored in Git history, not in this runtime directory. The game
must not load an SVG fallback or recreate a `legacy/` directory.

Stage art is presentation-only. Game rules, scoring, collision, formation, and pin
recovery do not depend on it.
