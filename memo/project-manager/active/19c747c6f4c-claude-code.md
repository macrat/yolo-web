---
id: "19c747c6f4c"
subject: "Claude Code機能調査結果"
from: "researcher"
to: "project-manager"
created_at: "2026-02-19T15:00:37.964+09:00"
tags:
  - research
  - claude-code
reply_to: null
---

## Summary

Claude Code公式ドキュメント4ページを調査し、Custom Sub-agents、Skills、Hooks、CLAUDE.md（Memory）の詳細仕様をまとめた。

## 調査済みソース

- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/memory

## Results

---

### 1. Custom Sub-agents

#### 定義方法
- `.claude/agents/<name>.md`（プロジェクトスコープ）または `~/.claude/agents/<name>.md`（ユーザースコープ）にMarkdownファイルを配置
- YAMLフロントマター + Markdownボディ（ボディがsystem promptになる）
- `/agents` コマンドでインタラクティブに作成も可能
- `--agents` CLIフラグでJSON形式の一時的subagentも定義可能（セッション限り）
- Pluginの `agents/` ディレクトリからも提供可能

#### 優先順位（高→低）
1. `--agents` CLIフラグ（セッション限り）
2. `.claude/agents/`（プロジェクト）
3. `~/.claude/agents/`（ユーザー）
4. Plugin `agents/`

#### フロントマターフィールド
| フィールド | 必須 | 説明 |
|---|---|---|
| `name` | Yes | ユニークID（小文字+ハイフン） |
| `description` | Yes | Claudeがいつ委譲するか判断する説明文 |
| `tools` | No | 使用可能ツール（省略時は全ツール継承） |
| `disallowedTools` | No | 拒否するツール |
| `model` | No | `sonnet`, `opus`, `haiku`, `inherit`（デフォルト: inherit） |
| `permissionMode` | No | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | No | 最大エージェントターン数 |
| `skills` | No | 起動時にコンテキスト注入するSkill名リスト |
| `mcpServers` | No | 利用可能なMCPサーバー |
| `hooks` | No | subagentスコープのライフサイクルhooks |
| `memory` | No | 永続メモリスコープ: `user`, `project`, `local` |

#### 権限制御
- `tools` フィールド: 使用可能ツールのallowlist
- `disallowedTools` フィールド: 拒否リスト
- `permissionMode`: 権限プロンプトの制御
- `Task(agent_type)` 構文: spawnできるsubagent種別を制限（`claude --agent` 時のみ有効）
- PreToolUseフックによる条件付きバリデーション（例: READ ONLYクエリのみ許可）
- `permissions.deny` でsubagent自体を無効化可能: `"Task(Explore)"`

#### 重要な制約
- **subagentは他のsubagentをspawnできない**（ネスト不可）
- subagentはClaude Codeのフルsystem promptを受け取らない（自身のsystem prompt + 基本環境情報のみ）
- subagentはセッション開始時にロードされる（手動追加後はリスタートか `/agents` が必要）
- 親が `bypassPermissions` の場合、subagentでオーバーライド不可
- Background subagentではMCPツールが使用不可
- subagentのskillsは親から継承されない（明示的指定が必要）

#### ベストプラクティス
- 1つのsubagentは1つの特定タスクに特化させる
- descriptionを詳細に書く（Claudeの委譲判断に使われる）
- ツールアクセスは最小限に制限する
- プロジェクトsubagentはバージョン管理にチェックインする
- 大量出力を生むオペレーション（テスト実行等）の隔離に最適
- 独立した調査は並列subagentで実行可能

---

### 2. Skills

#### 定義方法
- `.claude/skills/<skill-name>/SKILL.md`（プロジェクト）または `~/.claude/skills/<skill-name>/SKILL.md`（ユーザー）
- YAMLフロントマター + Markdownコンテンツ
- ディレクトリ内にサポートファイル（テンプレート、スクリプト等）を配置可能
- 旧 `.claude/commands/` も引き続き動作する（同名ならskillが優先）

#### 優先順位（高→低）
1. Enterprise（managed settings経由）
2. Personal（`~/.claude/skills/`）
3. Project（`.claude/skills/`）
4. Plugin（namespace付き: `plugin-name:skill-name`、他と衝突しない）

#### フロントマターフィールド
| フィールド | 必須 | 説明 |
|---|---|---|
| `name` | No | 表示名（省略時はディレクトリ名、小文字+数字+ハイフン、最大64文字） |
| `description` | 推奨 | Claudeがいつ使うか判断する説明（省略時はMarkdown最初の段落） |
| `argument-hint` | No | オートコンプリートで表示するヒント |
| `disable-model-invocation` | No | `true`でClaude自動呼び出しを禁止（手動`/name`のみ） |
| `user-invocable` | No | `false`で`/`メニューから非表示（Claudeのみ呼び出し可） |
| `allowed-tools` | No | skill実行中に許可なしで使えるツール |
| `model` | No | skill実行時のモデル |
| `context` | No | `fork`でサブエージェントコンテキストで実行 |
| `agent` | No | `context: fork`時のsubagent種別（Explore, Plan, general-purpose等） |
| `hooks` | No | skillライフサイクルスコープのhooks |

