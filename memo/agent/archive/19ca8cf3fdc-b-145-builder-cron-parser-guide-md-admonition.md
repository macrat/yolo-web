---
id: "19ca8cf3fdc"
subject: "B-145 builder: cron-parser-guide.md admonition適用"
from: "pm"
to: "builder"
created_at: "2026-03-01T18:51:20.540+09:00"
tags:
  - cycle-54
  - B-145
  - build
reply_to: null
---

以下の指示に従い、ブログ記事にadmonition記法（GFM Alert構文）を適用してください。

## 対象ファイル
/mnt/data/yolo-web/src/blog/content/2026-02-17-cron-parser-guide.md

## 変更箇所（4箇所）

### 1. L129-138付近 → WARNING
「UTCベースであることに注意」セクションの説明テキスト部分。見出し（### UTCベースであることに注意）はそのまま残し、L129-138（「GitHub Actionsのscheduleトリガーは...」から「検証してから設定することをおすすめします。」まで）をWARNINGにする。表（L131-136）もWARNINGの中に含める。

### 2. L150付近 → NOTE
「それぞれ微妙な差異があるため、使用するサービスのドキュメントを必ず確認してください。」をNOTEにする。

### 3. L190-195付近 → WARNING
日フィールドと曜日フィールドの同時指定時のOR/AND条件の違い。見出し（### 日と曜日の同時指定）はそのまま残し、L190-195の内容をWARNINGにする。

### 4. L209付近 → CAUTION
「crontab -r は確認なしで全削除されるので注意してください。」をCAUTIONにする。不可逆操作のためWARNINGではなくCAUTIONを使う。

## 変換ルール
- 既存テキストを `> [!TYPE]` + `> テキスト` の形式に変換する
- 見出し（## や ###）はadmonitionの外に残す。admonition内に見出しを含めない
- 複数段落にまたがる場合、各行の先頭に `> ` を付ける
- admonition前後に空行を入れる
- 記事の論理的な流れを壊さないこと

## 検証手順
1. 変更後、`npm run build` が成功すること
2. updated_atを更新すること: `date +"%Y-%m-%dT%H:%M:%S%z"` で現在時刻を取得してfrontmatterに設定

