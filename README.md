# 河﨑海斗 夏季キャンペーン「金魚育成ゲーム」

GitHub Pagesで公開できる、Vanilla HTML/CSS/JSの静的サイトです。

## 最短セットアップ

1. Googleスプレッドシートを1つ作成します。
2. 「拡張機能」>「Apps Script」を開き、`counter.gs` を貼り付けます。
3. `setupSheet()` を一度実行します。
4. Apps Scriptをウェブアプリとして「全員」に公開します。
5. 発行されたWeb App URLを `script.js` 冒頭の `API_URL` に設定します。

**Apps ScriptのWeb App URLを `script.js` 内の `API_URL` に設定するだけで動きます。**

公開後は次のURLを導線に設定してください。

```text
https://example.github.io/project/?src=qr
https://example.github.io/project/?src=sns
```

同一端末・同一日・同一流入元からの加算は、`localStorage` の `YYYY-MM-DD_src` キーで1回に制限します。`src` が無いアクセスは現在値の取得のみです。

カウンターAPIは10秒でタイムアウトします。最後に取得できた正常値は端末内に保存され、通信障害時は「前回の記録を表示しています」と明示して表示します。複数タブからの同時加算を抑えるため、日次キーはAPIリクエストの直前に確保します。

## ローカル確認

API未設定時は `?demo=値` で表示確認できます。

```text
http://localhost:8000/?demo=100
http://localhost:8000/?demo=1000
http://localhost:8000/?demo=1000000
```

GitHub Pagesなど公開環境でステージ見本を共有する場合は `?sample=節目` を使用します。`sample` は `0 / 100 / 500 / 1000 / 10000 / 100000 / 1000000` のみ有効で、カウンターAPIへの接続やアクセス数の加算は行いません。

```text
https://example.github.io/project/?sample=1000000
```

通信障害の回帰確認には `tests/browser-harness.html` を使用します。`mode` は `success`、`failure`、`failure-cache`、`invalid`、`timeout-cache`、`storage-error` に対応し、`reset=1` で試験用の保存値を初期化します。

```text
http://localhost:8000/tests/browser-harness.html?mode=failure-cache&reset=1
```

## カウントと演出

- 1アクセスごとに金魚を1匹追加
- 朱色・黒の金魚、赤・黒・金のデメキンをランダム表示
- 100 / 500 / 1,000 / 10,000 / 100,000 / 1,000,000匹で盆踊り演出を端末ごとに一度再生
- 上記6つの節目ごとに背景をグレードアップ
- 背景の提灯や植物は風でわずかに揺れ、提灯の明るさも不規則に変化
- 背景画像から静止花火を除去し、元々花火が描かれていた全位置で「打ち上げ・開き始め・満開・消え際」の専用画像を順番に再生
- 花火色は赤・金から始まり、後半ステージで青・紫が加わって華やかに変化
- 1,000匹以降は赤白・白赤黒・金の鯉と金魚をランダム表示
- 大量到達時も軽く動くよう、桶内の代表表示は最大72体
- QR経由とSNS経由の内訳をHUDに表示

節目は `script.js` 冒頭の `MILESTONES` で変更できます。
