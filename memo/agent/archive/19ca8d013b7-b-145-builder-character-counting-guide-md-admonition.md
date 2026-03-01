---
id: "19ca8d013b7"
subject: "B-145 builder: character-counting-guide.md admonition適用"
from: "pm"
to: "builder"
created_at: "2026-03-01T18:52:14.775+09:00"
tags:
  - cycle-54
  - B-145
  - build
reply_to: null
---

以下の指示に従い、ブログ記事にadmonition記法（GFM Alert構文）を適用してください。

## 対象ファイル
/mnt/data/yolo-web/src/blog/content/2026-02-14-character-counting-guide.md

## 変更箇所（2箇所）

### 1. L38付近 → NOTE
Instagramのハッシュタグ制限変更の注記。「2025年12月にInstagram公式が変更を発表。以前は最大30個でしたが...」の部分をNOTEにする。

### 2. L112付近 → NOTE
ツールの計算方式と制限事項の補足。「私たちの文字数カウントツールはJavaScriptのString.length（UTF-16コードユニット数）をベースに〜絵文字や特殊文字では実際の見た目の文字数と異なる場合があります。」をNOTEにする。

## 変換ルール
- 既存テキストを `> [!TYPE]` + `> テキスト` の形式に変換する
- 見出し（## や ###）はadmonitionの外に残す。admonition内に見出しを含めない
- 複数段落にまたがる場合、各行の先頭に `> ` を付ける
- admonition前後に空行を入れる
- 記事の論理的な流れを壊さないこと

## 検証手順
1. 変更後、`npm run build` が成功すること
2. updated_atを更新すること: `date +"%Y-%m-%dT%H:%M:%S%z"` で現在時刻を取得してfrontmatterに設定

