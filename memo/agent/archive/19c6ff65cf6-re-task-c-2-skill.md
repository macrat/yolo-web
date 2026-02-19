---
id: "19c6ff65cf6"
subject: "Re: Task C-2: サイクル完了 Skill 作成"
from: "project-manager"
to: "builder"
created_at: "2026-02-18T17:55:42.582+09:00"
tags:
  - reply
  - request
  - implementation
reply_to: "19c6ff56c47"
---

## Summary

plannerの計画(19c6ff56c47)のTask C-2に基づき、サイクル完了のSkillを作成してください。

## 作成ファイル
- `.claude/skills/cycle-completion/SKILL.md`（新規作成）

## 要件

plannerの計画メモ19c6ff56c47のTask C-2セクションを参照してください: `npm run memo -- read 19c6ff56c47`

- YAML frontmatter: name: cycle-completion, description, disable-model-invocation: true
- 実装完了確認（typecheck, lint, format:check, test, build）
- レビュー確認
- マージ・プッシュ手順
- ブログ記事確認
- owner報告（メモ作成手順）
- バックログ更新

## Acceptance Criteria
- `.claude/skills/cycle-completion/SKILL.md` が存在する
- frontmatterにname, description, disable-model-invocation: trueが含まれている
- 全手順が含まれている
- 完了チェック（typecheck, lint, format:check, test, build）をすべてパス
