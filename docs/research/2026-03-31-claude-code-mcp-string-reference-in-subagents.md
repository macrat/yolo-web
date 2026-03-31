---
title: Claude Code サブエージェント mcpServers 文字列参照の詳細調査
date: 2026-03-31
purpose: サブエージェント定義のmcpServersフィールドにおける文字列参照（string reference）が何を参照するか、前提条件、toolsフィールドとの関係を明確にする
method: |
  公式ドキュメント直接取得（WebFetch）
  - https://code.claude.com/docs/en/sub-agents
  - https://code.claude.com/docs/en/mcp
  - https://code.claude.com/docs/en/settings
  過去のリサーチレポート参照（2026-03-27-mcp-subagent-availability.md）
sources:
  - https://code.claude.com/docs/en/sub-agents
  - https://code.claude.com/docs/en/mcp
  - https://code.claude.com/docs/en/settings
---

# Claude Code サブエージェント mcpServers 文字列参照の詳細調査

## 調査の背景

前回の調査（2026-03-27）では、サブエージェントにおけるMCPツールの利用可否の概要を把握した。今回はさらに踏み込み、サブエージェント定義ファイル（`.claude/agents/*.md`）の `mcpServers` フィールドにおける**文字列参照**（string reference）が具体的に何を参照するのか、その前提条件、および `tools` フィールドとの関係を公式ドキュメントから詳しく調査した。

## 公式ドキュメントの記述（2026-03-31時点）

### mcpServers フィールドの基本説明

公式ドキュメント（sub-agents）のフロントマターフィールド一覧には、以下の記述がある：

> `mcpServers` — MCP servers available to this subagent. Each entry is either a server name referencing an already-configured server (e.g., `"slack"`) or an inline definition with the server name as key and a full MCP server config as value

つまり、各エントリは以下の2種類のいずれか：

1. **文字列参照（string reference）**: 既に設定済みのサーバー名を文字列で指定（例: `"slack"`, `"github"`）
2. **インライン定義（inline definition）**: サーバー名をキーとして、完全なMCPサーバー設定をオブジェクトで記述

### 文字列参照が参照する設定

「already-configured server（既に設定済みのサーバー）」とは、**現在のセッション**で利用可能なMCPサーバーを指す。公式ドキュメントはさらに詳しく以下のように説明している：

> "Inline servers defined here are connected when the subagent starts and disconnected when it finishes. **String references share the parent session's connection.**"

つまり文字列参照の場合、サブエージェントは**親セッションが既に確立している接続を共有する**。

#### 親セッションで利用可能なMCPサーバーの設定場所

公式のSettings/MCP設定ドキュメントによると、MCPサーバーは以下の場所に設定される：

| スコープ     | 設定場所                                   | 説明                                                             |
| ------------ | ------------------------------------------ | ---------------------------------------------------------------- |
| User / Local | `~/.claude.json`                           | ユーザー全プロジェクト共通、またはプロジェクト固有のローカル設定 |
| Project      | `.mcp.json`（プロジェクトルート）          | バージョン管理対象のプロジェクト共有設定                         |
| Managed      | `managed-mcp.json`（システムディレクトリ） | 管理者が展開するエンタープライズ設定                             |

すなわち、文字列参照が機能するためには、参照したいMCPサーバーがこれらいずれかの場所に設定されており、**セッション開始時に親セッションがそのサーバーに接続済みである必要がある**。

### 文字列参照とインライン定義の動作の違い

| 種別           | 接続タイミング                                   | 切断タイミング                     | 接続共有           |
| -------------- | ------------------------------------------------ | ---------------------------------- | ------------------ |
| 文字列参照     | 親セッションの接続をそのまま共有（新規接続なし） | 親セッションの接続が切れるまで維持 | 親セッションと共有 |
| インライン定義 | サブエージェント起動時に新規接続                 | サブエージェント終了時に切断       | 独立した接続       |

### 文字列参照の使用例

```yaml
---
name: browser-tester
description: Tests features in a real browser using Playwright
mcpServers:
  # インライン定義: このサブエージェント専用の接続
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  # 文字列参照: 親セッションの既存接続を共有
  - github
---
```

この例では、`github` は親セッションで既に設定・接続済みのGitHub MCPサーバーを参照する。

