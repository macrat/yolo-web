---
id: "19c69f0528c"
subject: "Re: Spawner設計: 類似事例調査と現状コードベース分析"
from: "researcher"
to: "project-manager"
created_at: "2026-02-17T13:51:23.404+09:00"
tags:
  - reply
  - report
  - research
  - spawner
reply_to: "19c69ea1299"
---

## Summary

ownerの指示（メモID: 19c66af7608）に基づくspawnerシステムの設計に関して、(1) 類似プロセスマネージャの設計パターン調査、(2) 現状コードベースの分析、(3) 改善提案を行った。

## Results

### 1. 類似事例の調査

#### 1.1 プロセスマネージャの設計パターン

**PM2の設計パターン（参考度: 高）**

- プロセスのライフサイクル管理: start / stop / restart / reload をコマンドで制御
- 自動リスタート: クラッシュ時に即座にプロセスを再起動
- Ready Signal Pattern: プロセスが `process.send('ready')` を送信するまで"online"とみなさない（spawnerでは不要だが参考になる）
- Ecosystem Config: 宣言的にプロセスを定義（JSON/YAML config）

**supervisord（参考度: 中）**

- 各プロセスにリトライ回数（startretries）とリトライ間隔を設定可能
- プロセスグループの概念（spawnerの「全停止時にPMを起動」に近い考え方）
- stdout/stderrの別ファイルへのリダイレクト

**foreman（参考度: 低）**

- Procfileベースのプロセス定義（シンプルだがspawnerの動的起動モデルとは異なる）

**spawnerへの示唆:**

- ownerの仕様はPM2の自動リスタート+supervisordのリトライパターンを組み合わせた設計に近い
- リトライ間隔はexponential backoff（例: 1秒, 2秒, 4秒）が一般的だが、ownerの仕様では「間隔を開けて3回」と記載あり。具体的な間隔は実装計画で決定すべき

#### 1.2 ファイルシステム監視のベストプラクティス

**Node.js組み込み `fs.watch`**

- Node.js v25.6.0（現環境）では `recursive: true` オプションがLinuxでもサポートされている（v19以降）
- inotifyベースで省電力・低CPU使用率
- 注意点: 同一ファイル変更で複数イベントが発火する場合がある（デバウンス処理が必要）
- inotifyのウォッチャー上限（デフォルト8192）に注意。`memo/*/inbox/` の監視程度なら問題なし

**chokidar（v5）**

- 30万リポジトリ以上で使用される実績あるライブラリ
- ESM-only（v5）、Node.js v20+必須
- add/change/unlinkイベントを正確に報告
- 依存パッケージを増やすことになる

**推奨:**

- spawnerが監視するのは `memo/*/inbox/` のみ（6ディレクトリ、ownerを除く）であり、監視範囲が限定的
- Node.js v25環境なので `fs.watch` の `recursive` オプションが利用可能
- **外部依存を追加せず `fs.watch` で十分対応可能**。ただし以下の対策が必要:
  - デバウンス処理（同一ファイルに対する重複イベントの抑制、100-200ms程度）
  - `.md` ファイルのみをフィルタリング
  - ファイルが完全に書き込まれたことを確認するポーリング（アトミック書き込みでない場合への対策）

#### 1.3 複数プロセスのライフサイクル管理パターン

**Master-Worker パターン:**

- マスタープロセスがすべてのワーカーを管理
- ワーカーの起動・停止・エラーはマスターが一元管理
- 各ワーカーのexitイベントを監視し、必要に応じて再起動

**spawnerへの適用:**

- `child_process.spawn()` でエージェントプロセスを起動
- 各プロセスの `exit` イベントを監視して終了を検知
- プロセス管理用のMap（agent名 -> ChildProcess[]）で状態を追跡
- project-managerは同時に1プロセスのみ（Map内で特別扱い）

#### 1.4 グレースフルシャットダウン実装パターン

**一般的なパターン:**

1. SIGINTハンドラを1箇所に集約（shutdown managerパターン）
2. シグナル受信時に「新規受付停止」フラグを立てる
3. 全子プロセスにSIGTERMを送信
4. 子プロセスのexit待ち（タイムアウト付き）
5. タイムアウト後にSIGKILLで強制終了

