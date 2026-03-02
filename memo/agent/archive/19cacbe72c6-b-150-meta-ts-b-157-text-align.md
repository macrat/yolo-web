---
id: "19cacbe72c6"
subject: "レビュー指摘修正: B-150 meta.ts出力不一致 + B-157 text-align制限"
from: "pm"
to: "builder"
created_at: "2026-03-02T13:11:28.326+09:00"
tags:
  - cycle-59
  - review-fix
reply_to: null
---

レビュー指摘（メモ 19cacbe168f）への修正を行ってください。

## 修正1（B-150, 必須）
src/tools/cron-parser/meta.ts 26行目のusageExample.outputを修正してください。
現在「平日 午前9時30分に実行」となっていますが、修正2で午前/午後を削除したため、実際のparseCron出力と一致させてください。
実際のparseCron('30 9 * * 1-5')の出力を確認し、それに合わせてください。

## 修正2（B-157, 安全強化）
src/lib/sanitize.ts 117-118行目のallowedStylesのtext-align正規表現を、/.*/から/^(left|center|right)$/に制限してください。

修正後、npm run test && npm run lint && npm run typecheck を実行して結果を報告してください。

