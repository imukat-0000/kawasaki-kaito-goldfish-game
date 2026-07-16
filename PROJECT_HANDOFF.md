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

## 成長ゲーム仕様

- 1アクセスにつき現在育成中の生物が1段階成長する。表示数を直接1匹増やす仕様ではない。
- QRまたはSNS経由のAPI加算が成功した直後に「Thank you !」を約2秒表示する。取得のみ、重複アクセス、サンプル表示、通信失敗時には表示しない。
- 成長サイクルは10カウント。通常は金魚が拡大し、10回目で鯉へ進化する。鯉は進化直前の金魚の約2倍の幅で桶に残り、代表表示は直近24体まで。
- サイクル1は必ずおたまじゃくし。その後はサイクル4以降を決定的な乱数で判定し、約16%をカエル系にする。
- おたまじゃくしは `color-v2/frames/metamorphosis/` の8段階を使って成長し、10回目でカエルになる。
- カエルは `color-v2/frames/frog-swim/` で泳ぎ、成熟から12カウント後のカウント増加時に水面の端へ泳いで逃げる。
- 成長済みの鯉の種類・向き・位置はサイクル番号を種に固定し、新しい成長でも既存個体を変更しない。
- 進捗バーは背景ステージではなく、現在の10カウント成長を表示する。

金魚は次の5種類からランダム表示する。

- 朱色の金魚: `assets/goldfish_sprite.png`
- 黒い金魚: `assets/goldfish_black.png`
- 赤いデメキン: `assets/demekin_red.png`
- 黒いデメキン: `assets/demekin_black.png`
- 金色のデメキン: `assets/demekin_gold.png`

進化後の鯉は次の3種類から固定的に選ぶ。

- 赤白の鯉: `assets/koi_sprite.png`
- 白・赤・黒の鯉: `assets/koi_sanke.png`
- 金色の鯉: `assets/koi_gold.png`

## レア来訪者

- 猫はカウント時に1.2%、スズメは1.6%の確率で出現する。どちらか一方だけの場合も、別々のタイミングで両方いる場合もある。
- 猫は画面外から歩いて桶の手前へ来て後ろ向きに座る。進捗バーより背面の床に配置し、`frames/cat-watch/` の胴体位置を揃えた4フレームで尻尾だけを常時動かす。
- スズメは画面外から飛来し、各ステージの桶サイズに合わせて足先が右側の木枠へ重なる座標に留まる。初期拡大版から30%縮小し、`frames/bird-watch/` の足位置を揃えた4フレームで頭だけを常時動かす。
- おたまじゃくし、カエル、猫、スズメは初期実装のおよそ2倍の見た目へ拡大済み。歩行・飛行から待機へ切り替わる際は素材内の余白差をCSSで補正する。
- 猫は5～9カウント、スズメは4～8カウント滞在する。時間経過だけでは退場せず、退場値以降のカウント増加時に画面外へ移動する。
- 来訪状態は端末内に保存する。本番とテストページは別の保存キーを使用する。

## 節目と演出

節目は次の6段階。

1. 100匹
2. 500匹
3. 1,000匹
4. 10,000匹
5. 100,000匹
6. 1,000,000匹

- 節目到達時に二段櫓を中央へ表示し、上段のカエルが太鼓を叩き、周囲の浴衣姿の金魚・鯉・カエル6体が踊る演出を約5秒再生する。
- 櫓・太鼓カエル・踊り手は `assets/bonodori-v2-samples/` の個別透過PNGを使用し、それぞれ別のCSSアニメーションを適用する。
- 演出は `localStorage` の `celebration_shown_節目` で端末ごとに一度だけ表示する。
- 背景は `tub_base.png` から `assets/backgrounds-no-static-fireworks/tub_levelup1.png` ～ `tub_levelup6.png` へ切り替える。
- 元の `assets/tub_levelup1.png` ～ `tub_levelup6.png` は編集前素材として残す。
- 500匹以降は `assets/backgrounds-low-water/tub_levelup2.png` ～ `tub_levelup6.png` を使用する。初期桶と同程度まで水位を下げ、魚の表示範囲も各ステージの水面に合わせる。
- 次の進化までの10段階進捗バーを表示する。
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
- `counter-test.html`: 本番APIへ接続しない操作用テストページ
- `style.css`: ピクセルUI、成長生物、来訪者、節目演出、背景・花火アニメーション
- `script.js`: API通信、重複防止、10段階成長、鯉・カエル、レア来訪者、背景花火、ステージ処理
- `tests/counter-test.css`: 操作用テストパネルのスタイル
- `tests/counter-test.js`: ローカルのテスト値、加算、ステージ移動、保存処理
- `counter.gs`: Google Apps ScriptのカウンターAPI
- `README.md`: セットアップと基本仕様
- `PROJECT_HANDOFF.md`: この引き継ぎメモ
- `assets/`: 元背景、静止花火なし背景、魚、鯉、盆踊り画像、花火4フレーム素材
- `assets/bonodori-v2-samples/`: 現行エフェクトで使用する二段櫓、太鼓カエル、浴衣姿の金魚・鯉・カエルと、全体配置サンプル。
- `assets/animal-sprites/`: ゲームボーイ風の猫、鳥、おたまじゃくし、カエル、成長変化の透過スプライトシートと個別フレーム。実装時は三毛猫・スズメ・自然色のおたまじゃくしとカエルを収録した `color-v2/` を優先する。
- `tools/slice_animal_sprites.py`: 動物スプライトシートから方向・動作別の個別PNGを再生成する。

## ローカル確認

プロジェクトフォルダで静的サーバーを起動する。

```sh
python3 -m http.server 8000
```

本番カウントを変更せずに操作確認する場合は、次の専用ページを開く。QR/SNSの加算、任意値入力、次の節目、全ステージへの移動、リセットができ、テスト値はブラウザ内だけに保存される。

```text
http://localhost:8000/counter-test.html
```

デモ値は `?demo=` で指定できる。

```text
http://localhost:8000/?demo=0
http://localhost:8000/?demo=100
http://localhost:8000/?demo=1000
http://localhost:8000/?demo=1000000
```

公開環境では共有専用の `?sample=` を使用できる。節目の値だけを受け付け、API通信・加算は行わない。通常は節目到達演出を再生せず、`effect=1` を追加した場合だけ保存状態に関係なく毎回再生する。

```text
https://imukat-0000.github.io/kawasaki-kaito-goldfish-game/?sample=1000000
https://imukat-0000.github.io/kawasaki-kaito-goldfish-game/?sample=1000000&effect=1
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