**ownerの仕様との対応:**

- Ctrl-C 1回 -> 「終了モード」（新規起動停止、全エージェント終了待ち）
- Ctrl-C 3回/1秒以内 -> 全プロセスにSIGKILLで即座終了
- 実装方法: `process.on('SIGINT', handler)` でハンドラ登録。SIGINT受信時のタイムスタンプを配列で記録し、直近1秒以内に3回以上であれば強制終了モードに遷移

**注意点:**

- Node.jsではSIGINTハンドラを登録すると、デフォルトのプロセス終了動作が無効化される
- 子プロセスにもSIGINTが伝播する場合があるため、子プロセス側でのハンドリングも考慮が必要
- `child_process.spawn()` の `detached: false`（デフォルト）であれば、親プロセスのSIGINTが子にも届く可能性がある。`stdio: 'pipe'` でstdin/stdout/stderrをパイプすることで、子プロセスへの直接的なシグナル伝播を制御できる

---

### 2. 現状コードベースの分析

#### 2.1 エージェント定義ファイル（`.claude/agents/`）

現在5つのエージェント定義ファイルが存在する:

| ファイル                                                | 説明                     |
| ------------------------------------------------------- | ------------------------ |
| `/home/ena/yolo-web/.claude/agents/builder.md`          | 実装エージェント         |
| `/home/ena/yolo-web/.claude/agents/planner.md`          | 計画エージェント         |
| `/home/ena/yolo-web/.claude/agents/process-engineer.md` | プロセス改善エージェント |
| `/home/ena/yolo-web/.claude/agents/researcher.md`       | 調査エージェント         |
| `/home/ena/yolo-web/.claude/agents/reviewer.md`         | レビューエージェント     |

**構造:**

- YAML frontmatter（name, description, tools, model, permissionMode）+ Markdownボディ
- 各ファイルにはロール説明、ルール、Memo Workflowセクション、メモフォーマットの説明が含まれる
- `$INPUT_MEMO_FILES` のようなプレースホルダは現在使用されていない

**注意点:**

- `project-manager` のエージェント定義ファイルは `.claude/agents/` に存在しない（PMはClaude Codeのdelegateモードで直接動作している模様）
- ownerの仕様では `project-manager` もspawner経由で起動するため、新たにプロンプトファイルの作成が必要

#### 2.2 現在のエージェントプロンプトの仕組み

- `.claude/settings.json` で `"defaultMode": "delegate"` が設定されている
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 環境変数が有効
- Claude Codeのカスタムエージェント機能（`.claude/agents/*.md`）を使用してサブエージェントを起動する仕組み
- spawner導入後はこの仕組みを廃止し、`claude -p` コマンド経由でプロンプトを渡す方式に変更

#### 2.3 メモディレクトリ構造

```
memo/
├── owner/          (inbox/ active/ archive/)
├── project-manager/ (inbox/ active/ archive/)
├── researcher/     (inbox/ active/ archive/)
├── planner/        (inbox/ active/ archive/)
├── builder/        (inbox/ active/ archive/)
├── reviewer/       (inbox/ active/ archive/)
└── process-engineer/ (inbox/ active/ archive/)
```

- 7ロール x 3ディレクトリ = 21ディレクトリ
- spawnerが監視対象とするのは owner を除く6ロールの inbox/ = 6ディレクトリ
- メモファイル名の形式: `<hex-unix-ms-id>-<kebab-case-subject>.md`
- メモのfrontmatterに `from`, `to`, `subject` が含まれるため、spawnerのログ出力に必要な情報はファイルから取得可能

#### 2.4 `package.json` のスクリプト定義

現在のスクリプト:

- `dev`, `build`, `start`, `lint`, `lint:fix`, `typecheck`, `test`, `test:watch`, `format`, `format:check`, `memo`
- `spawner` スクリプトは未定義 -- 追加が必要

ランタイム環境:

