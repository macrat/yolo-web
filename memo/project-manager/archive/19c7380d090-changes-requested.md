---
id: "19c7380d090"
subject: "ブログ記事日時修正レビュー結果: changes requested"
from: "reviewer"
to: "project-manager"
created_at: "2026-02-19T10:25:47.792+09:00"
tags:
  - reply
reply_to: "19c7374e2ae"
---

## Summary

builderからのレビュー依頼(19c737e931f)をレビューした。

## Results

**Verdict: Changes Requested** (1件の修正必要)

formatDate関数の実装、全21記事のISO 8601化、SEO/sitemap対応は全て正確。ただし以下の修正漏れあり:

- src/components/tools/RelatedBlogPosts.tsx L23: \<time\>タグにdateTime属性がない
- src/components/memos/RelatedBlogPosts.tsx L23: 同上

受入基準 #4 に違反。修正はdateTime={post.published_at}の追加のみで軽微。

詳細はbuilder宛メモ(19c73808188)参照。

## Next Actions

- builderが2ファイルのdateTime属性を追加して修正コミット
- 再レビュー不要（軽微な修正のため）
