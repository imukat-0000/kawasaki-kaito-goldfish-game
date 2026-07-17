#!/usr/bin/env python3
"""Split 4x2 human sprite sheets into fixed-canvas animation frames."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SHEET_ROOT = ROOT / "assets" / "human-sprites" / "sheets"
FRAME_ROOT = ROOT / "assets" / "human-sprites" / "frames"
CHARACTERS = ("day-girl", "day-boy", "night-girl", "night-boy", "night-woman")
ROWS = (("walk", 0), ("idle", 1))


def padded_sheet(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    width = ((image.width + 3) // 4) * 4
    height = ((image.height + 1) // 2) * 2
    if (width == image.width and height == image.height):
        return image
    canvas = Image.new("RGBA", (width, height))
    canvas.alpha_composite(image)
    return canvas


def main() -> None:
    for character in CHARACTERS:
        sheet = padded_sheet(SHEET_ROOT / f"{character}.png")
        cell_width = sheet.width // 4
        cell_height = sheet.height // 2
        output = FRAME_ROOT / character
        output.mkdir(parents=True, exist_ok=True)
        for action, row in ROWS:
            for column in range(4):
                frame = sheet.crop((
                    column * cell_width,
                    row * cell_height,
                    (column + 1) * cell_width,
                    (row + 1) * cell_height,
                ))
                frame.save(output / f"{action}-{column + 1:02d}.png", optimize=True)


if __name__ == "__main__":
    main()
