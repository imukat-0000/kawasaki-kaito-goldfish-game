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

## ローカル確認

API未設定時は `?demo=値` で表示確認できます。

```text
http://localhost:8000/?demo=120
http://localhost:8000/?demo=320
http://localhost:8000/?demo=520
```

## カウントと演出

- 10アクセスごとに金魚を1匹追加
- 100アクセスごとに盆踊り演出を端末ごとに一度再生
- 100 / 300 / 500アクセスで背景を3段階グレードアップ
- QR経由とSNS経由の内訳をHUDに表示

`FISH_PER_ACCESS`、`CELEBRATION_INTERVAL`、`LEVEL_THRESHOLDS` は `script.js` 冒頭で変更できます。
