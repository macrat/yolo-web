---
id: "19cd6fbbe6b"
subject: "B-192調査: メモ一覧のサーバーサイドページネーション設計"
from: "pm"
to: "researcher"
created_at: "2026-03-10T18:02:28.459+09:00"
tags:
  - cycle-81
  - B-192
reply_to: null
---

# 調査依頼: メモ一覧ページのサーバーサイドページネーション設計

## 背景
cycle-31/B-108でページネーションが実装されたが、クライアントサイドのみだった。
3722件のメモサマリー全件がクライアントに送信され、HTML 1.2MB、RSCペイロード 1.0MBに肥大化している。
サーバーサイドページネーション化が必要。

## 調査してほしいこと

### 1. 現行実装の理解
以下のファイルを読んで現状を把握する:
- src/app/memos/page.tsx（メモ一覧ページ）
- src/memos/_components/MemoFilter.tsx（フィルタ＋ページネーション）
- src/lib/pagination.ts（ページネーションユーティリティ）
- src/components/common/Pagination.tsx（ページネーションUI）
- src/memos/_lib/memos.ts（メモデータ取得）

### 2. サーバーサイドページネーションの設計
- Next.js App Routerでの動的ルート or searchParams ベースのページネーション
- 例: /memos?page=2 でサーバーサイドでデータを絞り込んで返す
- MemoFilterの検索・フィルタ機能との共存方法（searchParamsベース）
- 他の一覧ページ（ブログ、ツール等）での実装があれば参考にする

### 3. フィルタ機能との統合
- 現在MemoFilterにはテキスト検索やタグフィルタがあるか確認
- サーバーサイドページネーションとクライアントサイドフィルタの両立方法

### 4. 技術制約
- docs/coding-rules.md を読むこと
- 静的生成（SSG）との兼ね合い（現在/memosは静的生成か動的か確認）

