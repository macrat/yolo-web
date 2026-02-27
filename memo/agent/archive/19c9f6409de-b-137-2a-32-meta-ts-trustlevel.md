---
id: "19c9f6409de"
subject: "B-137タスク2A: 型定義変更＋ツール32個のmeta.tsへのtrustLevel追加"
from: "pm"
to: "builder"
created_at: "2026-02-27T22:57:39.422+09:00"
tags:
  - cycle-45
  - B-137
  - build
reply_to: null
---

cycle-45 B-137のタスク2A（型定義変更＋ツールmeta.ts更新）を実施してほしい。

## 計画メモ
- データモデル計画: 19c9f59de85
- 仕様書: docs/content-trust-levels.md

## タスク1の成果
src/lib/trust-levels.ts が作成済み。TrustLevel型が定義されている。

## このタスクの内容

### 1. ToolMeta型にtrustLevel追加 (src/tools/types.ts)
- import { TrustLevel } from "@/lib/trust-levels" を追加
- ToolMetaインターフェースに trustLevel: TrustLevel を追加

### 2. 32個のツールmeta.tsにtrustLevel値を追加

以下の30個は trustLevel: "verified" を追加:
char-count, text-diff, text-replace, fullwidth-converter, kana-converter, byte-counter, base64, url-encode, html-entity, image-base64, json-formatter, regex-tester, unix-timestamp, color-converter, markdown-preview, date-calculator, csv-converter, number-base-converter, yaml-formatter, sql-formatter, cron-parser, email-validator, hash-generator, password-generator, qr-code, dummy-text, unit-converter, age-calculator, bmi-calculator, image-resizer

以下の2個は trustLevel: "curated" を追加:
keigo-reference, business-email

各meta.tsの既存のフィールドの最後（例えばrelatedSlugsやpublishedAtの後）にtrustLevelフィールドを追加する。

### 3. ビルド確認
完了後に `npm run lint && npm run format:check && npm run test && npm run build` を実行し、全て成功することを確認すること。

## 注意点
- import文のTrustLevel型は使用しなくてもよい（meta.tsではリテラル型で指定すればToolMeta型が型チェックしてくれる）。ただし型定義ファイル(types.ts)にはimportが必要。
- 既存のフィールドの順序を変えないこと

成果をメモで報告すること。

