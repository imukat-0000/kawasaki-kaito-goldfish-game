# 金魚育成ゲーム 引き継ぎメモ

最終更新: 2026-07-16

## プロジェクト情報

- プロジェクト: 河﨑海斗 夏季キャンペーン「金魚育成ゲーム」
- ローカル: `/Users/kanekotakumi/Desktop/kawasaki-kaito-goldfish-game`
- GitHub: `https://github.com/imukat-0000/kawasaki-kaito-goldfish-game`
- 公開サイト: `https://imukat-0000.github.io/kawasaki-kaito-goldfish-game/`
- ブランチ: `main`
- 今回作業開始時のコミット: `7fef79e Animate stage artwork fireworks`

## カウンターAPI

- Google Apps Script Web App:
  `https://script.google.com/macros/s/AKfycbwJKRyeAw9jiC-jmvJ2fIgRdmdHpu1CVCu61cEC9OojBjMtszdU4fdj99eBIPz0ogwh/exec`
- URLは `script.js` 冒頭の `API_URL` に設定済み。
- Apps Script側のコードは `counter.gs`。
- スプレッドシートで `qr_count` と `sns_count` を管理する。
- `?src=qr` または `?src=sns` のアクセス時だけ対応する値を1増やす。
- `src` がないアクセスでは加算せず、現在値だけを返す。
- JSON形式は `{ qr: number, sns: number, total: number }`。

## 重複カウント防止

- 同一端末・同一日・同一流入元につき1回だけ加算する。
- `localStorage` のキーは `YYYY-MM-DD_src`。
- QRとSNSは別の流入元として、それぞれ1日1回カウントできる。
- 日付判定は日本時間を使用する。
- 日次キーはAPIリクエスト前に保存し、同一端末の複数タブによる同時加算を抑止する。
- APIは10秒でタイムアウトし、通信失敗時は端末内の最終正常値を明示付きで表示する。

## 魚の表示仕様

- 1アクセスにつき合計魚数が1匹増える。
- 画面負荷を抑えるため、桶内の代表表示は最大72体。
- 合計値と進捗表示は実数を維持する。
- 魚の種類と配置は合計値を種にした決定的な乱数を使い、再読み込み時にちらつかない。

金魚は次の5種類からランダム表示する。

- 朱色の金魚: `assets/goldfish_sprite.png`
- 黒い金魚: `assets/goldfish_black.png`
- 赤いデメキン: `assets/demekin_red.png`
- 黒いデメキン: `assets/demekin_black.png`
- 金色のデメキン: `assets/demekin_gold.png`

1,000匹以降は、金魚に加えて次の鯉もランダム表示する。

- 赤白の鯉: `assets/koi_sprite.png`
- 白・赤・黒の鯉: `assets/koi_sanke.png`
- 金色の鯉: `assets/koi_gold.png`

## 節目と演出

節目は次の6段階。

1. 100匹
2. 500匹
3. 1,000匹
4. 10,000匹
5. 100,000匹
6. 1,000,000匹

- 節目到達時に `assets/bonodori_effect.png` の盆踊り演出を約5秒再生する。
- 演出は `localStorage` の `celebration_shown_節目` で端末ごとに一度だけ表示する。
- 背景は `tub_base.png` から `assets/backgrounds-no-static-fireworks/tub_levelup1.png` ～ `tub_levelup6.png` へ切り替える。
- 元の `assets/tub_levelup1.png` ～ `tub_levelup6.png` は編集前素材として残す。
- 次の節目までの進捗バーを表示する。
- 画面内にQR経由とSNS経由の内訳を表示する。

## 背景アニメーション

- 背景全体を動かしてはいけない。
- 各ステージの物体位置に合わせ、左の枝葉、右の枝葉、代表的な提灯4個だけを切り抜いて動かす。
- 枝葉・提灯の移動量は最大1px程度。
- 提灯の明滅は楕円で切り抜いた提灯本体の内部だけに適用する。
- 桶、屋台、建物、HUDは動かさない。
- 花火ありステージは静止花火を除去した背景画像を使用し、元々描かれていた全位置へ専用の透過画像素材を重ねて一連の打ち上げを表現する。
- 花火は `打ち上げ → 開き始め → 満開 → 消え際` の4フレームを順番に再生する。
- 素材は `assets/fireworks/firework-launch.png`、`firework-opening.png`、`firework-full.png`、`firework-fade.png`。
- 花火数はステージ0～6で `0 / 3 / 5 / 14 / 16 / 9 / 8`。小さな花火を含め、位置と個数は元画像に合わせる。
- 花火色は赤・金・青・紫。低ステージは赤と金、ステージ3で青、ステージ4以降で紫を追加する。
- 後半ほど周期を短くし、各花火の開始位相と周期には小さな乱数差を付ける。
- `prefers-reduced-motion: reduce` では背景、魚、花火のアニメーションを停止する。
- ステージ別の切り抜き座標は `style.css` の `.game-screen[data-stage="1"]` ～ `[data-stage="6"]` にある。

## ファイル構成

- `index.html`: ゲーム画面とHUD
- `style.css`: ピクセルUI、魚、節目演出、背景・花火アニメーション
- `script.js`: API通信、重複防止、魚配置、背景花火制御、ステージ・進捗処理
- `counter.gs`: Google Apps ScriptのカウンターAPI
- `README.md`: セットアップと基本仕様
- `PROJECT_HANDOFF.md`: この引き継ぎメモ
- `assets/`: 元背景、静止花火なし背景、魚、鯉、盆踊り画像、花火4フレーム素材

## ローカル確認

プロジェクトフォルダで静的サーバーを起動する。

```sh
python3 -m http.server 8000
```

デモ値は `?demo=` で指定できる。

```text
http://localhost:8000/?demo=0
http://localhost:8000/?demo=100
http://localhost:8000/?demo=1000
http://localhost:8000/?demo=1000000
```

公開環境では共有専用の `?sample=` を使用できる。節目の値だけを受け付け、API通信・加算・節目到達演出は行わない。

```text
https://imukat-0000.github.io/kawasaki-kaito-goldfish-game/?sample=1000000
```

確認後はローカルサーバーとブラウザの確認タブを終了し、不要な処理を残さない。

## 公開手順

```sh
git add <変更ファイル>
git commit -m "変更内容"
git push origin main
```

GitHub Pagesは `main` へのpush後に自動更新される。公開前に `node --check script.js` と `git diff --check` を実行する。

## 今後の作業開始時

新しいCodexタスクでは、最初に次のように伝える。

```text
/Users/kanekotakumi/Desktop/kawasaki-kaito-goldfish-game の
PROJECT_HANDOFF.md を読んで、金魚育成ゲームの続きを作業してください。
```
