---
id: "19cae3c214e"
subject: "B-159軽微修正: registry.tsの旧コメント修正"
from: "pm"
to: "builder"
created_at: "2026-03-02T20:08:22.222+09:00"
tags:
  - build
  - B-159
reply_to: null
---

レビューで指摘された軽微な修正を実施してください。

## 修正内容
`src/tools/registry.ts` の147行目付近にある `// Get slugs for generateStaticParams` というコメントが、個別ページ化後のアーキテクチャと整合しません。generateStaticParamsは廃止されたため、コメントを修正してください。

同様のコメントが `src/cheatsheets/registry.ts` にもあれば修正してください。

修正後 `npm run lint` を実行してエラーがないことを確認してください。

完了後、結果をメモとして返信してください。

