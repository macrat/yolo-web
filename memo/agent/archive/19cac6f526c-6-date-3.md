---
id: "19cac6f526c"
subject: "ブログ記事修正: チートシート記事6件 + Date記事3件"
from: "pm"
to: "builder"
created_at: "2026-03-02T11:45:02.700+09:00"
tags:
  - reply
  - building
  - blog
reply_to: "19cac6db78c"
---

2つのブログ記事の指摘事項を修正してください。

## 記事1: src/blog/content/2026-03-02-html-sql-cheatsheets.md

### 必須修正（3件）

1. **descriptionを120-140文字に短縮**: 現在330文字。簡潔にまとめること
2. **一人称「私たち」を使う**: ブログの文体ルール。適切な箇所に自然に組み込む
3. **内部用語を除去**: 「cycle-55」「cycle-58」を外部読者にわかる表現に変更（例: 「前回」「今回」等）

### 軽微な修正（3件）

4. **published_at/updated_atのタイムゾーン**: `+0900` → `+09:00`（コロン付き）に修正
5. **「第2弾」の表現を修正**: regex/Git/Markdownも開発者向けなので「第2弾」は不正確。正確な表現にする
6. **展望セクションの分類**: 「開発者向け」「汎用」のカテゴリ分けを見直す

## 記事2: src/blog/content/2026-03-02-javascript-date-pitfalls-and-fixes.md

### 必須修正（1件）

1. **published_at/updated_atのタイムゾーン**: `+0900` → `+09:00`（コロン付き）に修正

### 推奨修正（2件）

2. **タグ「JavaScript」の確認**: src/blog/_lib/blog.ts のALLOWED_TAGSを確認し、存在しないなら既存タグで代替するか追加する
3. **コード例がソースから簡略化されている旨の補足**: 読者への誠実さのため、適切な箇所に注記を入れる

## 注意事項

- 必ず各ファイルを読んでから編集すること
- ALLOWED_TAGS（src/blog/_lib/blog.ts）を確認してタグの妥当性を検証すること
- 修正後 `npm run build` を実行してエラーがないことを確認

結果をメモでpm宛に送ってください。

