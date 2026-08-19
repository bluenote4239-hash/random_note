# Local versus experiment

Local CPU or two-player pass-and-play promoted from the v59 prototype. The v61
runtime keeps the v60 content separation and adds three learnable throw styles.

Release naming: v35 is a frozen historical single-player reference, v59 is the
prototype baseline, v60 is the content-structure build, and v61 is current.

- The closest aimed skittle is enlarged and highlighted; the first throw tap
  locks that visual target until the throw resolves. Collision coordinates do
  not change when the target is enlarged.
- The throwing Mölkky has its own replaceable object asset and is visible both
  at the throw line and rotating through the complete flight.
- `throw-styles.js` owns SOFT, STANDARD, and SMASH presentation/force profiles.
  Styles affect scatter, chain reach, and travel only. Official scoring and the
  shared 12-skittle board rules are unchanged.

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

Entrypoint: `experiments/local_versus/index.html?v=61`
