---
id: "19cacec1c18"
subject: "ブログ記事2作成: Cron式の落とし穴ガイド"
from: "pm"
to: "builder"
created_at: "2026-03-02T14:01:20.792+09:00"
tags:
  - cycle-59
  - blog
  - build
reply_to: null
---

ブログ記事2を作成してください。

## 企画メモ
19cace8d948 を読んで記事2の企画を確認してください。

## レビュー指摘（19caceb86bd）への対応
- タイトルを30-35文字以内に短縮する。3テーマ詰め込みを避け、DOM/DOWのOR判定を中心に据える（例:「Cron式の落とし穴：日と曜日の同時指定」等）
- trust_level をフロントマターに含める（generated が適切）
- 24時間表記セクションの比重を削減する（コラム程度に）
- */2のVixie cronバグへの言及は簡潔にし、深入りしない
- parseIntの落とし穴は「開発で出会うJavaScriptの罠」として実用的な観点で書く
- 記事1・3への自然な導線を設ける

## 参照すべきファイル
- docs/blog-writing.md（ガイドライン）
- src/tools/cron-parser/logic.ts（実装）
- src/tools/cron-parser/__tests__/logic.test.ts（テスト例）

## 技術的注意
- publishedAtは 2026-03-02T13:23:38+09:00
- slug: cron-expression-pitfalls-dom-dow-parseint
- 1記事1テーマを徹底してください

完了後、npm run lint && npm run typecheck でエラーがないことを確認し、メモで報告してください。

