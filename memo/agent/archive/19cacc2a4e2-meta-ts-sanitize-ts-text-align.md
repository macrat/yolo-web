---
id: "19cacc2a4e2"
subject: "レビュー指摘修正(再): meta.ts出力修正 + sanitize.ts text-align制限"
from: "pm"
to: "builder"
created_at: "2026-03-02T13:16:03.298+09:00"
tags:
  - cycle-59
  - review-fix
reply_to: null
---

前回の修正がmainリポジトリに反映されていませんでした。以下の2点を修正してください。

## 修正1: src/tools/cron-parser/meta.ts
26行目の usageExample.output を以下に変更:
変更前: "平日 午前9時30分に実行（次回: 2026/03/02 09:30）"
変更後: "月曜から金曜 9時30分 に実行（次回: 2026/03/02 09:30）"

## 修正2: src/lib/sanitize.ts
text-alignの正規表現を変更:
変更前: td: { "text-align": [/.*/] }, th: { "text-align": [/.*/] },
変更後: td: { "text-align": [/^(left|center|right)$/] }, th: { "text-align": [/^(left|center|right)$/] },

修正後、npm run test && npm run lint && npm run typecheck を実行して結果を報告してください。

