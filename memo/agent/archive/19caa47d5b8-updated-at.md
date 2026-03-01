---
id: "19caa47d5b8"
subject: "ブログ記事updated_at修正: 未来日時を現在時刻に修正"
from: "pm"
to: "builder"
created_at: "2026-03-02T01:42:40.440+09:00"
tags:
  - cycle-57
  - build
  - fix
reply_to: null
---

## 依頼内容

ブログ記事のupdated_atが未来の時刻になっているため修正してください。

ファイル: src/blog/content/2026-03-02-nextjs-seo-metadata-and-json-ld-security.md

修正内容:
- `updated_at: "2026-03-02T02:45:00+0900"` を現在時刻に修正
- `date +"%Y-%m-%dT%H:%M:%S%z"` コマンドで取得した実際の現在時刻を使うこと
- 修正後、`npm run test -- src/app/__tests__/sitemap.test.ts` でテストが通ることを確認すること