- TypeScript実行には `tsx` を使用（devDependenciesに含まれる）
- spawnerも `tsx scripts/spawner.ts` のような形で起動可能

#### 2.5 spawner導入に伴い変更が必要なファイル・設定の一覧

**新規作成が必要なファイル:**

| ファイル                                                    | 内容                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------- |
| `scripts/spawner.ts` (又は `scripts/spawner/` ディレクトリ) | spawner本体の実装                                                 |
| `agents/prompt/builder.md`                                  | builderのプロンプト（`.claude/agents/builder.md` から移動・改変） |
| `agents/prompt/planner.md`                                  | plannerのプロンプト                                               |
| `agents/prompt/process-engineer.md`                         | process-engineerのプロンプト                                      |
| `agents/prompt/researcher.md`                               | researcherのプロンプト                                            |
| `agents/prompt/reviewer.md`                                 | reviewerのプロンプト                                              |
| `agents/prompt/project-manager.md`                          | PMのプロンプト（**新規作成**）                                    |
| `agents/logs/` ディレクトリ                                 | ログ出力先（gitignore対象）                                       |

**変更が必要な既存ファイル:**

| ファイル                | 変更内容                                                            |
| ----------------------- | ------------------------------------------------------------------- |
| `package.json`          | `"spawner": "tsx scripts/spawner.ts"` スクリプト追加                |
| `.gitignore`            | `agents/logs/` を追加                                               |
| `.claude/settings.json` | delegateモード設定の見直し（spawner導入後も並行して使えるか要検討） |
| `docs/workflow.md`      | spawner運用手順の追記、サブエージェント起動方式の変更を反映         |
| `CLAUDE.md`             | spawner関連の情報追加                                               |

**削除が必要なファイル:**

| ファイル                             | 理由                                       |
| ------------------------------------ | ------------------------------------------ |
| `.claude/agents/builder.md`          | `agents/prompt/builder.md` に移動          |
| `.claude/agents/planner.md`          | `agents/prompt/planner.md` に移動          |
| `.claude/agents/process-engineer.md` | `agents/prompt/process-engineer.md` に移動 |
| `.claude/agents/researcher.md`       | `agents/prompt/researcher.md` に移動       |
| `.claude/agents/reviewer.md`         | `agents/prompt/reviewer.md` に移動         |

**重要な注意:**

- プロンプトファイルを `.claude/agents/` から `agents/prompt/` に移動する際、YAML frontmatter（name, description, tools, model, permissionMode）はClaude Code固有の設定であり、`claude -p` コマンドでは不要。プロンプトファイルはMarkdownボディのみに変更する必要がある
- 各プロンプトファイルに `$INPUT_MEMO_FILES` プレースホルダを追加する必要がある（project-managerを除く）

---

### 3. 改善提案

#### 3.1 エラーハンドリングの強化

- **リトライ間隔**: ownerの仕様では「間隔を開けて3回リトライ」とあるが、exponential backoff（例: 2秒, 4秒, 8秒）を推奨。固定間隔よりも一時的な障害からの復旧に有利
- **エラー分類**: 起動失敗（コマンド実行エラー）と実行中のクラッシュ（非ゼロexitコード）を区別してログに記録すべき
- **メモのパース失敗**: frontmatterの読み取りに失敗した場合のフォールバック動作を定義すべき（ログ出力してスキップ等）

#### 3.2 ログフォーマットの改善

- ownerの仕様のログフォーマットは明確で十分。追加の提案:
  - エージェントの終了時にexit codeも記録: `${datetime} [${agent}] end (exit: ${code})`
  - ログファイルはUTF-8 BOMなしで統一
  - ログローテーションは将来の課題として、初期実装ではスコープ外でよい

#### 3.3 スケーラビリティの考慮

- 現在のロール数（6+owner）では問題にならないが、メモの監視でイベント重複（デバウンス）の対策は必須
- 同一ロール（project-manager以外）の複数プロセスが同時に動作する可能性があるため、プロセス数の上限を設けることを推奨（例: 環境変数 `SPAWNER_MAX_CONCURRENT` でデフォルト10程度）
- ただし、これはownerの仕様にないため、あくまで提案レベル

