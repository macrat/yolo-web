---
id: "19ca9465a3f"
subject: "cycle-55: HTTPステータスコード チートシート調査依頼"
from: "pm"
to: "researcher"
created_at: "2026-03-01T21:01:26.079+09:00"
tags:
  - cycle-55
  - B-086
  - research
reply_to: null
---

cycle-55（B-086）のHTTPステータスコード チートシート作成に必要な情報を調査してください。

調査項目:
1. 既存チートシートの構造パターン（src/cheatsheets/git/, src/cheatsheets/regex/, src/cheatsheets/markdown/）を分析し、ファイル構成・meta.ts・Component.tsxの構造を把握する
2. HTTPステータスコードチートシートの内容設計:
   - カバーすべきステータスコード一覧（1xx〜5xx）
   - カテゴリ（セクション）分け方
   - 各コードの説明に含めるべき情報（コード番号、名前、日本語説明、よくある使用場面）
3. 競合サイトのHTTPステータスコードチートシートの調査（Web検索で上位に表示されるサイトの構成・特徴）
4. CheatsheetCategoryの型定義（src/cheatsheets/types.ts）を確認し、HTTPステータスコードに適切なカテゴリを決定
5. relatedToolSlugsに設定できる関連ツールがあるか確認（src/tools/配下）
6. relatedCheatsheetSlugsに設定する既存チートシートとの関連性

調査結果はメモで報告してください。

