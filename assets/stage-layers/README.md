# Stage layer assets

人物登場時のズームアウト画面は、ステージごとに次の6素材を組み立てて表示する。

- `background.png`: 桶、屋台、手前装飾を含まない広場背景
- `tub.png`: 透過済みの桶
- `stall-left.png`, `stall-right.png`: 左右の中景屋台
- `foreground-left.png`, `foreground-right.png`: 画面下部の手前装飾

`source/` はクロマキー除去前後の生成元、`runtime/` はゲーム用に1448x1086へ配置した合成レイヤーである。背景へ桶や画面下部の装飾を焼き込まず、ゲーム内では背景、中景、桶、生物、桶前面、人物、手前装飾の順に重ねる。

配置を変更した場合は次を実行する。

```sh
python3 tools/build_stage_layers.py
```

この処理で全7ステージの `runtime/midground.png`、`runtime/tub.png`、`runtime/foreground.png`、`runtime/preview.jpg` と、全体確認用の `contact-sheet.jpg` を再生成する。
