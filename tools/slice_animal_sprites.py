from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "animal-sprites"

SHEETS = {
    "cat": {
        "file": "cat-sprite-sheet.png",
        "rows": ["walk-left", "walk-right", "walk-front", "walk-away", "sit-back"],
        "columns": 4,
    },
    "bird": {
        "file": "bird-sprite-sheet.png",
        "rows": ["fly-left", "fly-right", "fly-front", "fly-away", "perch"],
        "columns": 4,
    },
    "tadpole": {
        "file": "tadpole-sprite-sheet.png",
        "rows": ["swim-left", "swim-right", "swim-front", "swim-away"],
        "columns": 4,
    },
    "frog": {
        "file": "frog-sprite-sheet.png",
        "rows": ["hop-left", "hop-right", "hop-front", "hop-away", "escape-away"],
        "columns": 4,
    },
}


def split_grid(name, config):
    source = Image.open(ASSET_DIR / config["file"]).convert("RGBA")
    rows = config["rows"]
    columns = config["columns"]
    cell_width = (source.width + columns - 1) // columns
    cell_height = (source.height + len(rows) - 1) // len(rows)
    output_dir = ASSET_DIR / "frames" / name
    output_dir.mkdir(parents=True, exist_ok=True)

    for row_index, action in enumerate(rows):
        for column_index in range(columns):
            left = round(column_index * source.width / columns)
            right = round((column_index + 1) * source.width / columns)
            top = round(row_index * source.height / len(rows))
            bottom = round((row_index + 1) * source.height / len(rows))
            frame = source.crop((left, top, right, bottom))
            canvas = Image.new("RGBA", (cell_width, cell_height))
            canvas.paste(frame, ((cell_width - frame.width) // 2, (cell_height - frame.height) // 2))
            canvas.save(output_dir / f"{action}-{column_index + 1:02d}.png")


def split_metamorphosis():
    source = Image.open(ASSET_DIR / "tadpole-to-frog.png").convert("RGBA")
    columns = 8
    cell_width = (source.width + columns - 1) // columns
    output_dir = ASSET_DIR / "frames" / "metamorphosis"
    output_dir.mkdir(parents=True, exist_ok=True)

    for index in range(columns):
        left = round(index * source.width / columns)
        right = round((index + 1) * source.width / columns)
        frame = source.crop((left, 0, right, source.height))
        canvas = Image.new("RGBA", (cell_width, source.height))
        canvas.paste(frame, ((cell_width - frame.width) // 2, 0))
        canvas.save(output_dir / f"frame-{index + 1:02d}.png")


for sheet_name, sheet_config in SHEETS.items():
    split_grid(sheet_name, sheet_config)

split_metamorphosis()
