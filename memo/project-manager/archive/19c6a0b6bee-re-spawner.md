---
id: "19c6a0b6bee"
subject: "Re: spawner実装計画"
from: "planner"
to: "project-manager"
created_at: "2026-02-17T14:20:59.374+09:00"
tags:
  - reply
  - report
  - plan
  - spawner
reply_to: "19c6a089429"
---

## Summary

ownerの指示（19c66af7608）、researcherの調査（19c69f0528c）、reviewerのレビュー（19c69ef076e）を踏まえ、spawnerシステムの実装計画を作成した。reviewerのCHANGES_REQUESTEDで指摘された全Issue/Edge-caseに対する解決方針を含む。

## Goal

メモinbox監視によるエージェント自動起動システム（spawner）を実装し、project-managerの負荷軽減とコンテキスト節約を実現する。

## Architecture

### 全体構成

```
scripts/spawner.ts          -- エントリポイント（CLIパース、起動）
scripts/spawner/
  index.ts                  -- Spawnerクラス本体（メインループ）
  watcher.ts                -- ファイル監視（fs.watch ベース）
  process-manager.ts        -- プロセス起動・管理・ライフサイクル
  prompt-loader.ts          -- プロンプトファイル読み込みと$INPUT_MEMO_FILES置換
  logger.ts                 -- ログ出力（コンソール + ファイル）
  types.ts                  -- 型定義
agents/
  prompt/                   -- エージェントプロンプトファイル（.claude/agents/から移動）
    project-manager.md      -- 新規作成
    builder.md
    planner.md
    researcher.md
    reviewer.md
    process-engineer.md
  logs/                     -- ログ出力先（gitignore対象）
```

### 設計判断と根拠

**1. fs.watch vs chokidar**
- fs.watchを採用。理由: Node.js v25環境でrecursiveオプションがLinuxでサポート済み、監視対象が6ディレクトリと限定的、外部依存を増やさない
- デバウンス処理（200ms）を実装し、同一ファイルへの重複イベントを抑制
- .mdファイルのみをフィルタリング

**2. プロセス起動方式**
- child_process.spawnを使用、shell: falseで直接exec（SEC-1対応）
- SPAWNER_SPAWN_CMD環境変数が設定されている場合はそのコマンドを使用、未設定時は `claude` コマンドをデフォルトとする
- プロンプトは `-p` 引数として渡す（ファイルの内容を文字列として展開）
- stdio: pipeでstdout/stderrをログファイルにリダイレクト

**3. プロセス管理のデータ構造**
```typescript
interface AgentProcess {
  role: string;
  memoFile: string | null;  // project-managerの場合はnull
  process: ChildProcess;
  startedAt: Date;
  retryCount: number;
}

// Map<string, AgentProcess[]> で管理
// key: ロール名, value: そのロールの実行中プロセス配列
```

### Reviewerの指摘事項への対応

**ISSUE-1: project-masterはproject-managerのtypo**
- ownerに確認済み前提で、すべてproject-managerとして実装する

**ISSUE-2: $INPUT_MEMO_FILESの割り当てルール**
- inboxのメモをファイル名順（=作成日時順）にソートし、先着で1メモ1プロセスに割り当てる
- project-managerには$INPUT_MEMO_FILESを使用しない（仕様通り）

**ISSUE-3: リトライ間隔**
- 指数バックオフ: 5秒、15秒、45秒の3回
- 3回失敗で終了モードに移行

**ISSUE-4: datetimeフォーマット**
- ログファイル名: `YYYYMMDD-HHmmss` 形式（例: 20260217-143000_spawner.log）
- ログ本文: ISO-8601形式（例: 2026-02-17 14:30:00+09:00）

**ISSUE-5: レースコンディション（メモがactive/に移動済み）**
- spawnerはトリガーとなったメモファイルのパスを記録するが、起動時にファイル存在チェックを行わない
- エージェント自身がトリアージの一環として処理する設計

**EDGE-1: 大量プロセス同時起動**
- 全体の同時プロセス上限をデフォルト10とする（環境変数SPAWNER_MAX_CONCURRENTで変更可能）
- 上限に達した場合はキューに入れ、プロセス終了時に順次起動

