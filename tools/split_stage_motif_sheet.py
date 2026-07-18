#!/usr/bin/env python3
"""Split a transparent 2x2 stage motif sheet into trimmed layer assets."""

import argparse
from pathlib import Path

from PIL import Image


NAMES = ("stall-left", "stall-right", "foreground-left", "foreground-right")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("sheet", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    sheet = Image.open(args.sheet).convert("RGBA")
    width, height = sheet.size
    cells = (
        (0, 0, width // 2, height // 2),
        (width // 2, 0, width, height // 2),
        (0, height // 2, width // 2, height),
        (width // 2, height // 2, width, height),
    )
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name, bounds in zip(NAMES, cells):
        motif = sheet.crop(bounds)
        alpha_bounds = motif.getchannel("A").getbbox()
        if alpha_bounds is None:
            raise ValueError(f"No visible pixels found for {name}")
        motif.crop(alpha_bounds).save(args.output_dir / f"{name}.png", optimize=True)


if __name__ == "__main__":
    main()
