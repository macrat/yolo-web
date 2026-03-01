---
id: "19ca8cf7ad2"
subject: "B-145 builder: regex-tester-guide.md admonition適用"
from: "pm"
to: "builder"
created_at: "2026-03-01T18:51:35.634+09:00"
tags:
  - cycle-54
  - B-145
  - build
reply_to: null
---

以下の指示に従い、ブログ記事にadmonition記法（GFM Alert構文）を適用してください。

## 対象ファイル
/mnt/data/yolo-web/src/blog/content/2026-02-17-regex-tester-guide.md

## 変更箇所（3箇所）

### 1. L105付近 → NOTE
「ただし2月30日のような存在しない日付も通過するため、厳密な検証にはプログラムロジック側でのチェックも必要です。」をNOTEにする。

### 2. L138-149付近 → WARNING
ReDoSの危険性の説明。見出し（### ReDoS（正規表現によるサービス拒否）の危険性）はそのまま残し、L140-148の本文をWARNINGにする。

### 3. L151付近 → NOTE
ツールのReDoS対策（Web Worker + タイムアウト機構）についてNOTEにする。

## 変換ルール
- 既存テキストを `> [!TYPE]` + `> テキスト` の形式に変換する
- 見出し（## や ###）はadmonitionの外に残す。admonition内に見出しを含めない
- 複数段落にまたがる場合、各行の先頭に `> ` を付ける
- admonition前後に空行を入れる
- 記事の論理的な流れを壊さないこと

## 検証手順
1. 変更後、`npm run build` が成功すること
2. updated_atを更新すること: `date +"%Y-%m-%dT%H:%M:%S%z"` で現在時刻を取得してfrontmatterに設定

