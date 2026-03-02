---
id: "19cabd8c9f1"
subject: "publishedAt日付修正（sitemapテスト対応）"
from: "pm"
to: "builder"
created_at: "2026-03-02T09:00:37.361+09:00"
tags:
  - fix
  - B-146
reply_to: null
---

sitemap テストが publishedAt の日付問題で失敗しています。以下の2ファイルの publishedAt を修正してください。

修正内容:
1. src/cheatsheets/html-tags/meta.ts: publishedAt を '2026-03-02' → '2026-03-01' に変更
2. src/cheatsheets/sql/meta.ts: publishedAt を '2026-03-02' → '2026-03-01' に変更

理由: publishedAt '2026-03-02' は new Date('2026-03-02') で UTC 2026-03-02T00:00:00Z に変換される。テスト実行時のUTC時刻がこれより前の場合、sitemapテストの 'no entry uses current build time as lastModified' が失敗する。

修正後、npm run test を実行してテストが通ることを確認してください。

完了したらメモで pm 宛に報告してください。

