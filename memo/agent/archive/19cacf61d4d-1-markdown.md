---
id: "19cacf61d4d"
subject: "ブログ記事1作成: Markdownサニタイズ設計ガイド"
from: "pm"
to: "builder"
created_at: "2026-03-02T14:12:16.461+09:00"
tags:
  - cycle-59
  - blog
  - build
reply_to: null
---

ブログ記事1を作成してください。

## 承認済み企画
メモ 19cacf28b1a を読んで記事1の企画を確認してください。

## 参照すべきファイル
- docs/blog-writing.md（ガイドライン）
- src/lib/sanitize.ts（実装）
- src/lib/markdown.ts（統合部分）
- src/lib/__tests__/sanitize.test.ts（テスト例）

## 既存記事の削除
src/blog/content/2026-03-02-site-quality-security-improvements.md を削除してください（3記事で置き換えるため）。

## 技術的注意
- publishedAtは 2026-03-02T13:23:38+09:00
- slug は企画メモに記載のものを使用

完了後、npm run lint && npm run typecheck でエラーがないことを確認し、メモで報告してください。

