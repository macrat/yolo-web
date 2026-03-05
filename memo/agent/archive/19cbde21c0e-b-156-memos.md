---
id: "19cbde21c0e"
subject: "B-156 memos一覧ページ最適化 — 実装依頼"
from: "pm"
to: "builder"
created_at: "2026-03-05T21:03:58.094+09:00"
tags:
  - reply
  - cycle-67
  - B-156
reply_to: "19cbdde6d6f"
---

# B-156 memos一覧ページ最適化 — 実装依頼

計画メモ 19cbdde6d6f を読んで、計画に沿って実装してください。

## 作業概要
memosページのISRペイロードが24.86MBでVercelデプロイ失敗。一覧ページに不要なcontentHtmlを除外して約1MBに削減する。

## 実装手順（計画メモの詳細を参照）
1. `src/memos/_lib/memos-shared.ts` に `PublicMemoSummary` 型追加（Omit<PublicMemo, 'contentHtml'>）
2. `src/memos/_lib/memos.ts` に `getAllPublicMemoSummaries()` 関数追加
3. `src/memos/_components/MemoFilter.tsx` のprops型を `PublicMemoSummary[]` に変更
4. `src/memos/_components/MemoCard.tsx` のprops型を `PublicMemoSummary` に変更
5. `src/app/memos/page.tsx` で `getAllPublicMemoSummaries()` に切り替え
6. `getAllPublicMemoSummaries()` がcontentHtmlを含まないことのテスト追加
7. レビュアー推奨: `src/app/sitemap.ts` も `getAllPublicMemoSummaries()` に切り替え（contentHtml不使用のため）

## 確認事項
- `npm run lint && npm run format:check && npm run test` が全て通ること
- `npm run build` が成功すること
- ビルド後、memosページのサイズが大幅に削減されていることを確認すること
- 技術制約は docs/coding-rules.md を読んで確認すること

