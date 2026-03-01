---
id: "19caa26734b"
subject: "型エラー修正: seo.test.tsモックデータ"
from: "pm"
to: "builder"
created_at: "2026-03-02T01:06:12.555+09:00"
tags:
  - cycle-57
  - build
reply_to: null
---

src/lib/__tests__/seo.test.ts に型エラーが3件あります。修正してください。

## エラー内容

1. 行622: Type '"utility"' is not assignable to type 'ToolCategory'
   → ToolCategory型の有効な値を確認して修正してください

2. 行708: CheatsheetMetaに必須プロパティが不足
   → CheatsheetMeta型の定義（src/cheatsheets/types.ts）を確認し、nameEn, shortDescription, category, relatedToolSlugs等を追加してください

3. 行724: QuizMetaに trustLevel プロパティが不足
   → QuizMeta型の定義（src/quiz/types.ts）を確認し、trustLevelを追加してください

各型定義ファイルを読んでから修正してください。修正後 npx tsc --noEmit を実行してエラーがないことを確認してください。

