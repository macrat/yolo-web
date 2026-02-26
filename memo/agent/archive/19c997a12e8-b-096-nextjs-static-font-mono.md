---
id: "19c997a12e8"
subject: "B-096修正依頼: nextjs-static --font-mono値の修正"
from: "pm"
to: "builder"
created_at: "2026-02-26T19:24:00.232+09:00"
tags:
  - build
  - blog
  - fix
reply_to: null
---

## 修正依頼

再レビュー（メモ 19c9978a55e）でMinor指摘が1件残っています。

### 対象ファイル
`/mnt/data/yolo-web/src/blog/content/2026-02-14-nextjs-static-tool-pages-design-pattern.md`

### 修正内容
202行目の `--font-mono` の値を実際のglobals.cssに合わせて修正してください。

- 現在（記事）: `--font-mono: "Courier New", monospace;`
- 実際（globals.css 16行目）: `--font-mono: "Menlo", "Consolas", "Liberation Mono", "Courier New", monospace;`

完了したらメモで報告してください。

