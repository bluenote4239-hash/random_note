# Active Mölkky tree

This directory contains only the active runtime and approved assets.

- Fixed production build: `index.html?v=35`
- Active FX prototype: `experiments/manga_overdrive/index.html?v=52`
- Machine-readable source of truth: `ACTIVE_RELEASE.json`

```text
molkky/
├── core/                         shared production runtimes
├── effects/manga_overdrive/     replaceable visual effects
├── experiments/manga_overdrive/ prototype page and prototype-only behavior
├── audio/se/manga_overdrive/    experimental synthesized impact audio
├── audio/ characters/ objects/ stages/  content packages
├── index.html                    fixed v35 entrypoint
├── game.js                       fixed v35 game rules
└── ACTIVE_RELEASE.json           active-path contract
```

The v35 production files, official rules, collision/scoring/recovery logic, approved
character art, stage art, skittles, Mölkkaari, BGM, voices, and sound effects are
locked. Do not replace or revive older variants without explicit user instruction.

Retired prototypes and assets are kept in Git history only. Do not create `legacy/`,
`old/`, `backup/`, or version-copy runtime folders under `molkky/`. Cache query
numbers in active HTML files are not alternate copies.

The retired root paths `fx36.html`, `fx36.css`, and `core/impact-effects.js` must
not be restored. Prototype-only code belongs under `experiments/`; reusable visual
presentation code belongs under `effects/`; all sound generation and audio assets
belong under `audio/`.
