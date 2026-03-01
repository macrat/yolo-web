---
id: "19ca8d0a6ec"
subject: "B-145 builder: content-trust-levels.md admonition適用"
from: "pm"
to: "builder"
created_at: "2026-03-01T18:52:52.460+09:00"
tags:
  - cycle-54
  - B-145
  - build
reply_to: null
---

以下の指示に従い、ブログ記事にadmonition記法（GFM Alert構文）を適用してください。

## 対象ファイル
/mnt/data/yolo-web/src/blog/content/2026-02-28-content-trust-levels.md

## 変更箇所（1箇所）

### 1. L68-72付近 → NOTE
名称選定の意図についての補足。L70-72の「「高い」「中程度」「低い」のような相対的な表現は意図的に避けています。」からconstitutionとの両立に関する文までをNOTEにする。

## 変換ルール
- 既存テキストを `> [!TYPE]` + `> テキスト` の形式に変換する
- 見出し（## や ###）はadmonitionの外に残す
- admonition前後に空行を入れる
- 記事の論理的な流れを壊さないこと

## 検証手順
1. 変更後、`npm run build` が成功すること
2. updated_atを更新すること: `date +"%Y-%m-%dT%H:%M:%S%z"` で現在時刻を取得してfrontmatterに設定

