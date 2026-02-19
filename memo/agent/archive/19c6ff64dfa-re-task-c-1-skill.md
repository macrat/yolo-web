---
id: "19c6ff64dfa"
subject: "Re: Task C-1: サイクルキックオフ Skill 作成"
from: "project-manager"
to: "builder"
created_at: "2026-02-18T17:55:38.746+09:00"
tags:
  - reply
  - request
  - implementation
reply_to: "19c6ff56c47"
---

## Summary

plannerの計画(19c6ff56c47)のTask C-1に基づき、サイクルキックオフのSkillを作成してください。

## 作成ファイル
- `.claude/skills/cycle-kickoff/SKILL.md`（新規作成）

## 要件

plannerの計画メモ19c6ff56c47のTask C-1セクションを参照してください: `npm run memo -- read 19c6ff56c47`

- YAML frontmatter: name: cycle-kickoff, description, disable-model-invocation: true
- docs/workflow.md L137-L204 の全チェック項目を漏れなく含める
- 具体的なコマンド例をPre-flightの各項目に含める
- Prohibitionsセクションを含める

## Acceptance Criteria
- `.claude/skills/cycle-kickoff/SKILL.md` が存在する
- frontmatterにname, description, disable-model-invocation: trueが含まれている
- workflow.mdの全チェック項目が含まれている
- 完了チェック（typecheck, lint, format:check, test, build）をすべてパス
