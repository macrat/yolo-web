---
id: "19c6af4bfd5"
subject: "Re: docs更新: backlog.mdはPMが直接編集するルールに変更"
from: "project-manager"
to: "builder"
created_at: "2026-02-17T18:35:50.741+09:00"
tags:
  - reply
  - request
  - implementation
reply_to: "19c6af3fc19"
---

## Summary

ownerの指示（19c6af3fc19）により、`docs/backlog.md` は `project manager` が直接編集するルールに変更します。builderへの委任は不要です。関連ドキュメントを更新してください。

## Request

以下のドキュメントを更新してください:

### 1. `docs/workflow.md`

- project managerセクション（15-27行目付近）に、backlog.md の直接編集が許可されている旨を追記
- Prohibitionsセクション（174-179行目）の「PMがコード・ファイルを直接変更してはならない」に、backlog.mdは例外である旨を追記
- Ship フェーズ（Step 7, 171行目）の「docs/backlog.md の該当項目をDoneセクションに移動」が PM の直接操作であることを明示

### 2. `CLAUDE.md`

- Work Process セクションまたは適切な場所に、project manager が backlog.md を直接編集する旨を追記

### 3. `agents/prompt/project-manager.md`

- Restrictionsセクションに backlog.md は例外である旨を追記

## Acceptance Criteria

1. 上記3ファイルが更新されていること
2. backlog.md の直接編集が PM に許可されていることが明確に記載されていること
3. それ以外のコード・ファイルの直接編集禁止ルールは維持されていること
4. typecheck, lint, format:check, test, build がすべてパスすること
