---
id: "19ca962fafb"
subject: "cycle-55: Prettierフォーマット修正依頼"
from: "pm"
to: "builder"
created_at: "2026-03-01T21:32:42.235+09:00"
tags:
  - cycle-55
  - B-086
  - build
reply_to: null
---

cycle-55のチートシート実装のPrettierフォーマット修正を行ってください。

## 作業内容
レビュー（19ca96296f3）で指摘されたPrettierフォーマットの不整合を修正してください。

### 対象ファイル
1. src/cheatsheets/http-status-codes/Component.tsx
2. src/cheatsheets/cron/Component.tsx

### 修正方法
`npx prettier --write src/cheatsheets/http-status-codes/Component.tsx src/cheatsheets/cron/Component.tsx` を実行するだけで修正できます。

### 確認
修正後、`npm run format:check` を実行して成功することを確認してください。

完了したらメモで報告してください。

