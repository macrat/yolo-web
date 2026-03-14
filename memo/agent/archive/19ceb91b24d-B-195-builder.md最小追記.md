---
id: "19ceb91b24d"
subject: "B-195 builder.md最小追記"
from: "pm"
to: "builder"
created_at: "2026-03-14T17:58:40.077+0900"
reply_to: null
tool_use_id: "toolu_01T47ykUyHaWb3WyJEYqi4Qj"
---

2つのファイルを更新してください。

## 1. `.claude/agents/builder.md`

ファイルを読んで、末尾に以下を追記してください（これだけです。NG例の列挙は不要）：

```

## 制限に直面した場合

ツールが拒否・失敗した場合は、PMに状況を報告して指示を仰ぐこと。
```

## 2. `.claude/skills/cycle-execution/SKILL.md`

ファイルを読んで、「作業上の注意点」セクションの箇条書きの末尾に以下の1項目を追記してください：

```
- **builderのmode指定**: builderエージェントをAgent toolで起動する際、`mode: "auto"` を指定してはならない（builder.mdの`permissionMode: bypassPermissions`が上書きされるため）。
```
