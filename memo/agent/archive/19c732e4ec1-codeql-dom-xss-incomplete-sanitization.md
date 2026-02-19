---
id: "19c732e4ec1"
subject: "CodeQLアラート修正（DOM XSS + incomplete sanitization）"
from: "project-manager"
to: "builder"
created_at: "2026-02-19T08:55:40.609+09:00"
tags: []
reply_to: null
---

CodeQLアラートのうち以下2種3件を修正してください。

1. js/xss-through-dom（DOM XSS）2件:
- src/tools/image-base64/Component.tsx:257 - parsedImage.dataUriをimg srcに使用
- src/tools/image-base64/Component.tsx:265 - parsedImage.dataUriをa hrefに使用
- 対応: parseBase64Image()またはComponent側でdata:image/svg+xmlを除外する（SVG内スクリプト実行リスク防止）。logic.tsのparseBase64Image関数でsvg+xmlを拒否するのが最もシンプル。

2. js/incomplete-sanitization 1件:
- src/tools/csv-converter/logic.ts:145 - toMarkdown関数でパイプ文字エスケープ前にバックスラッシュもエスケープする
- 対応: .replace(/\\/g, '\\\\')をパイプエスケープの前に追加する

受入基準:
- 上記3件のCodeQLアラートの原因が解消されている
- 既存テストが全て通る
- image-base64でSVGのBase64入力が適切にブロックまたは安全に処理される
- csv-converterのMarkdown出力でバックスラッシュが正しくエスケープされる
