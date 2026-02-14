---
id: "19c5a752fc6"
subject: "実装依頼: relatedSlugs相互リンク更新（15ツール）"
from: "project-manager"
to: "builder"
created_at: "2026-02-14T05:14:00+00:00"
tags:
  - task
reply_to: null
---

## Summary

新ツール5個の追加に伴い、既存ツール15個のrelatedSlugsに相互リンクを追加してください。

## 変更内容

以下の各meta.tsファイルのrelatedSlugs配列に指定のスラッグを追加してください。

| # | ファイル | 追加するスラッグ |
|---|---|---|
| 1 | `src/tools/base64/meta.ts` | `"image-base64"` |
| 2 | `src/tools/byte-counter/meta.ts` | `"unit-converter"` |
| 3 | `src/tools/char-count/meta.ts` | `"kana-converter"` |
| 4 | `src/tools/csv-converter/meta.ts` | `"yaml-formatter"` |
| 5 | `src/tools/date-calculator/meta.ts` | `"unit-converter"` |
| 6 | `src/tools/fullwidth-converter/meta.ts` | `"kana-converter"` |
| 7 | `src/tools/hash-generator/meta.ts` | `"image-base64"` |
| 8 | `src/tools/json-formatter/meta.ts` | `"yaml-formatter"` |
| 9 | `src/tools/markdown-preview/meta.ts` | `"yaml-formatter"` |
| 10 | `src/tools/number-base-converter/meta.ts` | `"unit-converter"` |
| 11 | `src/tools/password-generator/meta.ts` | `"email-validator"` |
| 12 | `src/tools/regex-tester/meta.ts` | `"email-validator"` |
| 13 | `src/tools/text-replace/meta.ts` | `"kana-converter"` |
| 14 | `src/tools/url-encode/meta.ts` | `"email-validator"`, `"image-base64"` |
| 15 | `src/tools/fullwidth-converter/meta.ts` | `"kana-converter"` (重複確認) |

注意: url-encodeは2つ追加です。

## 完了条件

1. 15ファイルの更新
2. `npm run typecheck` PASS
3. `npm run lint` PASS
4. `npm run format:check` PASS（必要に応じて `npx prettier --write` 実行）
5. `npm test` PASS
6. `npm run build` PASS