### インライン定義のスキーマ

インライン定義は `.mcp.json` のサーバーエントリと同じスキーマ（`stdio`、`http`、`sse`、`ws`）に従い、サーバー名をキーとする。

```yaml
mcpServers:
  - my-server:
      type: stdio
      command: npx
      args: ["-y", "my-mcp-package"]
  - remote-server:
      type: http
      url: https://api.example.com/mcp
      headers:
        Authorization: Bearer ${API_KEY}
```

## 文字列参照が機能するための前提条件

1. **親セッションへの接続が必要**: 参照するMCPサーバー名が、親セッション（メイン会話）で設定・接続済みであること
2. **設定場所**: サーバーは以下いずれかに設定されていること
   - `~/.claude.json`（ユーザー/ローカルスコープ）
   - `.mcp.json`（プロジェクトスコープ、要承認）
   - `managed-mcp.json`（マネージドスコープ）
3. **プロジェクトスコープの場合は承認が必要**: `.mcp.json` で定義されたプロジェクトスコープのサーバーは、セキュリティ上の理由から使用前にユーザーの承認が必要
4. **フォアグラウンド実行が必要（MCPツール利用時）**: バックグラウンドサブエージェントでは、先行承認されたツールのみが利用可能。MCPツールは事前承認の対象外となる場合があるため、MCPを使用するサブエージェントはフォアグラウンドで実行するべき

## toolsフィールドとmcpServersの関係

### デフォルトの挙動

`tools` フィールドを省略した場合、サブエージェントはメイン会話の全ツールを継承する（MCPツールを含む）：

> "By default, subagents inherit all tools from the main conversation, including MCP tools."

### tools フィールドでMCPツールを制限する場合

`tools` フィールドでツールの許可リストを明示した場合、リストに含まれないMCPツールは使用不可になる。MCPツールを明示するには、`mcp__<サーバー名>__<ツール名>` の形式を使用する（ドキュメントの権限設定リファレンス参照）。

```yaml
# 例: 特定のMCPツールのみ許可
tools: Read, Grep, Glob, mcp__github__create_issue
```

### mcpServers でスコープを絞る活用法

`mcpServers` フィールドはツールアクセスを絞るだけでなく、**コンテキストの肥大化を防ぐ**目的にも有効：

> "To keep an MCP server out of the main conversation entirely and avoid its tool descriptions consuming context there, define it inline here rather than in `.mcp.json`. The subagent gets the tools; the parent conversation does not."

つまり、メイン会話にMCPツールの説明をロードさせたくない場合、`.mcp.json` ではなくサブエージェントの `mcpServers` のインライン定義にのみ記述することで、メイン会話のコンテキストを節約できる。

## 前回調査（2026-03-27）の内容との照合

前回の調査で特定された「プロジェクトスコープのMCPサーバーがカスタムサブエージェントで動作しない問題（GitHub issue #13898）」については、今回確認した公式ドキュメント（2026-03-31時点）において明示的な言及はなかった。公式ドキュメント上は文字列参照が機能するための要件として「親セッションの接続が必要」とのみ記述されており、スコープ別の既知バグについての記述は確認できなかった。

ただし、バグが修正されているかどうかは公式ドキュメントだけでは確認できないため、実際の動作確認が推奨される。

## まとめ

| 調査項目                                 | 結論                                                                                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 文字列参照が参照する設定                 | **親セッションで既に設定・接続済みのMCPサーバー**（`~/.claude.json` または `.mcp.json` または `managed-mcp.json` で設定されたサーバー） |
| 文字列参照の接続方式                     | 親セッションの接続を共有（新規接続は作らない）                                                                                          |
| インライン定義の接続方式                 | サブエージェント起動時に新規接続、終了時に切断                                                                                          |
| 文字列参照の前提条件                     | ① 親セッションでサーバーが設定済み ② セッション開始時に接続済み ③ プロジェクトスコープの場合はユーザー承認済み                          |
| toolsフィールドにMCPツールの明示は必要か | tools省略時は不要（全MCPツールを継承）。toolsで許可リストを指定した場合は明示が必要                                                     |
| コンテキスト節約の活用                   | インライン定義のみに書くことで、メイン会話のコンテキストを節約可能                                                                      |
