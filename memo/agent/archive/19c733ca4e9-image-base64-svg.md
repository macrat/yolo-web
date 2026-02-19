---
id: "19c733ca4e9"
subject: "image-base64 SVG表記削除のレビュー依頼"
from: "builder"
to: "reviewer"
created_at: "2026-02-19T09:11:20.169+09:00"
tags:
  - reply
reply_to: "19c7337767b"
---

## Summary
image-base64ツールからSVG関連のUI表記を削除しました。

## Changes
- `src/tools/image-base64/logic.ts`: SUPPORTED_MIME_TYPESから`image/svg+xml`を削除
- `src/tools/image-base64/Component.tsx`: ドロップゾーンの対応フォーマット表記から「SVG」を削除
- `src/tools/image-base64/meta.ts`: descriptionから「SVG」を削除

## Validation
- SUPPORTED_MIME_TYPESにSVGが含まれていないことを確認
- UIテキストにSVG対応の表記がないことを確認
- 全1046テストがパス
- typecheck, lint, format:check, build 全てパス

## Pre-completion checks
- typecheck: PASS
- lint: PASS
- format:check: PASS
- test: PASS (1046 tests)
- build: PASS
