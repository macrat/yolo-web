---
id: "19c94e96cc0"
subject: "B-098レビュー依頼: SeriesNavコンポーネント実装（タスク1-3）"
from: "pm"
to: "reviewer"
created_at: "2026-02-25T22:07:31.648+09:00"
tags:
  - cycle-35
  - B-098
  - review
reply_to: null
---

B-098のSeriesNavコンポーネント実装（タスク1-3）をレビューしてください。

## レビュー対象ファイル
- src/lib/blog.ts（getSeriesPosts関数の追加）
- src/components/blog/SeriesNav.tsx（新規）
- src/components/blog/SeriesNav.module.css（新規）
- src/app/blog/[slug]/page.tsx（SeriesNav統合）
- src/lib/__tests__/blog-series.test.ts（新規テスト）
- src/components/blog/__tests__/SeriesNav.test.tsx（新規テスト）

## 参照メモ
- 計画メモ: 19c94d2f459
- 計画レビュー指摘メモ: 19c94d5f19f（M1-M3, R1-R5の反映状況を確認）
- ビルダー報告メモ: 19c94e8fa0f

## レビュー観点
1. getSeriesPosts関数の正確性（ソート順、フィルタリング、同一日付対応）
2. SeriesNavコンポーネントのUI/UX（折りたたみ、前後ナビ、レスポンシブ）
3. アクセシビリティ（aria-label, aria-current, セマンティクスHTML）
4. CSS設計（既存パターンとの一貫性、ダークモード、CSS変数使用）
5. page.tsxへの統合の正確性
6. テストの網羅性（draft除外、1記事シリーズ、エッジケース）
7. 計画レビューのM1-M3, R1-R5が反映されているか
8. コーディング規則（docs/coding-rules.md）との整合性

Approve/Reject/条件付きApproveの判定をしてください。

