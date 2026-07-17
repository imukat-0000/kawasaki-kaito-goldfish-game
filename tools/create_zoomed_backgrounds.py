#!/usr/bin/env python3
"""Create zoomed-out stage art while preserving the original center pixels."""

from pathlib import Path

from PIL import Image, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = ROOT / "assets" / "backgrounds-zoomed"
ZOOM_SCALE = 0.8
FEATHER_RADIUS = 42
SOURCES = (
    ROOT / "assets" / "tub_base.png",
    ROOT / "assets" / "backgrounds-no-static-fireworks" / "tub_levelup1.png",
    ROOT / "assets" / "backgrounds-low-water" / "tub_levelup2.png",
    ROOT / "assets" / "backgrounds-low-water" / "tub_levelup3.png",
    ROOT / "assets" / "backgrounds-low-water" / "tub_levelup4.png",
    ROOT / "assets" / "backgrounds-low-water" / "tub_levelup5.png",
    ROOT / "assets" / "backgrounds-low-water" / "tub_levelup6.png",
)


def zoom_out(source: Path, underlay_path: Path) -> Image.Image:
    image = Image.open(source).convert("RGB")
    underlay = ImageOps.fit(
        Image.open(underlay_path).convert("RGB"),
        image.size,
        method=Image.Resampling.LANCZOS,
    )
    center_size = (
        round(image.width * ZOOM_SCALE),
        round(image.height * ZOOM_SCALE),
    )
    center = image.resize(center_size, Image.Resampling.NEAREST)
    x = (image.width - center.width) // 2
    y = (image.height - center.height) // 2

    layer = underlay.copy()
    layer.paste(center, (x, y))
    mask = Image.new("L", image.size)
    mask.paste(255, (x, y, x + center.width, y + center.height))
    mask = mask.filter(ImageFilter.GaussianBlur(FEATHER_RADIUS))
    return Image.composite(layer, underlay, mask)


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    for index, source in enumerate(SOURCES):
        name = "tub_base.png" if index == 0 else f"tub_levelup{index}.png"
        underlay = OUTPUT_ROOT / "source" / ("plaza-day.png" if index <= 2 else "plaza-night.png")
        background = zoom_out(source, underlay)
        background.save(OUTPUT_ROOT / name, optimize=True)
        background.save(
            (OUTPUT_ROOT / name).with_suffix(".webp"),
            format="WEBP",
            lossless=True,
            method=6,
        )


if __name__ == "__main__":
    main()
