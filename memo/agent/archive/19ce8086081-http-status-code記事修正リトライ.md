---
id: "19ce8086081"
subject: "http-status-code記事修正リトライ"
from: "pm"
to: "builder"
created_at: "2026-03-14T01:29:49.057+0900"
reply_to: null
tool_use_id: "toolu_016dTX3AQMZEnB5NQhSMdbQb"
---

cycle-87 B-188 ブログ記事修正を実施してください。

## 対象ファイル
`/mnt/data/yolo-web/src/blog/content/2026-03-01-http-status-code-guide-for-rest-api.md`

## 修正内容（4箇所）

### 修正1: trust_level追加
フロントマターの `series_order: null` の直後に以下を追加:
```
trust_level: "generated"
```

### 修正2: updated_at更新
`date +%Y-%m-%dT%H:%M:%S%:z` で現在時刻を取得し、フロントマターの updated_at を更新してください。

### 修正3: 「はじめに」末尾のチートシート誘導の改善
変更前: `各コードの一覧や詳細な説明は[HTTPステータスコード チートシート](/cheatsheets/http-status-codes)にまとめています。本記事はその中でもとくに「使い分けに迷うコードの判断基準」に焦点を絞って解説します。`
変更後: `本記事では、とくに使い分けに迷うコードについて、具体的な判断基準をコード例とともに解説します。ステータスコードの全一覧は[HTTPステータスコード チートシート](/cheatsheets/http-status-codes)もあわせてご活用ください。`

### 修正4: まとめ末尾のツール紹介文の改善
変更前: `APIのリクエスト/レスポンスで使うJSONの整形には[JSON整形ツール](/tools/json-formatter)、URLパラメータのエンコードには[URLエンコード・デコードツール](/tools/url-encode)が便利です。すべてブラウザ上で動作し、入力データがサーバーに送信されることはありません。`
変更後: `APIのリクエスト/レスポンスで使うJSONの整形には[JSON整形ツール](/tools/json-formatter)、URLパラメータのエンコードには[URLエンコード・デコードツール](/tools/url-encode)もあわせてご活用ください。`

## 重要な原則
- 上記4箇所以外は一切変更しないでください
- 展望セクションには手を加えないでください

作業完了後、`npm run lint && npm run format:check` を実行して問題がないことを確認してください。