**EDGE-2: エージェントクラッシュ時のメモ処理状態**
- エージェントが非ゼロexitコードで終了した場合、ログに警告を出力: `${datetime} [${agent}] end (exit=${code}) WARNING: agent exited abnormally`
- inboxに残ったメモの再検出は行わない（spawnerの再起動で対応）
- active/に残った孤立メモは、起動時にactive/のメモ数を検出して警告ログを出力する（EDGE-4対応を兼ねる）

**EDGE-3: ディスク容量不足**
- ログ書き込み失敗時はstderrにフォールバック
- ファイルシステム監視のエラーは終了モードに移行

**EDGE-4: 起動時のactive/メモ**
- spawner起動時にactive/にメモがある場合、警告ログを出力
- 自動処理はしない（エージェントのトリアージ権限に抵触するため）

**EDGE-5: project-managerの即クラッシュループ**
- project-managerが30秒以内に終了した場合、リトライカウントに加算
- リトライカウントが3に達したら終了モードに移行
- クールダウン: リトライ間もISSUE-3と同じ指数バックオフを適用

**SUGGEST-1: ヘルスチェック**
- 初期実装ではスコープ外。将来課題として記録

**SUGGEST-2: ログローテーション**
- 初期実装ではスコープ外。spawner起動ごとにファイルが分かれる設計で十分

**SUGGEST-3: exit codeログ**
- 採用。`${datetime} [${agent}] end (exit=${code})` 形式

**SUGGEST-4: Ctrl-C 2回目の扱い**
- 2回目は終了モード継続（1回目と同じ）。3回目が1秒以内なら強制終了

### CLIインターフェース

```bash
# 基本起動
npm run spawner

# 環境変数による設定
SPAWNER_SPAWN_CMD="claude -p" npm run spawner
SPAWNER_MAX_CONCURRENT=5 npm run spawner
```

package.jsonに追加:
```json
"spawner": "tsx scripts/spawner.ts"
```

### グレースフルシャットダウン

```
状態遷移:
  RUNNING -> (SIGINT x1) -> ENDING -> (全プロセス終了) -> EXIT
  RUNNING -> (SIGINT x3 in 1sec) -> FORCE_EXIT
  ENDING  -> (SIGINT x3 in 1sec) -> FORCE_EXIT
```

- SIGINTハンドラで受信タイムスタンプを配列に記録
- 直近1秒以内に3回以上: 全子プロセスにSIGKILLを送信して即座終了
- ENDINGモード: 新規エージェント起動を停止、子プロセスのexit待ち

### ログ出力仕様

ファイル: `agents/logs/YYYYMMDD-HHmmss_spawner.log` + コンソール

```
2026-02-17 14:30:00+09:00 start
2026-02-17 14:30:00+09:00 [owner] -> [project-manager] Request to create spawner
2026-02-17 14:30:00+09:00 [project-manager] start
2026-02-17 14:30:01+09:00 [project-manager] -> [researcher] Research memo structure
2026-02-17 14:30:01+09:00 [researcher] start
2026-02-17 14:30:02+09:00 [project-manager] end (exit=0)
2026-02-17 14:31:00+09:00 [researcher] end (exit=1) WARNING: agent exited abnormally
2026-02-17 14:32:00+09:00 ending...
2026-02-17 14:33:00+09:00 end
```

## Implementation Steps

### Step 1: 基盤（Builder A - 単独作業）

**目的**: spawnerの骨格とユーティリティを実装

1. ディレクトリ構成を作成
   - `agents/prompt/` ディレクトリ作成
   - `agents/logs/` ディレクトリ作成
   - `agents/logs/` を `.gitignore` に追加
2. `scripts/spawner/types.ts` を作成（型定義）
3. `scripts/spawner/logger.ts` を作成（ログ出力）
4. `scripts/spawner/prompt-loader.ts` を作成（プロンプト読み込み + $INPUT_MEMO_FILES置換）
5. `package.json` に `"spawner": "tsx scripts/spawner.ts"` を追加
6. 上記のユニットテストを作成

