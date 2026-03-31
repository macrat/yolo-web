---
title: Claude CodeサブエージェントからのMCPツール利用不可問題の調査
date: 2026-03-31
purpose: Claude Codeのカスタムサブエージェント定義（.claude/agents/*.md）でmcpServersフィールドを設定してもMCPツールにアクセスできない問題の原因・ワークアラウンド・修正状況の把握
method: |
  - GitHub Issues (anthropics/claude-code) の検索
  - 公式ドキュメント (code.claude.com/docs/en/sub-agents) の精読
  - コミュニティフォーラム・DEV Community等の検索
  - 検索クエリ: "claude code sub-agent mcp tools not available", "claude code subagent mcpServers", "background subagent mcp fix"
sources:
  - https://github.com/anthropics/claude-code/issues/13605
  - https://github.com/anthropics/claude-code/issues/13898
  - https://github.com/anthropics/claude-code/issues/13254
  - https://github.com/anthropics/claude-code/issues/14496
  - https://github.com/anthropics/claude-code/issues/21560
  - https://github.com/anthropics/claude-code/issues/19964
  - https://code.claude.com/docs/en/sub-agents
---

# Claude CodeサブエージェントからのMCPツール利用不可問題 調査レポート

## 調査の背景と目的

Claude Codeのカスタムサブエージェント定義ファイル（`.claude/agents/*.md`）において `mcpServers` フィールドを設定しても、サブエージェントからMCPツールにアクセスできないという問題が発生している。この問題は複数のパターンで再現し、公式ドキュメントの記述とも矛盾している。本レポートでは、GitHub Issues・公式ドキュメント・コミュニティ情報をもとに、この問題の全容を整理する。

---

## 1. 問題の分類：複数の独立したバグが存在する

調査の結果、「サブエージェントからMCPにアクセスできない」という現象は、実際には以下の**複数の独立したバグ**が複合していることが判明した。

### バグA：バックグラウンドサブエージェントのMCPアクセス不可（Issue #13254）

- **状態**: オープン（一度クローズ後に再発、再オープン）
- **影響バージョン**: v2.0.60で報告 → v2.0.61で修正 → v2.0.65で再発
- **症状**: `run_in_background: true` で実行されるサブエージェントでMCPツールが「利用不可」と報告される
- **原因**: バックグラウンドモードでのMCPツールの受け渡し処理に欠陥がある
- **公式ドキュメントの記述**: 「MCP tools are not available in background subagents」（ただしこの記述は別のドキュメントセクションとで矛盾を引き起こしている）

### バグB：カスタムプラグインサブエージェントのMCPアクセス不可（Issue #13605、#21560）

- **状態**: Issue #13605はクローズ（Completed）、しかし実質的には未修正（Issue #21560が2026年3月時点でもオープン）
- **影響バージョン**: v2.0.64（初報告）から v2.1.x（2026年3月）まで継続
- **症状**: プラグインの `agents/` ディレクトリに定義されたサブエージェントがMCPツールにアクセスできない。`general-purpose` などのビルトインエージェントは正常に動作する
- **重要**: **プラグイン定義のサブエージェントは `mcpServers`・`hooks`・`permissionMode` フィールドが意図的に無視される**（セキュリティ上の理由で。公式ドキュメントに明記）

### バグC：プロジェクトスコープMCPサーバーへのアクセス不可（Issue #13898）

- **状態**: オープン（2025年12月報告、2026年3月時点で未解決）
- **影響バージョン**: v2.0.68以降
- **症状**: `.claude/agents/` に定義したカスタムサブエージェントが、プロジェクトレベルの `.mcp.json` で設定されたMCPサーバーにアクセスできず、ハルシネーション（もっともらしい偽の結果）を返す

検証マトリクス（Issue #13898より）:

| サブエージェントタイプ        | MCPサーバーの場所                | 結果             |
| ----------------------------- | -------------------------------- | ---------------- |
| ビルトイン（general-purpose） | プロジェクト（.mcp.json）        | 正常動作         |
| ビルトイン（general-purpose） | グローバル（~/.claude/mcp.json） | 正常動作         |
| カスタム（.claude/agents/）   | プロジェクト（.mcp.json）        | ハルシネーション |
| カスタム（.claude/agents/）   | グローバル（~/.claude/mcp.json） | 正常動作         |

### バグD：複雑なプロンプトでMCPアクセスが失敗する（Issue #14496）

- **状態**: クローズ（#13890の重複扱い）
- **症状**: 単純なプロンプトではMCPツールにアクセスできるが、複数ステップの複雑なプロンプトではMCPツールが「利用不可」と報告される
- **再現条件**: 特にWindowsおよびHTTPストリーマブルトランスポートを使用するMCPサーバーで顕著

---

## 2. 公式ドキュメントと実際の動作の矛盾

Issue #19964では、公式ドキュメント内部での矛盾が正式に報告されている。

**ドキュメントの「Available tools」セクションでの記述**:

> "By default, subagents inherit all tools from the main conversation, including MCP tools."

**ドキュメントの「Run subagents in foreground or background」セクションでの記述**:

> "MCP tools are not available in background subagents."

この矛盾の問題点:

- Claude Codeはフォアグラウンド/バックグラウンドを**自動的に判断**して実行する
- 開発者が明示的に制御しない限り、MCPツールへのアクセスが非決定論的に失敗する可能性がある
- この Issue は2026年2月に「not planned（対応予定なし）」としてクローズされ、3月にロックされた

**注意事項**: 公式ドキュメントの現行バージョン（2026年3月時点）では、フォアグラウンド実行であればカスタムサブエージェントもMCPツールを継承できると記載されており、`mcpServers` フィールドの仕様も正式に記述されている。ただし実際の動作はバグにより異なる場合がある。

---

## 3. 重要な仕様：プラグインサブエージェントの制約

公式ドキュメントに明記されている重要な制約がある。

> "For security reasons, plugin subagents do not support the `hooks`, `mcpServers`, or `permissionMode` frontmatter fields. These fields are ignored when loading agents from a plugin."

つまり、`.claude/agents/` に置いたカスタムサブエージェントと、プラグインの `agents/` ディレクトリに置いたサブエージェントでは、`mcpServers` フィールドの扱いが**根本的に異なる**。

- **`.claude/agents/` （プロジェクト/ユーザースコープ）**: `mcpServers` フィールドはサポート済み（ただしバグあり）
- **プラグインの `agents/` ディレクトリ**: `mcpServers` フィールドは**セキュリティ上の理由で意図的に無視される**

---

## 4. 既知のワークアラウンド

### ワークアラウンド1：ビルトインの `general-purpose` エージェントを使用する（最も確実）

カスタムサブエージェントの代わりに `general-purpose` を使用し、プロンプトでMCPツールの使用を指示する。

```xml
<invoke name="Task">
  <parameter name="subagent_type">general-purpose</parameter>
  <parameter name="run_in_background">false</parameter>
  <parameter name="prompt">Use mcp__playwright tools to test...</parameter>
</invoke>
```

### ワークアラウンド2：MCPサーバーをグローバルスコープに移行する

プロジェクトレベルの `.mcp.json` ではなく、ユーザースコープに移行することで、カスタムサブエージェントからもアクセス可能になる。

```bash
claude mcp add my-server --scope user -- command arg1 arg2
```

これにより `~/.claude.json` に保存され、カスタムサブエージェントからアクセスできる。

### ワークアラウンド3：バックグラウンド実行を無効化する

`CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` を設定することで、すべてのサブエージェントをフォアグラウンドで実行させる。バックグラウンドでのMCPアクセス失敗を回避できる。

```bash
export CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1
```

### ワークアラウンド4：サブエージェント定義で `run_in_background: false` を明示する

サブエージェントの frontmatter で以下を設定する。

```yaml
---
name: my-agent
description: ...
background: false
---
```

または Task ツール呼び出し時に `run_in_background: false` を明示する。

### ワークアラウンド5：複雑なプロンプトを分割する（Issue #14496のワークアラウンド）

複雑なプロンプトを単純なプロンプトから始め、`resume` パラメータで続きを実行する。

```python
# ステップ1：単純なプロンプトでMCPセッションを確立
result1 = Task(prompt="Call mcp__server__start_session...", ...)

# ステップ2：resumeで複雑な処理を継続
result2 = Task(prompt="Now complete steps 2-4...", resume=agentId, ...)
```

### ワークアラウンド6：親セッションでMCPを実行して結果をサブエージェントに渡す

MCPツールの呼び出しを親セッション（メインのClaude Code）で行い、結果をサブエージェントに引数として渡す。

---

## 5. `mcpServers` フィールドの正式サポート状況

公式ドキュメント（2026年3月時点）によると、`mcpServers` フィールドは `.claude/agents/` スコープのサブエージェントで正式サポートされている。

仕様の要点:

- 各エントリは「既存のMCPサーバーへの名前参照」または「インライン定義」のどちらかを指定できる
- インライン定義は `.mcp.json` と同じスキーマ（`stdio`, `http`, `sse`, `ws`）を使用する
- サブエージェント開始時に接続され、終了時に切断される
- 文字列参照（名前参照）は親セッションの接続を共有する

```yaml
---
name: browser-tester
description: Tests features in a real browser using Playwright
mcpServers:
  # インライン定義：このサブエージェント専用
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  # 名前参照：既存の設定済みサーバーを再利用
  - github
---
```

**ただし**: 上記は仕様上の記述であり、実際にはバグのため動作しないケースが多数報告されている。

---

## 6. 関連GitHubイシューの一覧

| Issue番号 | タイトル                                                                                   | 状態                    | 重要度 |
| --------- | ------------------------------------------------------------------------------------------ | ----------------------- | ------ |
| #13254    | Background subagents cannot access MCP tools                                               | 再オープン              | 高     |
| #13605    | Custom plugin subagents cannot access MCP tools                                            | クローズ（実質未解決）  | 高     |
| #13898    | Custom Subagents Cannot Access Project-Scoped MCP Servers                                  | オープン                | 高     |
| #14496    | Task tool subagents fail to access MCP tools with complex prompts                          | クローズ（重複）        | 中     |
| #19964    | Contradictory information regarding MCP tool availability in Subagents（ドキュメント矛盾） | クローズ（not planned） | 中     |
| #21560    | Plugin-defined subagents cannot access MCP tools                                           | オープン（stale）       | 高     |
| #2169     | MCP resources not available for subagents                                                  | 記録なし                | 中     |
| #15215    | Project-level MCP servers not loading in Claude Code runtime (v2.0.76)                     | 記録なし                | 中     |

---

## 7. 最近のバージョンでの関連修正

### v2.1.83（2026年3月25日）

- バックグラウンドサブエージェントがコンテキスト圧縮後に「見えなくなる」バグを修正
- MCP tool/resource キャッシュリークの修正（再接続時）

### v2.1.78（2026年3月17日）

- `deny: ["mcp__servername"]` パーミッションルールがMCPサーバーツールを正しく除去しない問題を修正

MCPとサブエージェントの根本的な統合問題（バグC・バグD）は2026年3月時点で未修正。

---

## 8. プロジェクトへの影響と推奨事項

本プロジェクト（yolos.net）では CLAUDE.md に「Use foreground sub-agent for MCP tools: When you request sub-agents to use MCP tools, Google Analytics or Playwright, always use foreground sub-agents. Do not use background mode.」というルールが既に定義されている。このルールはバグAへの正しい対応策であり、継続して遵守すべきである。

**追加推奨事項**:

1. **カスタムサブエージェントでMCPツールを使う場合は `general-purpose` を使用する**: カスタム定義サブエージェントのMCPアクセスはバグが多く信頼性が低い。ビルトインの `general-purpose` にプロンプトでMCPツール名を指示する方が安定している

2. **MCPサーバーはユーザースコープで設定する**: プロジェクトスコープ（`.mcp.json`）ではなくユーザースコープ（`--scope user`）に登録することで、カスタムサブエージェントからもアクセスできる可能性が高まる

3. **インライン `mcpServers` 定義は現時点では期待通りに動作しない可能性が高い**: 公式ドキュメントには記載があるが、実際の動作はバグにより不安定。使用する場合は十分なテストが必要

4. **プラグインの `agents/` ディレクトリにはMCP設定を書かない**: セキュリティ上の理由で意図的に無視される仕様であるため、.claude/agents/ に定義するか、ビルトインエージェントを使用する

---

## 参考情報源

- [Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Issue #13605: Custom plugin subagents cannot access MCP tools](https://github.com/anthropics/claude-code/issues/13605)
- [Issue #13898: Custom Subagents Cannot Access Project-Scoped MCP Servers](https://github.com/anthropics/claude-code/issues/13898)
- [Issue #13254: Background subagents cannot access MCP tools](https://github.com/anthropics/claude-code/issues/13254)
- [Issue #14496: Task tool subagents fail to access MCP tools with complex prompts](https://github.com/anthropics/claude-code/issues/14496)
- [Issue #19964: Contradictory information regarding MCP tool availability in Subagents](https://github.com/anthropics/claude-code/issues/19964)
- [Issue #21560: Plugin-defined subagents cannot access MCP tools](https://github.com/anthropics/claude-code/issues/21560)
- [Claude Code Changelog 2026 - claudefa.st](https://claudefa.st/blog/guide/changelog)
