# Claude Code 引き継ぎプロンプト

以下を Claude Code にそのまま渡してください。

```md
# 河崎海斗 金魚育成ゲーム: システム整備の引き継ぎ

あなたは既存ゲームの「ゲーム内容以外」を整備する担当です。
作業ディレクトリは次です。

`/Users/kanekotakumi/Desktop/kawasaki-kaito-goldfish-game`

## 最優先ルール

- ゲームの見た目、背景、スプライト、成長ルール、カエル・猫・スズメの演出は変更しないでください。
- `script.js` のゲーム描画・成長・来訪者・花火・ステージに関するロジックは、明示的な必要がない限り編集禁止です。
- 既存の未コミット変更が多数あります。`git reset --hard`、`git checkout --`、不要な削除、既存変更の巻き戻しはしないでください。
- GitHubへのpush、公開、Apps Scriptのデプロイは行わないでください。コミットも、依頼者の明示的な許可があるまで作成しないでください。
- まず現状を読み、変更前に短い実装計画を示してください。

## 現在のゲーム仕様（変更禁止）

- Vanilla HTML / CSS / JavaScript の静的サイト。ビルド工程はありません。
- 本番画面: `index.html`
- 本番と切り離された確認画面: `counter-test.html`
- カウントAPI: Google Apps Script、実装は `counter.gs`。Web App URL は `script.js` 冒頭の `API_URL`。
- QR / SNS 経由のアクセスは1日・端末・流入元ごとに1回だけ加算する。通常アクセスは取得のみ。
- 成長枠と桶内の生物が同期する。
- 通常金魚と出目金は、カエルを除いた10匹ごとに5匹ずつ出現する。順番は固定シャッフルであり、交互ではない。
- 通常金魚は10カウントで鯉、まれに大きな金魚になる。
- 出目金は赤・黒だけが成長途中に出る。完了時は通常なら同色の大きな出目金、20%で金・緑青・青紫のレア出目金になる。
- カエルは最初に1回、その後は既存の決定的な確率判定で出る。カエルの成長は8カウント。
- 人物とズームアウトは現在停止中。`PEOPLE_ENABLED = false` を変更しない。
- レア来訪者は猫とスズメのみ。

## 現在の構成

- `index.html`: 本番画面
- `counter-test.html`: 本番カウントを変更しない手動テスト画面
- `script.js`: API通信、本番表示、ゲーム描画
- `style.css`: ゲーム画面のスタイル
- `counter.gs`: Google Apps Script のカウンターAPI
- `tests/browser-harness.html`: 通信失敗などの回帰確認画面
- `tests/counter-test.js` / `tests/counter-test.css`: テスト画面専用
- `PROJECT_HANDOFF.md`: 詳細な制作・仕様メモ
- `README.md`: 公開とローカル確認の基本手順

## 今回整備してほしい範囲

ゲーム内容を変えず、公開・保守・確認を安全に行える外側の仕組みを整えてください。まず既存構成を監査し、必要なものだけを提案・実装してください。

優先候補:

1. 本番設定とローカル設定の整理
   - API URL や公開URLなど、環境ごとに変わる値の扱いを明確にする。
   - 秘密情報をリポジトリへ入れない。
2. 再現可能な検査コマンド
   - JavaScript構文確認、静的な素材参照確認、主要ページの確認手順を `README.md` か専用ドキュメントへまとめる。
   - 新しい大きな依存関係は追加しない。
3. GitHub Pages運用の整理
   - 公開前チェックリスト、ロールバック方法、確認URL、キャッシュ更新の考え方を記録する。
   - 自動デプロイを追加する場合は、既存の公開方式を確認してから最小限にする。
4. カウンターAPI運用の整理
   - Apps Script のセットアップ、ヘルスチェック、障害時の確認手順を文書化する。
   - APIの動作仕様を変えない。
5. 品質保証の土台
   - `counter-test.html` と `tests/browser-harness.html` を使った手動・自動の確認手順を整理する。

## まず確認すること

```bash
cd /Users/kanekotakumi/Desktop/kawasaki-kaito-goldfish-game
git status --short
node --check script.js
node --check tests/counter-test.js
node --check < counter.gs
git diff --check
python3 -m http.server 8000
```

ローカル確認URL:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/counter-test.html?sample=0`
- `http://127.0.0.1:8000/tests/browser-harness.html?mode=failure-cache&reset=1`

## 完了条件

- ゲーム内容・見た目・素材・成長確率を変えずに、運用手順と検査方法が明確になる。
- 追加したファイルと変更理由を簡潔に報告する。
- 実行した検査と結果を報告する。
- GitHubへの公開・push・コミットは行わない。
```

## 現在の確認済み項目

- `script.js` と `tests/counter-test.js` の構文チェック
- `counter.gs` の構文チェック
- `git diff --check`
- 金魚・出目金の10匹ごと5対5の固定シャッフル
- 出目金の通常・レア進化先
- テスト画面での主要な成長表示

ゲームの詳しい制作経緯と素材ルールは [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) を参照してください。
