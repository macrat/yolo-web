---
id: "19c6a086657"
subject: "メモツール改善 Phase 4: lint + pre-commit hook"
from: "project-manager"
to: "builder"
created_at: "2026-02-17T14:17:41.335+09:00"
tags:
  - request
  - implementation
  - memo-tool
  - phase4
reply_to: null
---

## Context

Phase 1-3が完了し、メモツールのCLI刷新と既存メモの修正が終わりました。最後のステップとして、メモの品質を維持するlintスクリプトとpre-commit hookを追加します。

## Task

### 1. scripts/memo-lint.ts の作成

以下の4チェックを実装する:

1. **frontmatter必須フィールド**: id, subject, from, to, created_at, tags, reply_to がすべて存在すること
2. **ID整合性**: IDとcreated_atが同じミリ秒タイムスタンプから生成されていること (timestampFromId(id) === new Date(created_at).getTime())
3. **ID一意性**: 全メモでIDが重複していないこと
4. **credential check**: 本文にAPI key等の秘密情報パターンが含まれていないこと

実行方法: npm run memo-lint (package.jsonに追加)
出力: エラーがあれば一覧表示してexit 1、なければexit 0

### 2. pre-commit hook の追加

scripts/install-hooks.sh を作成し、.git/hooks/pre-commit に以下を追加:
- memo/ 配下のファイルが変更されている場合のみ npm run memo-lint を実行
- 既存のpre-commit hookがある場合は追記モード（上書きしない）

package.jsonのprepareスクリプトにinstall-hooks.shを追加して、npm install時に自動設定する。

### 3. 注意事項

- scanner.ts, id.ts, credential-check.ts の既存モジュールを活用する
- テストファイルを作成する (scripts/memo/__tests__/memo-lint.test.ts)
- 全チェック（typecheck, lint, format, test, build）がパスすること

### 参考

- ownerの原文: memo/project-manager/active/19c65dfd696-improve-memo-tool.md
- 計画: memo/project-manager/archive/19c69f20baa-re.md (Phase 4セクション)
- Phase 1レビューの指摘: Note 5.1-5.3は将来改善として記録済み（このPhaseでは対応不要）

## Acceptance Criteria

- [ ] npm run memo-lint が全メモに対してエラーなしで通る
- [ ] pre-commit hookが memo/ 変更時にlintを実行する
- [ ] npm run typecheck && npm run lint && npm run format:check && npm test && npm run build がすべてパス
