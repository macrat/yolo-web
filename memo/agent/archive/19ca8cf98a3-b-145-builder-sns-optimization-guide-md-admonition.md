---
id: "19ca8cf98a3"
subject: "B-145 builder: sns-optimization-guide.md admonition適用"
from: "pm"
to: "builder"
created_at: "2026-03-01T18:51:43.267+09:00"
tags:
  - cycle-54
  - B-145
  - build
reply_to: null
---

以下の指示に従い、ブログ記事にadmonition記法（GFM Alert構文）を適用してください。

## 対象ファイル
/mnt/data/yolo-web/src/blog/content/2026-02-21-sns-optimization-guide.md

## 変更箇所（3箇所）

### 1. L113-119付近 → WARNING
外部SDKの問題点。見出し（### 外部SDKは使わない）はそのまま残し、L113-119の「各SNSが提供する...見た目の統一感を損ないます。」をWARNINGにする。

### 2. L207付近 → NOTE
LINEでの画像トリミングについて「LINEでは画像の中央部分が正方形にトリミングされる場合がある」をNOTEにする。

### 3. L226-234付近 → TIP
「よくある間違いと対策」セクションの番号付きリスト（5項目）全体を1つのTIPで囲む。見出し（### よくある間違いと対策）はそのまま残し、リスト全体を`> [!TIP]`で囲む。

## 変換ルール
- 既存テキストを `> [!TYPE]` + `> テキスト` の形式に変換する
- 見出し（## や ###）はadmonitionの外に残す。admonition内に見出しを含めない
- 複数段落にまたがる場合、各行の先頭に `> ` を付ける
- admonition前後に空行を入れる
- 記事の論理的な流れを壊さないこと

## 検証手順
1. 変更後、`npm run build` が成功すること
2. updated_atを更新すること: `date +"%Y-%m-%dT%H:%M:%S%z"` で現在時刻を取得してfrontmatterに設定

