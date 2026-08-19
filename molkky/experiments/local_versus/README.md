# Local versus experiment

Local CPU or two-player pass-and-play promoted from the v59 prototype. The v60
runtime keeps v59 gameplay while separating replaceable content from system code.

Release naming: v35 is a frozen historical single-player reference, v59 is the
prototype baseline, and v60 is the current development build.

- Both players use the same `pins` array, so the official shared board carries
  across turns.
- At every handoff, all pins are upright at their current field coordinates;
  leaning pins remain non-scoring but never carry a tilted pose into the next turn.
- Player 2 defaults to the weak CPU defined by the active content pack; setup can
  switch back to a human 2P.
- The deliberately weak first CPU lives in `cpu-easy.js` so its strategy can be
  replaced without touching match state or the fixed game runtime.
- `content/prototype_v59/pack.js` owns every physical image, BGM, SE, voice, and
  dialogue reference used by this prototype.
- `core/content-manager.js` provides strict lookup, template text, pack selection,
  and a complete referenced-file list.
- `content-runtime.js` adapts the selected pack to the existing stage, character,
  and audio managers. Runtime files do not know physical asset paths.
- The stored BGM is read through the persistent content-file buffer loop player.
  No BGM notes or instruments are generated at runtime.
- Player name, score, consecutive misses, active turn, disqualification, and
  winner are owned by `match-runtime.js`.
- `game-runtime.js` is the v59 gameplay baseline with image and dialogue lookup
  moved behind `MolkkyContent`. Official rules and coordinates remain unchanged.
- The fixed v35 `game.js`, `index.html`, and `core/selftest.js` remain unchanged.
- Target selection, forward recovery, final-approach assistance, manga effects,
  locked visuals, voices, sound effects, and BGM are reused from v52.

Background replacement is a one-line `images.stage.background.src` change in the
content pack. `fit`, `anchorX`, and `anchorY` support images with a new composition.

Entrypoint: `experiments/local_versus/index.html?v=60`
