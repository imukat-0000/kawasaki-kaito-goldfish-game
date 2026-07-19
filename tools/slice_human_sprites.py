#!/usr/bin/env python3
"""Split 4x2 human sprite sheets into fixed-canvas animation frames."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SHEET_ROOT = ROOT / "assets" / "human-sprites" / "sheets"
DIRECTION_SHEET_ROOT = SHEET_ROOT / "directions"
FRAME_ROOT = ROOT / "assets" / "human-sprites" / "frames"
CHARACTERS = ("day-girl", "day-boy", "night-girl", "night-boy", "night-woman")
ROWS = (("walk", 0), ("idle", 1))
DIRECTION_CHARACTERS = ("day-girl", "day-boy", "night-girl", "night-boy")
DIRECTION_ROWS = (("walk-left", 0), ("watch-back", 1))
LOOK_IN_SHEETS = tuple(
    (character, f"{character}-look-in.png") for character in CHARACTERS
)
STAND_LOOK_IN_SHEETS = tuple(
    (character, f"{character}-stand-look-in.png") for character in DIRECTION_CHARACTERS
)


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

    for character in DIRECTION_CHARACTERS:
        sheet = padded_sheet(DIRECTION_SHEET_ROOT / f"{character}.png")
        cell_width = sheet.width // 4
        cell_height = sheet.height // 2
        output = FRAME_ROOT / character
        for action, row in DIRECTION_ROWS:
            for column in range(4):
                frame = sheet.crop((
                    column * cell_width,
                    row * cell_height,
                    (column + 1) * cell_width,
                    (row + 1) * cell_height,
                ))
                frame.save(output / f"{action}-{column + 1:02d}.png", optimize=True)

    for character, filename in LOOK_IN_SHEETS:
        sheet = Image.open(SHEET_ROOT / filename).convert("RGBA")
        cell_width = sheet.width // 2
        cell_height = sheet.height // 2
        output = FRAME_ROOT / character
        output.mkdir(parents=True, exist_ok=True)
        for index in range(4):
            column = index % 2
            row = index // 2
            frame = sheet.crop((
                column * cell_width,
                row * cell_height,
                (column + 1) * cell_width,
                (row + 1) * cell_height,
            ))
            frame.save(output / f"look-in-{index + 1:02d}.png", optimize=True)

    for character, filename in STAND_LOOK_IN_SHEETS:
        sheet = Image.open(SHEET_ROOT / filename).convert("RGBA")
        cell_width = sheet.width // 2
        cell_height = sheet.height // 2
        output = FRAME_ROOT / character
        output.mkdir(parents=True, exist_ok=True)
        for index in range(4):
            column = index % 2
            row = index // 2
            frame = sheet.crop((
                column * cell_width,
                row * cell_height,
                (column + 1) * cell_width,
                (row + 1) * cell_height,
            ))
            frame.save(output / f"stand-look-in-{index + 1:02d}.png", optimize=True)


if __name__ == "__main__":
    main()