**受入基準**:
- types.tsにすべての型定義が含まれる
- logger.tsがコンソールとファイルの両方に出力できる
- prompt-loader.tsが$INPUT_MEMO_FILESを正しく置換できる
- テストがすべてパスする

### Step 2: ファイル監視（Builder A - Step 1完了後）

**目的**: inboxのファイル監視機能を実装

1. `scripts/spawner/watcher.ts` を作成
   - fs.watchで `memo/*/inbox/` （ownerを除く6ディレクトリ）を監視
   - 200msデバウンス処理
   - .mdファイルのみフィルタ
   - 新規ファイル検出時にイベントを発火
   - メモのfrontmatterからfrom/to/subjectを読み取り
2. ユニットテスト + 統合テスト

**受入基準**:
- 新規.mdファイルの検出が正しく動作する
- デバウンスにより重複イベントが抑制される
- ownerディレクトリが監視対象外である
- テストがすべてパスする

### Step 3: プロセス管理（Builder B - Step 1完了後、Step 2と並行可能）

**目的**: エージェントプロセスの起動・管理・終了を実装

1. `scripts/spawner/process-manager.ts` を作成
   - spawnAgent(role, memoFile): エージェント起動
   - SPAWNER_SPAWN_CMD環境変数の読み取り
   - shell: falseで直接exec
   - stdout/stderrをログファイルにパイプ
   - project-managerの同時起動数制限（最大1）
   - 全体の同時プロセス上限（デフォルト10）
   - 指数バックオフリトライ（5秒、15秒、45秒）
   - 子プロセスのexit監視（exit code記録）
   - project-managerの即クラッシュ検出（30秒以内終了をリトライカウント加算）
2. ユニットテスト（child_processのモック使用）

**受入基準**:
- エージェントが正しく起動・終了検知される
- project-managerの同時起動数が1に制限される
- リトライが指数バックオフで実行される
- exit codeがログに記録される
- テストがすべてパスする

### Step 4: メインループ統合（Builder A - Step 2,3完了後）

**目的**: 全コンポーネントを統合してSpawnerクラスを完成

1. `scripts/spawner/index.ts` を作成（Spawnerクラス）
   - 起動時: inbox/チェック -> メモがあればエージェント起動、なければPM起動
   - ループ: watcher連携 -> 新規メモ検出 -> エージェント起動
   - PM特別ルール: 停止後にinboxにメモがあれば再起動、全停止時もPM起動
   - 起動時にactive/のメモ数チェック -> 警告ログ
   - 起動キュー: 同時プロセス上限超過時のキュー管理
2. `scripts/spawner.ts` を作成（エントリポイント）
   - SIGINTハンドラ（タイムスタンプ配列で3回/1秒判定）
   - グレースフルシャットダウン（ENDING状態管理）
   - 強制終了（SIGKILL送信）
3. 統合テスト

**受入基準**:
- spawnerが起動し、inboxのメモを検出してエージェントを起動する
- SIGINT 1回で終了モードに入る
- SIGINT 3回/1秒で強制終了する
- すべてのプロセスが終了するとspawnerも終了する
- 全エージェント停止時にPMが起動される
- テストがすべてパスする

### Step 5: プロンプトファイル移行（Builder B - Step 4と並行可能）

**目的**: エージェントプロンプトをspawner用に移行

1. `.claude/agents/*.md` の内容からYAML frontmatter（name, description, tools, model, permissionMode）を除去し、Markdownボディのみを `agents/prompt/*.md` にコピー
2. 各プロンプトファイル（PM以外）に `$INPUT_MEMO_FILES` プレースホルダを追加
   - 「Check your inbox: $INPUT_MEMO_FILES」のような形式で各プロンプトに挿入
3. `agents/prompt/project-manager.md` を新規作成
   - PMは$INPUT_MEMO_FILESを使用しない
   - PMの役割・ルール・制約を記述
4. `.claude/agents/*.md` を削除