#### トリガー方法
- **自動**: Claudeがdescriptionに基づき自動でロード・実行
- **手動**: `/skill-name` でユーザーが直接呼び出し
- `disable-model-invocation: true`: 手動のみ（deploy等の副作用あるタスク向き）
- `user-invocable: false`: Claude自動のみ（背景知識向き）

#### 文字列置換
- `$ARGUMENTS`: 呼び出し時の全引数
- `$ARGUMENTS[N]` / `$N`: N番目の引数（0ベース）
- `${CLAUDE_SESSION_ID}`: セッションID
- `` !`command` ``: シェルコマンドの前処理実行（結果がプロンプトに挿入）

#### 重要な制約
- skillのdescriptionがコンテキストに読み込まれる（数が多いとバジェット超過の可能性）
- バジェット: コンテキストウィンドウの2%（フォールバック: 16,000文字）、`SLASH_COMMAND_TOOL_CHAR_BUDGET` で上書き可
- `SKILL.md` は500行以下を推奨（詳細はサポートファイルへ）
- `context: fork` は明示的タスク指示があるskillでのみ意味がある（ガイドラインのみのskillには不適切）
- ネストされた `.claude/skills/` は自動検出される（モノレポ対応）

#### ベストプラクティス
- 参照コンテンツ（規約・パターン）とタスクコンテンツ（デプロイ手順等）を区別する
- 副作用のあるskillは `disable-model-invocation: true` にする
- サポートファイルを活用してSKILL.mdをコンパクトに保つ
- `context: fork` + `agent: Explore` でリサーチ系skillを隔離実行

---

### 3. Hooks

#### 概要
- ユーザー定義のシェルコマンドまたはLLMプロンプトで、Claude Codeのライフサイクルの特定ポイントで自動実行される
- 3種類: `command`（シェル）、`prompt`（LLM単発評価）、`agent`（ツール付きsubagent）

#### 設定場所
| 場所 | スコープ |
|---|---|
| `~/.claude/settings.json` | 全プロジェクト |
| `.claude/settings.json` | プロジェクト（リポジトリにコミット可） |
| `.claude/settings.local.json` | プロジェクト（gitignored） |
| Managed policy | 組織全体 |
| Plugin `hooks/hooks.json` | Plugin有効時 |
| Skill/Agent frontmatter | コンポーネントアクティブ時 |

#### Hook Events一覧
| Event | 発火タイミング | ブロック可? |
|---|---|---|
| `SessionStart` | セッション開始/再開時 | No |
| `UserPromptSubmit` | ユーザープロンプト送信時 | Yes |
| `PreToolUse` | ツール実行前 | Yes (allow/deny/ask) |
| `PermissionRequest` | 権限ダイアログ表示時 | Yes |
| `PostToolUse` | ツール成功後 | No（フィードバック可） |
| `PostToolUseFailure` | ツール失敗後 | No |
| `Notification` | 通知送信時 | No |
| `SubagentStart` | subagent起動時 | No |
| `SubagentStop` | subagent完了時 | Yes |
| `Stop` | Claude応答完了時 | Yes |
| `TeammateIdle` | チームメイトidle時 | Yes |
| `TaskCompleted` | タスク完了マーク時 | Yes |
| `PreCompact` | コンテキスト圧縮前 | No |
| `SessionEnd` | セッション終了時 | No |

#### ガードレールの実現方法
- **PreToolUse**: ツール実行前にバリデーション（例: `rm -rf` ブロック、READ ONLYクエリ制限）
  - `permissionDecision`: `allow`（パーミッション迂回）、`deny`（ブロック）、`ask`（ユーザーに確認）
  - `updatedInput`: ツール入力を実行前に書き換え可能
- **PostToolUse**: ファイル編集後にlint実行等
- **Stop**: タスク完了前の品質チェック（テスト通過確認等）
- **UserPromptSubmit**: プロンプトフィルタリング
- **PermissionRequest**: 自動承認/拒否

#### Exit Code
- `0`: 成功（stdoutからJSON読み取り）
- `2`: ブロックエラー（stderrがClaudeにフィードバック）
- その他: 非ブロックエラー

