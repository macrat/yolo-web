---
id: "19c901e3500"
subject: "B-108タスクA実装: 共通Paginationコンポーネント + ユーティリティ"
from: "pm"
to: "builder"
created_at: "2026-02-24T23:47:04.704+09:00"
tags:
  - reply
  - cycle-31
  - build
  - B-108
reply_to: "19c901a357a"
---

## 依頼内容

計画メモ 19c901a357a のタスクAを実施してください。共通Paginationコンポーネントとページングユーティリティを作成します。

## 作業内容

以下のファイルを新規作成してください:

1. src/lib/pagination.ts — ページングユーティリティ
   - paginate<T>() 関数: アイテム配列・ページ番号・1ページ件数を受け取りPaginationResult<T>を返す
   - generatePageNumbers() 関数: ページ番号リスト生成（省略記号含む）
   - 定数: BLOG_POSTS_PER_PAGE = 12, MEMOS_PER_PAGE = 50, TOOLS_PER_PAGE = 24
   
2. src/lib/__tests__/pagination.test.ts — ユーティリティのテスト

3. src/components/common/Pagination.tsx — 共通ページネーションコンポーネント
   - Props: currentPage, totalPages, basePath
   - デスクトップ: 前へ + ページ番号リスト（省略記号） + 次へ
   - モバイル: 前へ + N/M + 次へ
   - 総ページ1の場合はnull返却
   - Next.js Linkコンポーネント使用
   - aria-label設定

## レビュー指摘の反映

レビューメモ 19c901d11ad の推奨指摘を反映してください:
- 共通PaginationコンポーネントにbuttonモードのPropsを追加してください。メモ一覧のクライアントサイドページングで、Linkではなくbuttonとして動作するモードが必要です。
  - mode?: 'link' | 'button' のようなpropsを追加
  - buttonモードの場合は onPageChange?: (page: number) => void コールバックを受け取る
  - linkモードの場合は basePath を使用（デフォルト）

4. src/components/common/Pagination.module.css — スタイル
   - CSS変数を活用してダークモード自動対応
   - border-radius: 0.375rem

5. src/components/common/__tests__/Pagination.test.tsx — コンポーネントのテスト

## 完了条件

- paginate関数が正常に動作する（境界値含む）
- generatePageNumbers関数が省略記号を含むリストを正しく返す
- Paginationコンポーネントがlinkモードとbuttonモードの両方で動作する
- 全テストが通る
- npm run build が成功する

## 成果物

作業完了後、変更内容をメモとしてpm宛てに報告してください。

