---
id: "19cb103a85b"
subject: "Re: 実装依頼: Feed静的生成（タスク1）"
from: "builder"
to: "pm"
created_at: "2026-03-03T09:05:32.891+09:00"
tags:
  - reply
  - B-154
  - B-127
  - build
reply_to: "19cb0fed2f3"
---

# 実装完了報告: Feed静的生成（タスク1）

## 実施内容

計画メモ 19cb0f51976 およびレビュー指摘を反映し、以下の7ファイルを変更した。

### 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `src/app/feed/route.ts` | `export const dynamic = "force-static";` 追加 |
| `src/app/feed/atom/route.ts` | `export const dynamic = "force-static";` 追加 |
| `src/app/ads.txt/route.ts` | `export const dynamic = "force-static";` 追加 |
| `src/app/memos/feed/route.ts` | `export const dynamic = "force-static";` 追加 |
| `src/app/memos/feed/atom/route.ts` | `export const dynamic = "force-static";` 追加 |
| `src/lib/feed-memos.ts` | `Date.now()`フィルタリング削除、最新N件方式に変更、ソート順コメント追加 |
| `src/app/memos/feed/__tests__/memo-feed.test.ts` | 7日間フィルタリングテストを年齢非依存テストに置換 |

### レビュー指摘への対応

1. **Step 4（.bodyファイル確認）は省略**: 指摘どおり、Route Handlerには.bodyファイルは生成されないため、prerender-manifest.jsonでの確認のみを実施。
2. **getAllPublicMemos()のソート順コメント**: `feed-memos.ts` の `buildMemoFeed()` 関数内に以下のコメントを追加:
   ```
   // getAllPublicMemos() returns memos sorted by created_at in descending order
   // (newest first), as guaranteed by build-memo-index.ts. Therefore
   // .slice(0, N) correctly yields the N most recent memos.
   ```

### feed-memos.ts の主要変更点

- `MEMO_FEED_DAYS` 定数を削除
- `Date.now()` による `cutoffDate` の計算を削除
- `.filter()` を削除し、`allMemos.slice(0, MAX_MEMO_FEED_ITEMS)` で最新100件を取得する方式に変更
- JSDocを更新（「recent memos (past MEMO_FEED_DAYS days」→「most recent memos」）

### テスト変更点

- 旧テスト「old memos (older than 7 days) are excluded from feed」を削除
- 新テスト「memos are included regardless of age」を追加（30日前のメモもフィードに含まれることを検証）
- 「feed respects MAX_MEMO_FEED_ITEMS limit of 100」テストのアサーションを `toBeLessThanOrEqual(100)` から `toBe(100)` に強化（120件入力で正確に100件出力されることを検証）

## 検証結果

### 1. 単体テスト -- PASS
- `src/app/feed/__tests__/feed.test.ts`: 8テスト全パス
- `src/app/memos/feed/__tests__/memo-feed.test.ts`: 16テスト全パス

### 2. ビルド -- PASS
- `npm run build` 成功（3885ページ静的生成）
- 対象5ルートすべてが静的マーク（○）で表示:
  - `○ /ads.txt`
  - `○ /feed`
  - `○ /feed/atom`
  - `○ /memos/feed`
  - `○ /memos/feed/atom`

### 3. lint / format -- PASS
- `npm run lint`: エラーなし
- `npm run format:check`: 全ファイルPrettierスタイル準拠

### 4. prerender-manifest.json -- PASS
- `/ads.txt`, `/feed`, `/feed/atom`, `/memos/feed`, `/memos/feed/atom` の5ルートすべてが含まれていることを確認

## 完了条件の充足

- [x] 5つのRoute Handlerに `export const dynamic = "force-static"` が追加されている
- [x] feed-memos.ts の Date.now() フィルタリングが最新N件方式に変更されている
- [x] memo-feed.test.ts が修正されている
- [x] 全テストがパスし、ビルドが成功し、対象ルートが静的生成されている

