#!/usr/bin/env python3
"""Compose people over the exact zoomed stage pixels without redrawing them."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BACKGROUND_ROOT = ROOT / "assets" / "backgrounds-zoomed"
FRAME_ROOT = ROOT / "assets" / "human-sprites" / "frames"
OUTPUT_ROOT = ROOT / "assets" / "human-tub-scenes"

STAGE_BOTTOMS = (780, 785, 825, 835, 855, 875, 890)
STAGE_X = (
    (315, 1133, 360),
    (315, 1133, 360),
    (285, 1163, 340),
    (315, 1133, 370),
    (300, 1148, 365),
    (280, 1168, 350),
    (300, 1148, 365),
)
def background_path(stage: int) -> Path:
    name = "tub_base.png" if stage == 0 else f"tub_levelup{stage}.png"
    return BACKGROUND_ROOT / name


def prepare_person(frame_path: Path, target_height: int, flip: bool = False) -> Image.Image:
    frame = Image.open(frame_path).convert("RGBA")
    alpha_bounds = frame.getchannel("A").getbbox()
    if alpha_bounds is None:
        raise ValueError(f"Empty character frame: {frame_path}")
    person = frame.crop(alpha_bounds)
    width = round(person.width * target_height / person.height)
    person = person.resize((width, target_height), Image.Resampling.NEAREST)
    if flip:
        person = person.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return person


def compose(stage: int, role: str, character: str) -> Path:
    background = Image.open(background_path(stage)).convert("RGBA")
    scene = background.copy()
    if role == "woman":
        frame_name = "idle-01.png"
        target_height = 340
        flip = False
        x = STAGE_X[stage][2]
        bottom = STAGE_BOTTOMS[stage] - 45
    else:
        frame_name = "watch-back-01.png"
        target_height = 320 if role == "boy" else 300
        flip = False
        x = STAGE_X[stage][0 if role == "boy" else 1]
        bottom = STAGE_BOTTOMS[stage]
    person = prepare_person(FRAME_ROOT / character / frame_name, target_height, flip)
    position = (round(x - person.width / 2), bottom - person.height)
    scene.alpha_composite(person, position)

    time_of_day = "day" if stage < 3 else "night"
    output = OUTPUT_ROOT / f"stage-{stage}-{time_of_day}-{role}.png"
    scene.convert("RGB").save(output, optimize=True)
    return output


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    outputs = []
    for stage in range(7):
        is_night = stage >= 3
        outputs.append(compose(stage, "boy", "night-boy" if is_night else "day-boy"))
        outputs.append(compose(stage, "girl", "night-girl" if is_night else "day-girl"))
        if stage >= 4:
            outputs.append(compose(stage, "woman", "night-woman"))
    print(f"Created {len(outputs)} exact-background scene references")


if __name__ == "__main__":
    main()
