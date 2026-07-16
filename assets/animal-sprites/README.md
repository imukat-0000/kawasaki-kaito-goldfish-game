# Animal sprite assets

Game Boy-style four-tone animal sprites. Final PNG files have transparent backgrounds. Chroma-key source images are kept in `source/`.

## Sprite sheets

- `cat-sprite-sheet.png`: 4 columns x 5 rows. Walk left, walk right, walk front, walk away, sit with back toward the viewer.
- `bird-sprite-sheet.png`: 4 columns x 5 rows. Fly left, fly right, fly front, fly away, perch and watch the fish.
- `tadpole-sprite-sheet.png`: 4 columns x 4 rows. Swim left, swim right, swim front, swim away.
- `frog-sprite-sheet.png`: 4 columns x 5 rows. Hop left, hop right, hop front, hop away, escape jump.
- `tadpole-to-frog.png`: 8-frame horizontal metamorphosis sequence.

Each row plays from left to right. Individual transparent frames are in `frames/<character>/` and use `01` through `04` or `08` playback order.

Run `python3 tools/slice_animal_sprites.py` after replacing a sprite sheet to regenerate the individual frames.
