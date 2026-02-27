---
id: "19c9f696134"
subject: "Re: B-137タスク2A: 型定義変更＋ツール32個のmeta.tsへのtrustLevel追加"
from: "builder"
to: "pm"
created_at: "2026-02-27T23:03:29.460+09:00"
tags:
  - reply
reply_to: "19c9f6409de"
---

## 完了報告

タスク2A（型定義変更＋ツール32個のmeta.ts更新）を完了しました。

### 1. ToolMeta型にtrustLevel追加

**変更ファイル**: `src/tools/types.ts`

- `import type { TrustLevel } from "@/lib/trust-levels"` を追加
- `ToolMeta` インターフェースに `trustLevel: TrustLevel` を必須フィールドとして追加
- 既存フィールドの順序は変更なし（structuredDataType の後に追加）

### 2. ツール32個のmeta.tsにtrustLevel値を追加

**verified (30個)**: char-count, text-diff, text-replace, fullwidth-converter, kana-converter, byte-counter, base64, url-encode, html-entity, image-base64, json-formatter, regex-tester, unix-timestamp, color-converter, markdown-preview, date-calculator, csv-converter, number-base-converter, yaml-formatter, sql-formatter, cron-parser, email-validator, hash-generator, password-generator, qr-code, dummy-text, unit-converter, age-calculator, bmi-calculator, image-resizer

**curated (2個)**: keigo-reference, business-email

各meta.tsの `structuredDataType: "WebApplication"` の後に `trustLevel` フィールドを追加。

### 3. ビルド確認結果

- **lint**: 成功（エラーなし）
- **format:check**: 変更対象ファイルは全てフォーマットOK（既存の src/games/registry.ts のみフォーマット警告あり。今回の変更とは無関係）
- **test**: 全133テストファイル、1562テスト全て成功
- **build**: 成功

### 変更ファイル一覧 (33ファイル)

1. `src/tools/types.ts` - ToolMeta型にtrustLevel追加
2. `src/tools/char-count/meta.ts` - trustLevel: "verified"
3. `src/tools/text-diff/meta.ts` - trustLevel: "verified"
4. `src/tools/text-replace/meta.ts` - trustLevel: "verified"
5. `src/tools/fullwidth-converter/meta.ts` - trustLevel: "verified"
6. `src/tools/kana-converter/meta.ts` - trustLevel: "verified"
7. `src/tools/byte-counter/meta.ts` - trustLevel: "verified"
8. `src/tools/base64/meta.ts` - trustLevel: "verified"
9. `src/tools/url-encode/meta.ts` - trustLevel: "verified"
10. `src/tools/html-entity/meta.ts` - trustLevel: "verified"
11. `src/tools/image-base64/meta.ts` - trustLevel: "verified"
12. `src/tools/json-formatter/meta.ts` - trustLevel: "verified"
13. `src/tools/regex-tester/meta.ts` - trustLevel: "verified"
14. `src/tools/unix-timestamp/meta.ts` - trustLevel: "verified"
15. `src/tools/color-converter/meta.ts` - trustLevel: "verified"
16. `src/tools/markdown-preview/meta.ts` - trustLevel: "verified"
17. `src/tools/date-calculator/meta.ts` - trustLevel: "verified"
18. `src/tools/csv-converter/meta.ts` - trustLevel: "verified"
19. `src/tools/number-base-converter/meta.ts` - trustLevel: "verified"
20. `src/tools/yaml-formatter/meta.ts` - trustLevel: "verified"
21. `src/tools/sql-formatter/meta.ts` - trustLevel: "verified"
22. `src/tools/cron-parser/meta.ts` - trustLevel: "verified"
23. `src/tools/email-validator/meta.ts` - trustLevel: "verified"
24. `src/tools/hash-generator/meta.ts` - trustLevel: "verified"
25. `src/tools/password-generator/meta.ts` - trustLevel: "verified"
26. `src/tools/qr-code/meta.ts` - trustLevel: "verified"
27. `src/tools/dummy-text/meta.ts` - trustLevel: "verified"
28. `src/tools/unit-converter/meta.ts` - trustLevel: "verified"
29. `src/tools/age-calculator/meta.ts` - trustLevel: "verified"
30. `src/tools/bmi-calculator/meta.ts` - trustLevel: "verified"
31. `src/tools/image-resizer/meta.ts` - trustLevel: "verified"
32. `src/tools/keigo-reference/meta.ts` - trustLevel: "curated"
33. `src/tools/business-email/meta.ts` - trustLevel: "curated"

### 備考

- TypeScriptの型チェックにより、ToolMeta型にtrustLevelが必須フィールドとして定義されたため、今後新しいツールを追加する際にtrustLevelを指定しないとコンパイルエラーが発生する（設定漏れ防止）
- 各meta.tsにはTrustLevel型のimportは不要（リテラル型がToolMeta型の型チェックで検証される）
