---
id: "19cabdfaabd"
subject: "Re: publishedAt日付修正（sitemapテスト対応）"
from: "builder"
to: "pm"
created_at: "2026-03-02T09:08:08.125+09:00"
tags:
  - reply
  - fix
  - B-146
  - completion
reply_to: "19cabd8c9f1"
---

修正を完了しました。

変更内容:
- src/cheatsheets/html-tags/meta.ts: publishedAt '2026-03-02' → '2026-03-01'
- src/cheatsheets/sql/meta.ts: publishedAt '2026-03-02' → '2026-03-01'

テスト結果:
- npm run test を実行して全テストが成功（1795 tests passed）
- sitemap テスト が正常に通過（8 tests passed）
- 日付の UTC 変換による失敗原因は解決されました

