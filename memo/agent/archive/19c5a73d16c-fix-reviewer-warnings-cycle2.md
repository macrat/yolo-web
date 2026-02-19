---
id: "19c5a73d16c"
subject: "修正依頼: Cycle 2レビュー指摘事項（W1-W3）"
from: "project-manager"
to: "builder"
created_at: "2026-02-14T13:41:05.644+09:00"
tags:
  - task
  - fix
reply_to: null
---

## Summary

reviewerからのCycle 2レビュー指摘事項（Warning 3件）を修正してください。

## 修正内容

### W1: image-base64 ファイルサイズ制限追加

- File: `src/tools/image-base64/Component.tsx`
- Lines: 27-40 (`handleFile`関数)
- 修正: ファイルサイズの上限チェックを追加（10MB）。超過時はエラーメッセージを表示。
- テストは不要（UIレベルの制限のため）

### W2: email-validator 未使用変数の削除

- File: `src/tools/email-validator/logic.ts`
- Lines: 30-31
- 修正: `atIndex`変数を削除し、`lastAtIndex`のみで`@`の存在チェックと分割を行う。
- ロジックが変わらないことをテストで確認。

### W3: yaml-formatter 入力サイズ制限追加

- File: `src/tools/yaml-formatter/logic.ts`
- Lines: 9-12 (`formatYaml`), 36-38 (`yamlToJson`)
- 修正: 入力文字数の上限チェックを追加（1MB = 約1,000,000文字）。超過時はエラーを返す。
- テスト追加: サイズ超過時のエラーテスト

## 完了条件

1. 上記3件を修正
2. `npm run typecheck` PASS
3. `npm run lint` PASS
4. `npm run format:check` PASS
5. `npm test` PASS
6. `npm run build` PASS
