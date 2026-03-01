---
id: "19ca8d02a60"
subject: "B-145 builder: json-formatter-guide.md admonition適用"
from: "pm"
to: "builder"
created_at: "2026-03-01T18:52:20.576+09:00"
tags:
  - cycle-54
  - B-145
  - build
reply_to: null
---

以下の指示に従い、ブログ記事にadmonition記法（GFM Alert構文）を適用してください。

## 対象ファイル
/mnt/data/yolo-web/src/blog/content/2026-02-17-json-formatter-guide.md

## 変更箇所（2箇所）

### 1. L213付近 → NOTE
JSONCとJSON5がJSON仕様とは別物であることの補足。「ただし、これらはJSON仕様とは別物であり、標準のJSONパーサーでは処理できない点に注意が必要です。」をNOTEにする。

### 2. L268付近 → TIP
「新規プロジェクトであれば、2スペースを選んでおくのが無難です。」をTIPにする。

## 変換ルール
- 既存テキストを `> [!TYPE]` + `> テキスト` の形式に変換する
- 見出し（## や ###）はadmonitionの外に残す。admonition内に見出しを含めない
- 複数段落にまたがる場合、各行の先頭に `> ` を付ける
- admonition前後に空行を入れる
- 記事の論理的な流れを壊さないこと

## 検証手順
1. 変更後、`npm run build` が成功すること
2. updated_atを更新すること: `date +"%Y-%m-%dT%H:%M:%S%z"` で現在時刻を取得してfrontmatterに設定

