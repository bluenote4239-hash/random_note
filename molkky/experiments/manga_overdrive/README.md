# Manga overdrive experiment

Active prototype entrypoint built on the fixed v35 runtime.

- `index.html`: the only active experiment page.
- `shell.css`: experiment UI-layer styling.
- `prototype-runtime.js`: target selection, number guidance, forward recovery, and the score-40 final-approach assist.

At 40–49 points the prototype announces the remaining score. Selecting the matching single-number finish target reduces accuracy deviation by 68%; power, collision, scoring, over-50 rollback, and all non-matching throws remain on the fixed v35 behavior.

Locked images, voices, BGM, rules, and production runtimes stay in their existing root packages. Do not copy assets into this directory.
Visual effects are loaded from `effects/manga_overdrive/`; synthesized impact sounds are loaded from `audio/se/manga_overdrive/`.
