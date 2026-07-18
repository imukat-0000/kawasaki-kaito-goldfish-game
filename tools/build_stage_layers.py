#!/usr/bin/env python3
"""Position generated stage motifs into independent full-canvas game layers."""

from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "assets" / "stage-layers"
CANVAS_SIZE = (1448, 1086)

# Widths and anchors are tuned against the original 4:3 stage compositions.
STAGE_LAYOUTS = (
    {"tub_width": 728, "tub_bottom": 875, "stall_width": 390, "stall_top": 235, "front_width": 310, "front_bottom": 1086},
    {"tub_width": 720, "tub_bottom": 890, "stall_width": 380, "stall_top": 245, "front_width": 310, "front_bottom": 1086},
    {"tub_width": 670, "tub_bottom": 930, "stall_width": 400, "stall_top": 270, "front_width": 320, "front_bottom": 1015},
    {"tub_width": 658, "tub_bottom": 930, "stall_width": 400, "stall_top": 245, "front_width": 330, "front_bottom": 1086},
    {"tub_width": 670, "tub_bottom": 950, "stall_width": 420, "stall_top": 190, "front_width": 360, "front_bottom": 1086},
    {"tub_width": 660, "tub_bottom": 970, "stall_width": 390, "stall_top": 285, "front_width": 300, "front_bottom": 1086},
    {"tub_width": 648, "tub_bottom": 985, "stall_width": 390, "stall_top": 285, "front_width": 310, "front_bottom": 1086},
)


def resize_to_width(image: Image.Image, width: int) -> Image.Image:
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.NEAREST)


def trimmed(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    bounds = image.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError(f"Transparent asset has no visible pixels: {path}")
    return image.crop(bounds)


def paste_pair(canvas: Image.Image, root: Path, stem: str, width: int, top: int | None = None, bottom: int | None = None) -> None:
    for side in ("left", "right"):
        motif = resize_to_width(trimmed(root / f"{stem}-{side}.png"), width)
        x = 0 if side == "left" else CANVAS_SIZE[0] - motif.width
        y = top if top is not None else bottom - motif.height
        canvas.alpha_composite(motif, (x, y))


def build_stage(stage: int) -> None:
    root = ASSET_ROOT / f"stage-{stage}"
    layout = STAGE_LAYOUTS[stage]
    background = Image.open(root / "background.png").convert("RGBA")
    if background.size != CANVAS_SIZE:
        background = background.resize(CANVAS_SIZE, Image.Resampling.NEAREST)

    midground = Image.new("RGBA", CANVAS_SIZE)
    paste_pair(midground, root, "stall", layout["stall_width"], top=layout["stall_top"])

    tub_source = trimmed(root / "tub.png")
    tub = resize_to_width(tub_source, layout["tub_width"])
    tub_layer = Image.new("RGBA", CANVAS_SIZE)
    tub_x = round((CANVAS_SIZE[0] - tub.width) / 2)
    tub_y = layout["tub_bottom"] - tub.height
    tub_layer.alpha_composite(tub, (tub_x, tub_y))

    foreground = Image.new("RGBA", CANVAS_SIZE)
    paste_pair(foreground, root, "foreground", layout["front_width"], bottom=layout["front_bottom"])

    runtime = root / "runtime"
    runtime.mkdir(exist_ok=True)
    midground.save(runtime / "midground.png", optimize=True)
    tub_layer.save(runtime / "tub.png", optimize=True)
    foreground.save(runtime / "foreground.png", optimize=True)

    preview = background.copy()
    preview.alpha_composite(midground)
    preview.alpha_composite(tub_layer)
    preview.alpha_composite(foreground)
    preview.convert("RGB").save(runtime / "preview.jpg", quality=90, optimize=True)


def build_contact_sheet() -> None:
    thumb_size = (640, 480)
    gap = 18
    columns = 2
    rows = 4
    sheet = Image.new(
        "RGB",
        (thumb_size[0] * columns + gap * (columns + 1), thumb_size[1] * rows + gap * (rows + 1)),
        (15, 35, 24),
    )
    for stage in range(7):
        preview = Image.open(ASSET_ROOT / f"stage-{stage}" / "runtime" / "preview.jpg").convert("RGB")
        preview = preview.resize(thumb_size, Image.Resampling.NEAREST)
        column = stage % columns
        row = stage // columns
        x = gap + column * (thumb_size[0] + gap)
        y = gap + row * (thumb_size[1] + gap)
        sheet.paste(preview, (x, y))
    sheet.save(ASSET_ROOT / "contact-sheet.jpg", quality=91, optimize=True)


def main() -> None:
    for stage in range(7):
        build_stage(stage)
    build_contact_sheet()
    print("Built runtime layers for 7 stages")


if __name__ == "__main__":
    main()
