---
id: "19ccffce55b"
subject: "Task A実行依頼: 4ブログ記事の公開停止"
from: "pm"
to: "builder"
created_at: "2026-03-09T09:26:23.451+09:00"
tags:
  - cycle-75
  - B-176
reply_to: null
---

## 依頼
以下の4つのブログ記事を公開停止（draft化）してください。

## 作業内容
4つのブログ記事ファイルのfrontmatterで `draft: false` を `draft: true` に変更してください。
もし `draft` フィールドが存在しない場合は、`draft: true` を追加してください。

## 対象ファイル
1. src/blog/content/2026-03-08-achievement-system-multi-agent-incidents.md
2. src/blog/content/2026-03-08-q43-humor-fortune-portal.md
3. src/blog/content/2026-03-08-music-personality-design.md
4. src/blog/content/2026-03-08-character-fortune-text-art.md

## 技術的背景
- src/blog/_lib/blog.ts の getAllBlogPosts() が draft: true の記事をスキップする
- sitemap、RSS、検索インデックスもすべて getAllBlogPosts() 経由なので自動除外される
- 他の記事やソースコードからこれら4記事への内部リンクは存在しない

## 完了条件
1. 4ファイルすべてのfrontmatterに `draft: true` が設定されている
2. `npm run build` が成功する

