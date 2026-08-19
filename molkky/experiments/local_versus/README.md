# Local versus experiment

Local CPU or two-player pass-and-play built on the v52 manga-overdrive
experiment and the locked v35 game runtime.

- Both players use the same `pins` array, so the official shared board carries
  across turns.
- At every handoff, all pins are upright at their current field coordinates;
  leaning pins remain non-scoring but never carry a tilted pose into the next turn.
- Player 2 defaults to `CPU よわめ`; setup can switch back to a human 2P.
- The deliberately weak first CPU lives in `cpu-easy.js` so its strategy can be
  replaced without touching match state or the fixed game runtime.
- BGM uses the stored `audio/bgm/ievan_v29/ievan_v29.wav` through the persistent
  file-buffer loop player. No BGM notes or instruments are generated at runtime.
- Player name, score, consecutive misses, active turn, disqualification, and
  winner are owned by `match-runtime.js`.
- The fixed v35 `game.js`, `index.html`, and `core/selftest.js` are not changed.
- Target selection, forward recovery, final-approach assistance, manga effects,
  locked visuals, voices, sound effects, and BGM are reused from v52.

Entrypoint: `experiments/local_versus/index.html?v=58`
