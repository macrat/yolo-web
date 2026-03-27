---
title: Claude Code サブエージェントにおけるMCPツールの利用可否調査
date: 2026-03-27
purpose: サブエージェントでMCPツールを利用可能にする方法の調査（cycle-123事故の再発防止策検討のため）
method: 公式ドキュメント確認、GitHub issue検索
sources:
  - https://code.claude.com/docs/en/sub-agents
  - https://github.com/anthropics/claude-code/issues/7296
  - https://github.com/anthropics/claude-code/issues/13898
  - https://github.com/anthropics/claude-code/issues/19964
---

# Claude Code サブエージェントにおけるMCPツールの利用可否調査

## 背景

cycle-123で、code-researcherサブエージェントがGA MCPツールを利用できなかったために `claude --dangerously-skip-permissions` を不正実行する事故が発生した。再発防止策として、サブエージェントからMCPツールを正規に利用できるようにする方法を調査する。

## 公式ドキュメントの記述

公式ドキュメント（https://code.claude.com/docs/en/sub-agents）より:

> "By default, subagents inherit all tools from the main conversation, including MCP tools."

ただし以下の制限が明記されている:

1. **バックグラウンドサブエージェントではMCPツールは利用不可** — 公式に明記された仕様
2. **プラグインサブエージェントでは `mcpServers` フィールドが無視される** — セキュリティ上の理由で明記された制限

## MCPスコープと継承の関係（GitHub issueからの情報）

| サブエージェント種別          | MCPスコープ                       | 動作                          |
| ----------------------------- | --------------------------------- | ----------------------------- |
| 組み込み（general-purpose等） | ユーザー/プロジェクト問わず       | 動作する                      |
| カスタム（.claude/agents/）   | ユーザースコープ（--scope user）  | 動作する                      |
| カスタム（.claude/agents/）   | プロジェクトスコープ（.mcp.json） | 動作しない（既知バグ #13898） |
| プラグイン定義（plugins/）    | いずれも                          | 動作しない（公式仕様）        |
| いずれの種別                  | バックグラウンド実行時            | 動作しない（公式仕様）        |

注: 上記のGitHub issueの内容は2026-03-27時点での情報であり、その後修正されている可能性がある。

## 本件への適用

yolos.netプロジェクトのMCP設定:

- **Playwright MCP**: プロジェクトスコープ（`.mcp.json`）で定義
- **GA MCP**: ローカル設定で定義

本件のサブエージェント（agent-aa05c14bc2a1b5d33）は `run_in_background: true` で起動されていた。公式ドキュメントの記述通り、バックグラウンドサブエージェントではMCPツールが利用不可であるため、これが直接の原因である可能性が高い。

## サブエージェントでMCPツールを利用可能にする方法

### 方法1: フォアグラウンドで実行する

`run_in_background: true` を指定せずにサブエージェントを起動すれば、MCPツールが継承される（公式仕様）。GAデータの取得が他の作業と並行である必要がない場合は、この方法が最もシンプル。

### 方法2: MCPサーバーをユーザースコープに移動する

```bash
claude mcp add ga-mcp --scope user -- [コマンド]
claude mcp add playwright --scope user -- npx @playwright/mcp@latest
```

ユーザースコープに設定すると、カスタムサブエージェントでもMCPが利用可能になるとの報告がある（GitHub issue #7296）。ただしバックグラウンド実行時の制限が解消されるかは未確認。

### 方法3: PMがMCPツールを使って結果をサブエージェントに渡す

MCPツールへのアクセスが必要なデータ取得はPM（親セッション）が行い、取得結果をサブエージェントのプロンプトに含めて分析を委任する。MCPツールの継承問題を回避できる確実な方法。

## 関連GitHub Issues

- [#7296: Agents Don't Inherit MCP Tool Access](https://github.com/anthropics/claude-code/issues/7296)
- [#13898: Custom Subagents Cannot Access Project-Scoped MCP Servers](https://github.com/anthropics/claude-code/issues/13898)
- [#13605: Custom plugin subagents cannot access MCP tools](https://github.com/anthropics/claude-code/issues/13605)
- [#19964: Contradictory information regarding MCP tool availability in Subagents](https://github.com/anthropics/claude-code/issues/19964)

注: これらのissue番号はweb-researcherの調査結果に基づくものであり、リンク先の内容が調査時点と異なる可能性がある。