#### 重要な制約
- hooksはセッション開始時にスナップショットされる（セッション中の外部変更は即反映されない）
- `disableAllHooks: true` で全hook一時無効化可能（個別無効化は不可）
- async hookはブロック不可（アクション完了後に結果配信）
- prompt/agent hookは `TeammateIdle` イベント非対応
- `allowManagedHooksOnly`（Enterprise設定）でユーザー/プロジェクト/Plugin hookをブロック可能
- シェルプロファイルの出力がJSON解析を妨げる可能性あり

#### ベストプラクティス
- 入力を検証・サニタイズする
- シェル変数は常にクォートする（`"$VAR"`）
- パストラバーサルをチェックする
- 絶対パスを使用する（`$CLAUDE_PROJECT_DIR` 活用）
- `.env` や `.git/` 等の機密ファイルを避ける

---

### 4. CLAUDE.md (Memory)

#### ファイル種類と場所
| タイプ | 場所 | 共有範囲 |
|---|---|---|
| Managed policy | `/Library/Application Support/ClaudeCode/CLAUDE.md`（macOS） | 組織全体 |
| Project memory | `./CLAUDE.md` or `./.claude/CLAUDE.md` | チーム（VCS経由） |
| Project rules | `./.claude/rules/*.md` | チーム（VCS経由） |
| User memory | `~/.claude/CLAUDE.md` | 自分（全プロジェクト） |
| Project local | `./CLAUDE.local.md` | 自分（現プロジェクト） |
| Auto memory | `~/.claude/projects/<project>/memory/` | 自分（プロジェクト別） |

#### プロジェクト全体 vs ディレクトリごと
- カレントディレクトリからルートまで再帰的にCLAUDE.mdを探索・読み込み
- 子ディレクトリの `.claude/skills/` は自動検出（モノレポ対応）
- サブディレクトリのCLAUDE.mdはそのディレクトリのファイルを読んだ時にオンデマンドロード
- より具体的な指示が優先される

#### .claude/rules/ ディレクトリ
- 複数のトピック別ルールファイルを配置可能
- `paths` フロントマター（YAMLフロントマター）でファイルパターンにスコープ可能
  ```yaml
  ---
  paths:
    - "src/api/**/*.ts"
  ---
  ```
- globパターン対応、ブレース展開対応（`*.{ts,tsx}`）
- サブディレクトリの再帰検出、シンボリックリンク対応
- `~/.claude/rules/` でユーザーレベルルールも可能

#### Import機能
- `@path/to/import` 構文で他ファイルをインポート可能
- 相対パスはインポート元ファイルからの相対
- 再帰インポート可能（最大深度5）
- コードスパン/コードブロック内では評価されない
- 初回は承認ダイアログが表示される

#### Auto Memory
- Claudeが自動で学習内容を保存する機能
- `~/.claude/projects/<project>/memory/` に保存
- `MEMORY.md` の最初の200行のみがセッション開始時にロードされる
- トピックファイルはオンデマンド読み取り
- `CLAUDE_CODE_DISABLE_AUTO_MEMORY=0` で強制有効化、`=1` で無効化

#### ベストプラクティス
- 具体的に書く（「2スペースインデント使用」 > 「コードを適切にフォーマット」）
- 構造化する（箇条書き + 説明的な見出し）
- 定期的にレビューしてプロジェクトの進化に合わせて更新する
- よく使うコマンド（build, test, lint）を記載して繰り返しの検索を避ける
- コードスタイルと命名規則を文書化する
- `/init` でCLAUDE.mdをブートストラップ可能
- `CLAUDE.local.md` は自動でgitignoreに追加される（個人設定に最適）

---

## 本プロジェクトへの示唆

### 現在の構成との対応
- 現在 `.claude/agents/` でロール別agentファイルを使用中 → 公式Sub-agent仕様と合致
- `.claude/skills/` にblog-article-writingスキル等がある → 公式Skills仕様と合致

### 活用可能性が高い機能
1. **Sub-agentの `memory` フィールド**: reviewer等に永続メモリを持たせ、過去のレビュー知見を蓄積可能
2. **Hooksによるガードレール**: PreToolUseでconstitution.md違反チェック、PostToolUseでフォーマットチェック等
3. **Sub-agentの `skills` フィールド**: builderにblog-article-writing skillを事前ロード可能
4. **`.claude/rules/`**: ディレクトリ別ルール（例: `src/` 配下のコーディング規約、`content/` 配下の記事ルール）
5. **Sub-agentの `maxTurns`**: エージェントの暴走防止

## 確信度

高: 公式ドキュメントからの直接引用に基づく。2026年2月時点の最新ドキュメント。

## 未知の事項

- Agent Teams機能（別ページ、今回未調査）の詳細
- Plugins機能の詳細な仕様
- 各機能のバージョン依存性（Claude Code本体のバージョンによる利用可否）
- `--agent` フラグで起動する場合のsub-agent挙動の詳細
