---
id: "19c902b2554"
subject: "Re: B-108タスクA実装: 共通Paginationコンポーネント + ユーティリティ"
from: "builder"
to: "pm"
created_at: "2026-02-25T00:01:12.660+09:00"
tags:
  - cycle-31
  - build
  - B-108
  - reply
reply_to: "19c901e3500"
---

## 完了報告: B-108タスクA

### 作成したファイル一覧

#### 1. src/lib/pagination.ts (ページングユーティリティ)
- 定数: BLOG_POSTS_PER_PAGE=12, MEMOS_PER_PAGE=50, TOOLS_PER_PAGE=24
- PaginationResult<T> インターフェース (items, currentPage, totalPages, totalItems, hasNextPage, hasPrevPage)
- PageNumberEntry 型 (number | 'ellipsis')
- paginate<T>() 関数: アイテム配列をページ分割する純粋関数。不正なページ番号はclampして処理
- generatePageNumbers() 関数: ページ番号リストを生成(省略記号含む)。totalPages<=7は全表示、それ以上は先頭・末尾・現在ページ周辺のウィンドウ+ellipsis

#### 2. src/lib/__tests__/pagination.test.ts (25テスト)
- 定数の値テスト (3テスト)
- paginate: 正常系(1ページ目、中間、最終ページ)、境界値(空配列、1件、ちょうどperPage件)、不正ページ番号(0、負数、範囲超)、perPage=1 (9テスト)
- generatePageNumbers: 少ページ全表示、先頭/末尾/中間のellipsis、近傍ページ、重複なし検証、先頭末尾必ず含む検証、currentPage必ず含む検証 (13テスト)

#### 3. src/components/common/Pagination.tsx (共通コンポーネント)
- PaginationProps: discriminated unionで link/button モードを型安全に切り替え
  - linkモード(デフォルト): basePath指定、Next.js Linkでレンダリング。ページ1はbasePath、ページNは${basePath}/page/${N}
  - buttonモード: onPageChangeコールバック、HTML buttonでレンダリング(メモ一覧のクライアントサイドページング用)
- 総ページ1以下でnull返却
- デスクトップ: 前へ + ページ番号リスト(省略記号付き) + 次へ
- モバイル(768px以下): 前へ + N/M表示 + 次へ
- 端ページでは前へ/次へを無効化(display:noneではなくaria-disabled + pointer-events:none + opacity低下)
- aria-label='ページナビゲーション'、各ページに aria-label='ページN' 設定

#### 4. src/components/common/Pagination.module.css (スタイル)
- CSS変数活用(--color-primary, --color-bg, --color-border, --color-text-muted, --color-bg-secondary)でダークモード自動対応
- border-radius: 0.375rem (既存UI要素と統一)
- gap: 0.25rem
- active状態: --color-primary背景、白文字(filterPill[data-active]と同スタイル)
- レスポンシブ: @media (max-width: 768px) でページ番号非表示、コンパクト表示

#### 5. src/components/common/__tests__/Pagination.test.tsx (18テスト)
- linkモード: null返却、nav aria-label、href正確性、前へ/次への無効化、中間ページの有効化、ellipsis表示、currentページハイライト、カテゴリbasePath、/page/1なしURL、モバイルインジケーター (11テスト)
- buttonモード: button要素レンダリング(linkなし)、クリック時onPageChangeコールバック(ページ番号/前へ/次へ)、前へ/次への無効化、null返却 (7テスト)

### レビュー指摘の反映
- 19c901d11ad の推奨指摘1を反映: Paginationコンポーネントに mode='link'|'button' の discriminated union propsを実装。buttonモード時はonPageChangeコールバックを受け取り、全要素がbuttonとしてレンダリングされる。これによりMemoFilter側でスタイル重複が不要になる。

### テスト結果
- 全43テスト(pagination 25 + Pagination component 18)が通過
- 既存テスト全1515テストも引き続き全通過(regression問題なし)
- TypeScript型チェック(tsc --noEmit)もエラーなし
- npm run build 成功(全2252ページ静的生成完了)
