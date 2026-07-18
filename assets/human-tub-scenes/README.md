# Human and Tub Scene References

Stage-specific 4:3 pixel-art references for positioning people around each tub.
These are deterministic composites, not AI-redrawn backgrounds or runtime
background replacements.

## Included scenes

- Stages 0-2: daytime boy and daytime girl
- Stage 3: nighttime boy and nighttime girl
- Stages 4-6: nighttime boy, nighttime girl, and adult yukata woman
- `contact-sheet.jpg`: visual index of all 17 scene references

Each scene copies the matching zoomed stage image pixel for pixel and adds exactly
one existing transparent character sprite looking toward the tub. Regenerate all
scenes with `python3 tools/create_human_tub_scenes.py`.

## Generation brief

- Preserve the supplied stage background, tub, water, architecture, perspective,
  palette, and framing without generative edits.
- Add one existing transparent character sprite at a natural human scale.
- Pose the character looking into the center of the water without entering or
  standing on the tub.
- Match the existing Japanese retro low-bit pixel-art style with crisp edges.
- Do not add fish, other people, animals, HUD, text, fireworks, or watermarks.
