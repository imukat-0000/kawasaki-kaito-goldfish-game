#!/usr/bin/env python3
"""Create zoomed-out stage art while preserving the original center pixels."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = ROOT / "assets" / "backgrounds-zoomed"
ZOOM_SCALE = 0.8
FEATHER_RADIUS = 16
SOURCES = (
    ROOT / "assets" / "tub_base.png",
    ROOT / "assets" / "backgrounds-no-static-fireworks" / "tub_levelup1.png",
    ROOT / "assets" / "backgrounds-low-water" / "tub_levelup2.png",
    ROOT / "assets" / "backgrounds-low-water" / "tub_levelup3.png",
    ROOT / "assets" / "backgrounds-low-water" / "tub_levelup4.png",
    ROOT / "assets" / "backgrounds-low-water" / "tub_levelup5.png",
    ROOT / "assets" / "backgrounds-low-water" / "tub_levelup6.png",
)
UNDERLAYS = tuple(
    OUTPUT_ROOT / "source" / f"stage-{index}-plaza.png"
    for index in range(len(SOURCES))
)
TUB_MASK_BOUNDS = (
    (0.225, 0.235, 0.775, 0.855),
    (0.225, 0.250, 0.775, 0.860),
    (0.230, 0.315, 0.770, 0.900),
    (0.225, 0.325, 0.775, 0.920),
    (0.225, 0.350, 0.775, 0.930),
    (0.225, 0.365, 0.775, 0.945),
    (0.220, 0.375, 0.780, 0.960),
)


def zoom_out(source: Path, underlay_path: Path, stage: int) -> Image.Image:
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
    draw = ImageDraw.Draw(mask)
    left, top, right, bottom = TUB_MASK_BOUNDS[stage]
    draw.ellipse(
        (
            round(image.width * left),
            round(image.height * top),
            round(image.width * right),
            round(image.height * bottom),
        ),
        fill=255,
    )
    mask = mask.filter(ImageFilter.GaussianBlur(FEATHER_RADIUS))
    return Image.composite(layer, underlay, mask)


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    for index, (source, underlay) in enumerate(zip(SOURCES, UNDERLAYS)):
        name = "tub_base.png" if index == 0 else f"tub_levelup{index}.png"
        background = zoom_out(source, underlay, index)
        background.save(OUTPUT_ROOT / name, optimize=True)
        background.save(
            (OUTPUT_ROOT / name).with_suffix(".webp"),
            format="WEBP",
            lossless=True,
            method=6,
        )


if __name__ == "__main__":
    main()
