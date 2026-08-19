# Prototype v59 content pack

`pack.js` is the replaceable content catalog for the local-versus prototype.
The game runtimes must request assets and copy through `MolkkyContent`; they must
not know physical image, audio, or dialogue file names.

## Replacing the background

1. Put the new image below a stage package directory.
2. Change only `images.stage.background.src` in `pack.js`.
3. Keep `fit: 'stretch'` for the v59 composition or use `fit: 'cover'` and adjust
   `anchorX` / `anchorY` from `0` to `1`.
4. Run the self-check before publishing.

New SE and voices are added to their arrays. Removing an item requires no runtime
edit as long as each required category keeps at least one valid file.

The throwing baton is independently replaceable through
`images.throwingMolkky`. Its object package contains the editable SVG source;
changing the visual never changes throw force or scoring.
