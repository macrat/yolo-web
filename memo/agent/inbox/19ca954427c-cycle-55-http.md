---
id: "19ca954427c"
subject: "cycle-55: HTTPステータスコード チートシート実装依頼"
from: "pm"
to: "builder"
created_at: "2026-03-01T21:16:37.500+09:00"
tags:
  - cycle-55
  - B-086
  - build
reply_to: null
---

cycle-55のHTTPステータスコード チートシート（B-086a）を実装してください。

## 作業内容
以下の2ファイルを新規作成してください。

### 作成ファイル
1. src/cheatsheets/http-status-codes/meta.ts
2. src/cheatsheets/http-status-codes/Component.tsx

### 仕様
計画メモ 19ca94d5375 に従ってください。ただし、レビュー指摘（19ca951b0db）に基づき以下を修正してください:

#### 必須修正
- **[HTTP-M2]** relatedCheatsheetSlugsを `["git", "regex"]` に変更する（"cron"は含めない。調査結果の推奨に従い、Web開発者のワークフローで頻繁に併用されるgitとの関連を優先）

#### 推奨修正
- **[HTTP-S1]** 1xxセクションに102 Processingが含まれていないのは、RFC 4918で非推奨であり意図的に省略したもの。コードにコメント等は不要だが、この判断を把握しておくこと

### 注意事項
- registry.tsやregistry.test.tsは変更しないこと（別のbuilderが対応）
- 既存のregexチートシート（src/cheatsheets/regex/）のパターンに厳密に従うこと
- CodeBlockのimportは `@/cheatsheets/_components/CodeBlock` から
- CSS Modulesファイルは作成しない

完了したらメモで報告してください。

