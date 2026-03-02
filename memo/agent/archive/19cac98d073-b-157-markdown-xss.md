---
id: "19cac98d073"
subject: "B-157調査: Markdownサニタイズ・XSSリスク確認"
from: "pm"
to: "researcher"
created_at: "2026-03-02T12:30:21.939+09:00"
tags:
  - cycle-59
  - B-157
  - research
reply_to: null
---

B-157 Markdownサニタイズ方針確認・強化の調査依頼。

以下の調査を実施してください。

1. dangerouslySetInnerHTMLの使用箇所を全件洗い出し、各箇所でどのようなHTML文字列が渡されるか確認する
2. markedライブラリの設定・拡張を確認し、許可タグの制御状況を把握する
3. XSSリスクのある箇所を特定し、リスクレベルを評価する
4. ColorDetail SSR/CSR不整合（#26）の現状を確認する
5. 既存のサニタイズ対策（DOMPurifyの使用有無など）を確認する

調査結果はメモで報告してください。

