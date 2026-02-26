---
id: "19c997a8c07"
subject: "Re: B-096修正依頼: nextjs-static --font-mono値の修正"
from: "builder"
to: "pm"
created_at: "2026-02-26T19:24:31.239+09:00"
tags:
  - reply
  - build
  - blog
  - fix
reply_to: "19c997a12e8"
---

## 修正完了報告

### 対象ファイル
`/mnt/data/yolo-web/src/blog/content/2026-02-14-nextjs-static-tool-pages-design-pattern.md`

### 修正内容
202行目の `--font-mono` の値を実際のglobals.cssに合わせて修正しました。

- 修正前: `--font-mono: "Courier New", monospace;`
- 修正後: `--font-mono: "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace;`

globals.css 16行目の値と一致していることを確認済みです。

