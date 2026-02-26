---
id: "19c97c5d69f"
subject: "B-119フェーズ6: blogの移行 + AP-1修正 + src/content/廃止"
from: "pm"
to: "builder"
created_at: "2026-02-26T11:27:31.103+09:00"
tags:
  - cycle-36
  - B-119
  - phase-6
  - build
reply_to: null
---

# B-119 フェーズ6: blog の移行 + AP-1修正 + src/content/廃止

## 計画参照
- 19c97779e81: 計画v2.1（フェーズ6セクション）
- 19c977e9ac8: 計画v2.2差分（フェーズ6の修正 — src/content/問題の解決）

## 作業内容

### 1. src/blog/ ディレクトリを新規作成

### 2. lib/blog.ts の移動
- src/lib/blog.ts → src/blog/_lib/blog.ts に git mv
- src/lib/__tests__/blog-series.test.ts → src/blog/__tests__/blog-series.test.ts に git mv

### 3. components/blog/ の移動
- src/components/blog/ → src/blog/_components/ に git mv（__tests__/SeriesNav.test.tsx も含む）

### 4. AP-1修正: BlogListView.tsx のCSS依存修正
- app/blog/page.module.css からBlogListView固有のスタイルを抽出
- src/blog/_components/BlogListView.module.css として新規作成
- BlogListView.tsx のインポートを変更
- ※レビューによると、page.module.cssの全10クラスはBlogListView.tsx内で使用されているため、全て移動後にpage.module.cssは空になり削除可能

### 5. BLOG_DIR パスの変更【v2.2 Critical修正】
- blog/_lib/blog.ts 内の BLOG_DIR パスを変更:
  - 旧: process.cwd() + 'src/content/blog'
  - 新: process.cwd() + 'src/blog/content'

### 6. Markdownファイルの移動【v2.2 Critical修正】
- src/content/blog/ の全Markdownファイル（約35ファイル）を src/blog/content/ に git mv で移動

### 7. src/content/ ディレクトリの削除【v2.2 Critical修正】
- 移動完了後、src/content/ ディレクトリが空であることを確認し、削除する

### 8. インポートパスの更新
- @/lib/blog → @/blog/_lib/blog
- @/components/blog/* → @/blog/_components/*

### 9. cross-links.ts の更新（blog部分のみ）
- @/lib/blog → @/blog/_lib/blog

### 10. feed.ts のインポート更新

### 11. search/build-index.ts のインポート更新

### 12. 空になった src/components/blog/ を削除

### 検証（すべてパスすること）
- npm run typecheck
- npm run test
- npm run build（ブログページの生成を特に確認）
- npm run lint
- npm run format:check
- grep で旧パス（@/lib/blog, @/components/blog/）が残っていないことを確認
- src/content/ ディレクトリが存在しないことを確認（ls src/content/ がエラーになること）

### コミット
"refactor(B-119): phase 6 — blog移行 + AP-1修正 + src/content/廃止"

## 注意事項
- git mv を使ってファイル移動（トレーサビリティ確保）
- **最重要**: src/content/ ディレクトリを完全に廃止すること。これはownerの根本課題（AIエージェントがAstroプロジェクトと誤認する問題）の解決に直結する
- cross-links.ts はblog部分のみ更新。memos部分はフェーズ7で更新する
- ブログ記事内にブログ記事内のMarkdownファイル内に相対パスの記述がないか念のため確認すること

完了したらメモで結果を報告してください。

