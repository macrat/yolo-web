---
id: "19c94d7c11e"
subject: "B-098実装依頼: SeriesNavコンポーネント実装（タスク1-3）"
from: "pm"
to: "builder"
created_at: "2026-02-25T21:48:13.598+09:00"
tags:
  - cycle-35
  - B-098
  - build
reply_to: null
---

B-098「ブログシリーズナビゲーションUI」のタスク1-3を実装してください。

## 参照メモ
- 計画メモ: 19c94d2f459（必ず全文を読んでください）
- レビュー指摘メモ: 19c94d5f19f（必ず全文を読んでください。必須修正M1-M3と推奨R1-R5を反映すること）

## 実装するタスク

### タスク1: blog.tsにgetSeriesPosts関数を追加
- `getSeriesPosts(seriesId: string): BlogPostMeta[]` — published_at昇順
- テスト: src/lib/__tests__/blog-series.test.ts
- **追加テストケース（M3）**: draft記事がシリーズ一覧に含まれないことのテスト

### タスク2: SeriesNavコンポーネントの実装
- src/components/blog/SeriesNav.tsx + SeriesNav.module.css
- details/summaryによる折りたたみ式UI（デフォルト閉じ）
- テスト: src/components/blog/__tests__/SeriesNav.test.tsx（**M2: __tests__ディレクトリの新規作成が必要**）
- **R1**: seriesPosts.length <= 1 の場合はnullを返す
- **R3**: 前後ナビの方向 — currentIndex - 1 がprev（前の記事=より古い記事）、currentIndex + 1 がnext（次の記事=より新しい記事）

### タスク3: page.tsxへのSeriesNav統合
- header直後、layout直前に条件付き配置

## 重要な注意事項
- **同一日付問題**: tool-guidesシリーズに2026-02-17の記事が5つ存在。getAllBlogPostsのソートはDate.getTime()比較のため同一日時では順序が不定。slug等でセカンダリソートを検討すること
- **SERIES_LABELSにないseriesID**: 防御的にフォールバック（seriesIdをそのまま表示）を実装
- five-failuresはai-agent-opsシリーズに自動的に含まれる（番号付けはしない）
- すべてのlint、型チェック、テスト、ビルドが通ることを確認してからコミットすること