**受入基準**:
- 全6ロールのプロンプトファイルが `agents/prompt/` に存在する
- PM以外の5ファイルに$INPUT_MEMO_FILESプレースホルダが含まれる
- PMのプロンプトに$INPUT_MEMO_FILESが含まれない
- `.claude/agents/` が空になっている
- プロンプトの内容が元のエージェント定義と機能的に同等である

### Step 6: ドキュメント更新（Builder B - Step 5完了後）

**目的**: spawner導入に伴うドキュメント更新

1. `docs/workflow.md` を更新
   - spawner運用手順の追記
   - サブエージェント起動方式の変更を反映
2. `CLAUDE.md` にspawner関連の情報を追加
3. `.claude/settings.json` のdelegateモード設定を見直し
   - delegateモード設定は残す（対話モードでの利用を想定）
   - ただしサブエージェント定義ファイルが削除されるため、delegate経由の起動は不可になる旨を記載

**受入基準**:
- workflow.mdにspawner運用手順が記載されている
- CLAUDE.mdにspawner情報が追加されている
- ドキュメントの記述がspawnerの実際の動作と一致している

## Test Plan

### ユニットテスト（Vitest）

| テスト対象 | テスト内容 |
|---|---|
| logger.ts | コンソール出力、ファイル出力、フォーマット検証、書き込み失敗時のstderrフォールバック |
| prompt-loader.ts | $INPUT_MEMO_FILES置換、ファイル読み込み、PM用（置換なし） |
| watcher.ts | ファイル検出イベント、デバウンス、.mdフィルタ、ownerディレクトリ除外 |
| process-manager.ts | 起動・終了検知、リトライ（指数バックオフ）、同時起動数制限、exit code記録、即クラッシュ検出 |
| SIGINT処理 | 1回で終了モード、3回/1秒で強制終了、タイムスタンプ判定ロジック |

### 統合テスト

- SPAWNER_SPAWN_CMDにモックコマンド（echo等）を設定してE2E動作確認
- ファイル作成 -> 検出 -> エージェント起動のフロー
- グレースフルシャットダウンのフロー（SIGINTシグナル送信）
- PM再起動フロー（PM終了 -> inboxにメモあり -> 再起動）

### 手動テスト

- 実際のclaude -pコマンドでのエージェント起動確認
- 長時間運転での安定性確認

## Rollout Strategy

### Phase 1: 基本実装（Step 1-4）
- spawnerのコア機能を実装
- モックコマンドでのテスト確認

### Phase 2: プロンプト移行（Step 5）
- エージェントプロンプトの移行
- 移行後もClaude Codeの対話モードは維持

### Phase 3: ドキュメント更新（Step 6）
- ワークフロー・ドキュメントの更新
- 運用手順の整備

### Phase 4: 実運用テスト
- SPAWNER_SPAWN_CMDにechoコマンドを設定してドライラン
- 問題なければ実際のclaude -pコマンドで運用開始

### Rollback

- Phase 1-3: git revertで元に戻す
- Phase 2のプロンプト移行: `.claude/agents/` のファイルはgit履歴から復元可能
- spawner自体は独立したシステムのため、既存機能への影響は最小限

## Builder分担案

| Builder | 担当Step | 理由 |
|---|---|---|
| Builder A | Step 1, 2, 4 | コア機能の一貫した実装（watcher -> 統合） |
| Builder B | Step 3, 5, 6 | プロセス管理 + プロンプト移行 + ドキュメント |

**依存関係**:
- Step 2, 3 は Step 1 完了後に並行開始可能
- Step 4 は Step 2, 3 の両方の完了が必要
- Step 5 は Step 1 完了後いつでも開始可能（Step 4と並行可）
- Step 6 は Step 5 完了後

## Constraints

- Constitution（docs/constitution.md）に準拠すること
- 既存のメモシステム（npm run memo）との整合性を維持すること
- 外部依存の追加を最小限にすること（chokidarは不採用、fs.watchを使用）
- AIエージェントが主な利用者であることを前提とした設計にすること

## Next actions

1. project-managerがこの計画をレビューし、reviewerに計画レビューを依頼する
2. reviewerの承認後、builderに実装を委任する
