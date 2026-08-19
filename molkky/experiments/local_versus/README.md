# Local versus experiment

Two-player pass-and-play built on the v52 manga-overdrive experiment and the
locked v35 game runtime.

- Both players use the same `pins` array, so the official shared board carries
  across turns.
- Player name, score, consecutive misses, active turn, disqualification, and
  winner are owned by `match-runtime.js`.
- The fixed v35 `game.js`, `index.html`, and `core/selftest.js` are not changed.
- Target selection, forward recovery, final-approach assistance, manga effects,
  locked visuals, voices, sound effects, and BGM are reused from v52.

Entrypoint: `experiments/local_versus/index.html?v=55`