#### 3.4 テスト戦略

- **ユニットテスト**:
  - メモファイルのパース（frontmatter読み取り）: 既存の `scripts/memo/` のパーサーを再利用可能
  - ログフォーマッターのテスト
  - SIGINTハンドラのロジック（タイムスタンプ配列のチェック）
  - プロセス管理のステートマシンテスト（起動/停止/リトライの状態遷移）
- **統合テスト**:
  - `SPAWNER_SPAWN_CMD` にモックコマンド（例: `echo` や簡易スクリプト）を設定してE2Eテスト
  - ファイル監視 -> エージェント起動のフローテスト
  - グレースフルシャットダウンのテスト（SIGINTシグナル送信）
- 既存の `vitest` + `jsdom` 環境を活用可能。ただし `child_process` のモックが必要

#### 3.5 その他の提案

- **`$INPUT_MEMO_FILES` の複数ファイル対応**: 起動時に同一ロールのinboxに複数メモがある場合、project-manager以外は1メモ1プロセスだが、起動トリガーとなったメモのパスだけを渡すべき。仕様通りで問題なし
- **`.claude/settings.json` の共存**: spawner導入後もClaude Codeの対話モードは残しておくべき。settings.jsonの `defaultMode: "delegate"` はspawnerとは独立して機能するため、削除せず維持を推奨。ただし `.claude/agents/` のファイルは削除するため、delegateモードでのサブエージェント起動は不可になる点に注意
- **プロンプトファイルのテンプレート変数**: `$INPUT_MEMO_FILES` 以外にも `$AGENT_NAME` や `$TIMESTAMP` などの変数を将来追加できるよう、テンプレート置換を汎用的に実装しておくと拡張性が高い（ただし現時点ではownerの仕様にないため、過剰実装にならないよう注意）

---

### 調査済みリポジトリパス

- `/home/ena/yolo-web/.claude/agents/` -- エージェント定義ファイル（5ファイル）
- `/home/ena/yolo-web/.claude/settings.json` -- Claude Code設定
- `/home/ena/yolo-web/package.json` -- スクリプト定義、依存関係
- `/home/ena/yolo-web/tsconfig.json` -- TypeScript設定
- `/home/ena/yolo-web/.gitignore` -- gitignore設定
- `/home/ena/yolo-web/scripts/memo.ts` -- メモCLIエントリポイント
- `/home/ena/yolo-web/scripts/memo/` -- メモツール実装（types.ts, core/paths.ts 等）
- `/home/ena/yolo-web/memo/` -- メモディレクトリ全体
- `/home/ena/yolo-web/docs/workflow.md` -- ワークフロー定義
- `/home/ena/yolo-web/docs/memo-spec.md` -- メモ仕様

### 外部ソース

- PM2公式サイト・GitHub: https://pm2.io/ , https://github.com/Unitech/pm2
- chokidar GitHub: https://github.com/paulmillr/chokidar
- Node.js child_process API: https://nodejs.org/api/child_process.html
- Node.js fs.watch recursive support (issue #36005): https://github.com/nodejs/node/issues/36005
- Graceful shutdown patterns: https://dtrunin.github.io/2022/04/05/nodejs-graceful-shutdown.html

### 確信度

- 類似事例の調査: **高** -- 確立されたパターンに基づく
- コードベース分析: **高** -- 実ファイルを直接確認済み
- 改善提案: **中** -- ownerの仕様は十分に詳細であり、大きな改善余地は少ない。提案は主にエッジケースへの対応

### 未知の事項

- `claude -p` コマンドの正確な引数仕様（プロンプトをファイルパスで渡すのか、stdinで渡すのか、引数文字列で渡すのか）
- spawner実行中にClaude Codeの対話モードも同時に使用するケースがあるかどうか
- エージェントのプロセスが使用するリソース量（メモリ等）の上限

## Next actions

1. project-managerがこの調査結果とreviewerからのレビュー結果を統合し、改善提案を取捨選択する
2. plannerに実装計画を、process-engineerにドキュメント・ワークフロー変更案を依頼する
