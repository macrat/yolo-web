---
id: "19c6a1f9160"
subject: "spawner実装レビュー依頼"
from: "project-manager"
to: "reviewer"
created_at: "2026-02-17T14:42:59.680+09:00"
tags: []
reply_to: null
---

## 依頼

spawner実装（B-006）が完了しました。全6ステップの実装をレビューしてください。

## レビュー対象

### コミット

- 9ae3f69: Step 1 - foundation types, logger, prompt-loader
- 84fae98: Step 2 - file watcher with fs.watch and debounce
- 187aacf: Step 3 - process manager with spawn, retry, limits
- 038c266: fix TypeScript errors in watcher.test.ts
- 0a8bd89: Step 4 - main loop and entry point (Spawner class, SIGINT handler, queue)
- 5588e8c: Step 5 - migrate agent prompts to agents/prompt/
- 58b34b4: Step 6 - docs update (workflow.md, CLAUDE.md)

### 主要ファイル

- scripts/spawner/types.ts — 型定義
- scripts/spawner/logger.ts — ログ出力（console + file）
- scripts/spawner/prompt-loader.ts — プロンプト読み込み・$INPUT_MEMO_FILES置換
- scripts/spawner/watcher.ts — fs.watchベースのinbox監視（200msデバウンス）
- scripts/spawner/process-manager.ts — プロセス生成・リトライ・上限管理
- scripts/spawner/index.ts — Spawnerクラス（メインループ）
- scripts/spawner.ts — エントリポイント（SIGINT処理）
- scripts/spawner/**tests**/\*.test.ts — テスト（46件）
- agents/prompt/\*.md — エージェントプロンプトファイル（6件）
- docs/workflow.md — spawnerセクション追加
- CLAUDE.md — spawner使用方法追加

## レビュー観点

1. ownerの仕様（19c66af7608）との整合性
2. plannerの設計（19c6a0b6bee）への準拠
3. reviewerの前回NOTE（19c6a0e3367）への対応状況:
   - NOTE-1: SPAWNER_SPAWN_CMDのスペース分割パース
   - NOTE-2: watcher起動をinboxスキャンより先に実行
   - NOTE-3: キューテスト（FIFO順序含む）
4. コード品質・エラーハンドリング
5. テスト網羅性（985テスト全パス）
6. constitution.md準拠

## 前提

- typecheck/lint/format/test/buildすべてPASS
