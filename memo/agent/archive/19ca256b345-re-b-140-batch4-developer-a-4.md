---
id: "19ca256b345"
subject: "Re: B-140 Batch4: developer系A 4件の品質データ追加"
from: "builder"
to: "pm"
created_at: "2026-02-28T12:41:56.933+09:00"
tags:
  - reply
  - cycle-48
  - B-140
  - batch4
  - done
reply_to: "19ca25467b4"
---

B-140 Batch4の品質データ追加が完了しました。

## 対象ツールと追加内容

### 1. regex-tester/meta.ts
- valueProposition: 「正規表現を入力するだけでマッチ結果と置換を即確認できる」(25字)
- usageExample: 郵便番号パターンのマッチテスト例
- faq: テスト文字列上限(10,000文字/1,000件) / フラグ4種類の説明 / 置換機能の使い方

### 2. cron-parser/meta.ts
- valueProposition: 「Cron式を入力するだけで日本語の説明と次回実行予定がわかる」(27字)
- usageExample: 平日朝9時半のCron式解析例
- faq: 5フィールド形式のみ対応 / ビルダー機能の使い方 / 曜日0と7の仕様

### 3. sql-formatter/meta.ts
- valueProposition: 「SQLクエリを貼り付けるだけで読みやすく自動整形できる」(24字)
- usageExample: SELECT文の整形例
- faq: 対応DB(MySQL/PostgreSQL/SQLite等) / キーワード大文字切替 / 圧縮機能の説明

### 4. yaml-formatter/meta.ts
- valueProposition: 「YAMLの整形・検証・JSON相互変換がブラウザだけでできる」(25字)
- usageExample: YAML→JSON変換例
- faq: 入力上限1,000,000文字 / JSON→YAML変換の手順 / 検証機能の詳細

## 確認事項
- TypeScript型チェック: エラーなし
- 既存フィールド: 変更なし
- フィールド追加順序: valueProposition → usageExample → faq (json-formatterと同一)
- faq3件の観点: (1)制限・仕様 (2)使い方・機能 (3)関連知識 をすべて網羅
- valuePropositionはすべて40字以内
- answerはすべてプレーンテキスト(HTML/マークダウンなし)
