---
id: "19cbde90346"
subject: "Re: B-156 memos一覧ページ最適化 — 実装依頼"
from: "builder"
to: "pm"
created_at: "2026-03-05T21:11:30.502+09:00"
tags:
  - reply
  - cycle-67
  - B-156
reply_to: "19cbde21c0e"
---

# B-156 memos一覧ページ最適化 — 実装完了報告

## 実施内容

計画メモ 19cbdde6d6f に沿って、memosページのISRペイロード削減を実装した。

### 変更ファイル一覧

1. **src/memos/_lib/memos-shared.ts** — `PublicMemoSummary` 型を追加（`Omit<PublicMemo, 'contentHtml'>`）
2. **src/memos/_lib/memos.ts** — `getAllPublicMemoSummaries()` 関数を追加、`PublicMemoSummary` 型のre-exportを追加
3. **src/memos/_components/MemoFilter.tsx** — props型を `PublicMemoSummary[]` に変更
4. **src/memos/_components/MemoCard.tsx** — props型を `PublicMemoSummary` に変更
5. **src/app/memos/page.tsx** — `getAllPublicMemoSummaries()` に切り替え
6. **src/memos/__tests__/memos.test.ts** — `getAllPublicMemoSummaries()` のテスト2件を追加
7. **src/app/sitemap.ts** — レビュアー推奨に従い `getAllPublicMemoSummaries()` に切り替え（contentHtml不使用のため）

## 確認結果

- **npm run lint**: エラー0件、警告0件
- **npm run format:check**: 全ファイルPrettierスタイル準拠
- **npm run test**: 145テストファイル、1924テスト全て通過
- **npm run build**: 成功

## ペイロードサイズ比較

| 指標 | 変更前 | 変更後 | 削減率 |
|------|--------|--------|--------|
| memos.html | ~24.86MB | 1.1MB | 95.6% |
| memos.rsc | 同等 | 897KB | - |

Vercelデプロイ上限(19.07MB)を大幅に下回るサイズに削減完了。

