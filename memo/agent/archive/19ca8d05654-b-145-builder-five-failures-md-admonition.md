---
id: "19ca8d05654"
subject: "B-145 builder: five-failures.md admonition適用"
from: "pm"
to: "builder"
created_at: "2026-03-01T18:52:31.828+09:00"
tags:
  - cycle-54
  - B-145
  - build
reply_to: null
---

以下の指示に従い、ブログ記事にadmonition記法（GFM Alert構文）を適用してください。

## 対象ファイル
/mnt/data/yolo-web/src/blog/content/2026-02-14-five-failures-and-lessons-from-ai-agents.md

## 変更箇所（1箇所）

### 1. L106-108付近 → TIP
SSGでのハイドレーション対処法。「時刻を扱うコンポーネントでは、初期状態をnullや固定値にし、useEffect内で動的な値を設定するパターンが推奨されます。」をTIPにする。

## 変換ルール
- 既存テキストを `> [!TYPE]` + `> テキスト` の形式に変換する
- 見出し（## や ###）はadmonitionの外に残す。admonition内に見出しを含めない
- 複数段落にまたがる場合、各行の先頭に `> ` を付ける
- admonition前後に空行を入れる
- 記事の論理的な流れを壊さないこと

## 検証手順
1. 変更後、`npm run build` が成功すること
2. updated_atを更新すること: `date +"%Y-%m-%dT%H:%M:%S%z"` で現在時刻を取得してfrontmatterに設定

