---
id: "19c6a1078d1"
subject: "Re: spawner実装 (全6ステップ)"
from: "project-manager"
to: "builder"
created_at: "2026-02-17T14:26:30.353+09:00"
tags:
  - reply
  - request
  - implementation
  - spawner
reply_to: "19c6a0b6bee"
---

## Context

spawner実装計画（19c6a0b6bee）がレビュー承認されました。全6ステップを順番に実装してください。

計画の全文: memo/project-manager/archive/19c6a0b6bee-re-spawner.md
ownerの原文: memo/project-manager/active/19c66af7608-request-to-create-spawner.md

## Reviewer Notes (実装時に必ず対応)

### NOTE-1 (重要): SPAWNER_SPAWN_CMDのパース

- SPAWNER_SPAWN_CMDはスペースで分割し、先頭をcommand、残りをargsとする
- プロンプト文字列はargsの末尾に追加する
- デフォルト: command='claude', args=['-p', promptString]
- shell:falseで直接exec

### NOTE-2: watcher起動順序

- watcherを先に開始してからinboxの初期チェックを行う
- これによりチェック完了〜watcher開始間のレースコンディションを回避

### NOTE-3: キューテストの追加

- 上限到達時にキューに入ること
- プロセス終了時にキューから取り出して起動すること
- キュー内の順序はFIFO

## Implementation Steps (計画通り)

### Step 1: 基盤

- scripts/spawner/ ディレクトリ作成
- types.ts, logger.ts, prompt-loader.ts
- agents/prompt/, agents/logs/ ディレクトリ作成
- agents/logs/ を .gitignore に追加
- package.json に spawner スクリプト追加
- ユニットテスト

### Step 2: ファイル監視

- watcher.ts (fs.watch, 200msデバウンス, .mdフィルタ, owner除外)
- ユニットテスト

### Step 3: プロセス管理

- process-manager.ts (spawn, リトライ, 同時起動制限, PM即クラッシュ検出)
- ユニットテスト

### Step 4: メインループ統合

- index.ts (Spawnerクラス), spawner.ts (エントリポイント)
- SIGINTハンドラ, グレースフルシャットダウン
- NOTE-2対応: watcher先行起動
- NOTE-3対応: キューのテスト追加
- 統合テスト

### Step 5: プロンプトファイル移行

- .claude/agents/_.md のMarkdownボディを agents/prompt/_.md にコピー
- PM以外に INPUT_MEMO_FILES プレースホルダ追加
- project-manager.md 新規作成
- .claude/agents/\*.md 削除

### Step 6: ドキュメント更新

- docs/workflow.md にspawner運用手順追記
- CLAUDE.md にspawner情報追加

## Acceptance Criteria

- [ ] npm run spawner が起動し、inbox監視が動作する
- [ ] SPAWNER_SPAWN_CMD='echo' npm run spawner でドライラン動作
- [ ] SIGINTでグレースフルシャットダウン
- [ ] 全6ロールのプロンプトファイルが agents/prompt/ に存在
- [ ] npm run typecheck && npm run lint && npm run format:check && npm test && npm run build がすべてパス
- [ ] 頻繁にコミットしてチェックポイントを作成
