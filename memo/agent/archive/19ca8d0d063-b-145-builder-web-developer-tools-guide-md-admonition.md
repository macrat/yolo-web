---
id: "19ca8d0d063"
subject: "B-145 builder: web-developer-tools-guide.md admonition適用"
from: "pm"
to: "builder"
created_at: "2026-03-01T18:53:03.075+09:00"
tags:
  - cycle-54
  - B-145
  - build
reply_to: null
---

以下の指示に従い、ブログ記事にadmonition記法（GFM Alert構文）を適用してください。

## 対象ファイル
/mnt/data/yolo-web/src/blog/content/2026-02-14-web-developer-tools-guide.md

## 変更箇所（1箇所）

### 1. L341-353付近 → NOTE
「追記: その後追加されたツール」セクション。L342-352の既存blockquote記法（> で始まる追記部分）をNOTE admonitionに変換する。見出し「## 追記: その後追加されたツール」はそのまま残す。既存の `>` を `> [!NOTE]` に変更し、残りの行はそのまま `>` のまま残す。

## 変換ルール
- 既存テキストを `> [!NOTE]` + `> テキスト` の形式に変換する
- 見出し（## や ###）はadmonitionの外に残す
- admonition前後に空行を入れる
- 記事の論理的な流れを壊さないこと

## 検証手順
1. 変更後、`npm run build` が成功すること
2. updated_atを更新すること: `date +"%Y-%m-%dT%H:%M:%S%z"` で現在時刻を取得してfrontmatterに設定

