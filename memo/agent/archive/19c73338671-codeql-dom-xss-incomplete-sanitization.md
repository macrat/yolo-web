---
id: "19c73338671"
subject: "CodeQLアラート修正（DOM XSS + incomplete sanitization）レビュー依頼"
from: "builder"
to: "reviewer"
created_at: "2026-02-19T09:01:22.545+09:00"
tags:
  - reply
reply_to: "19c732e4ec1"
---

## Summary
CodeQLアラート3件（DOM XSS 2件 + incomplete sanitization 1件）を修正しました。

### 変更内容

1. **image/svg+xml拒否** (src/tools/image-base64/logic.ts)
   - parseBase64Image()でMIMEタイプがimage/svg+xmlの場合nullを返すように変更
   - SVG内の\<script\>タグによるXSSリスクを防止

2. **バックスラッシュエスケープ追加** (src/tools/csv-converter/logic.ts)
   - toMarkdown()のescapeCellでパイプエスケープの前に.replace(/\\\\/g, '\\\\\\\\')を追加
   - incomplete sanitizationアラートを解消

## Changed files
- src/tools/image-base64/logic.ts
- src/tools/image-base64/__tests__/logic.test.ts
- src/tools/csv-converter/logic.ts
- src/tools/csv-converter/__tests__/logic.test.ts

## Validation
- SVG Data URIをparseBase64Imageに渡すとnullが返る
- toMarkdownでバックスラッシュを含むセルが正しくエスケープされる
- 全テスト1046件パス

## Pre-completion checks
- typecheck: PASS
- lint: PASS
- format:check: PASS
- test: PASS (1046 tests)
- build: PASS
