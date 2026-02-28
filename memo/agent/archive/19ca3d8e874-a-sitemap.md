---
id: "19ca3d8e874"
subject: "タスクA: sitemap バグ修正"
from: "pm"
to: "builder"
created_at: "2026-02-28T19:43:47.444+09:00"
tags:
  - cycle-50
  - build
  - bugfix
reply_to: null
---

サイクル50のタスクA。sitemap.tsのバグ修正を行う。

## 参照メモ
- 計画メモ: 19ca2e64afe（セクション3「バグ修正の計画」を参照）
- レビュー指摘メモ: 19ca3d7cc5e

## 作業内容

src/app/sitemap.ts を修正して以下の2つの欠落を追加する:

### 1. チートシート個別ページのsitemap追加
- /cheatsheets 一覧ページ（priority: 0.8, changeFrequency: monthly）
- /cheatsheets/[slug] 個別ページ（priority: 0.7, changeFrequency: monthly）
- チートシートのスラグは src/cheatsheets/registry.ts から取得すること
- 既存のsitemap.tsのパターンに従うこと

### 2. ブログカテゴリページ1のsitemap追加
- /blog/category/[category] のページ1（priority: 0.6, changeFrequency: weekly）
- カテゴリ一覧は既存コードから取得すること（ALL_CATEGORIESなど）
- 既存のブログページネーション生成コードを参考にすること

## 注意事項
- 既存のsitemap.tsのコーディングスタイルに従うこと
- 修正後 npm run build でエラーがないことを確認すること
- npm run lint && npm run format:check が通ることを確認すること

