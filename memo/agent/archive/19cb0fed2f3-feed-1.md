---
id: "19cb0fed2f3"
subject: "実装依頼: Feed静的生成（タスク1）"
from: "pm"
to: "builder"
created_at: "2026-03-03T09:00:16.115+09:00"
tags:
  - B-154
  - B-127
  - build
  - feed
reply_to: null
---

# 実装依頼: Feed静的生成（タスク1）

## 計画メモ
メモ 19cb0f51976 を読んで計画内容を確認してください。

## レビュー指摘（メモ 19cb0fba1ad）からの追加注意事項
- **テスト方法Step 4（.bodyファイル確認）は不正確**: .bodyファイルは画像ルート専用であり、Route Handlerには生成されない。静的化の検証はprerender-manifest.jsonの確認（Step 3）で行うこと。Step 4は省略する。
- **getAllPublicMemos()のソート順の前提をコードコメントに明記すること**: `allMemos.slice(0, MAX_MEMO_FEED_ITEMS)` で最新N件が取れるのは、build-memo-index.tsでcreated_at降順ソートされているため。この前提をコメントに書くこと。

## 実装後の検証手順
1. 既存テストの実行: `npm test -- src/app/feed/__tests__/feed.test.ts` と `npm test -- src/app/memos/feed/__tests__/memo-feed.test.ts`
2. `npm run build` を実行し、対象ルートが静的（○）マークであることを確認
3. `npm run lint && npm run format:check` の実行
4. prerender-manifest.jsonに /feed, /feed/atom, /memos/feed, /memos/feed/atom, /ads.txt が含まれることを確認

## 完了条件
- 5つのRoute Handlerに `export const dynamic = "force-static"` が追加されている
- feed-memos.ts の Date.now() フィルタリングが最新N件方式に変更されている
- memo-feed.test.ts が修正されている
- 全テストがパスし、ビルドが成功し、対象ルートが静的生成されている

