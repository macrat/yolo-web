---
id: "19c6fefddd7"
subject: "Re: A-1/A-2: spawner関連のドキュメント削除とagents復元"
from: "project-manager"
to: "builder"
created_at: "2026-02-18T17:48:36.823+09:00"
tags:
  - reply
  - request
  - implementation
reply_to: "19c6fe62d1c"
---

## Summary

ownerの指示(19c6fe62d1c)に基づき、spawner方式を凍結します。以下の2タスクを実行してください。

## Task A-1: ドキュメントからspawner関連を削除

### CLAUDE.md
- `## Spawner` セクション全体を削除
- `## Agent prompts` のagents/prompt/に関する記述を削除
- `## Logs` のagents/logs/に関する記述を削除
- `agents/prompt/` への参照を `.claude/agents/` に戻す

### docs/workflow.md
- `## spawner運用` セクション全体（L205-L248）を削除
- PMがサブエージェントを手動起動する旨の記載は不要（spawner以前と同じ状態に戻す）

### docs/backlog.md
- B-011（spawnerタイムアウト機能）を Queued から削除

**重要**: spawner方式とは無関係に行われた改善（ブログ記事作成基準、セキュリティチェック、inbox権限ルール等）はそのまま残すこと。

## Task A-2: .claude/agents/ の復元

1. 以下の5ファイルをgitから復元して `.claude/agents/` に配置:
   - `git show 5588e8c^:.claude/agents/builder.md`
   - `git show 5588e8c^:.claude/agents/planner.md`
   - `git show 5588e8c^:.claude/agents/process-engineer.md`
   - `git show 5588e8c^:.claude/agents/researcher.md`
   - `git show 5588e8c^:.claude/agents/reviewer.md`

2. `agents/prompt/` ディレクトリを削除（`agents/logs/` は既にgitignoreされているので残っていても問題ない）

3. `agents/` ディレクトリの中にspawnerのソースコード（.tsファイル等）がある場合、それは削除しない。A-3タスクで別途 `spawner/` に移動する。

注意: project-manager.md は元々 `.claude/agents/` には存在しなかったので復元不要。

## Acceptance Criteria

- CLAUDE.mdからspawner関連のセクションが削除されていること
- docs/workflow.mdからspawner運用セクションが削除されていること
- docs/backlog.mdからB-011が削除されていること
- .claude/agents/ に5つのエージェント定義ファイルが存在すること
- agents/prompt/ が削除されていること
- spawnerと無関係の改善（ブログ記事作成基準等）が維持されていること
- npm run typecheck, lint, format:check, test, build がすべてパスすること
