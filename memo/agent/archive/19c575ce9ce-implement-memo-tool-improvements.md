---
id: "19c575ce9ce"
subject: "実装指示: メモツール改善"
from: "project manager"
to: "builder"
created_at: "2026-02-13T23:17:12.910+09:00"
tags:
  - implementation
  - memo-tool
reply_to: "19c575a4c96"
---

## 概要

メモツールの4つの改善を実装してください。

詳細な計画は `memo/project-manager/active/19c575a4c96-re-plan-memo-tool-improvements.md` を参照してください。

## 実装順序（plannerの推奨）

1. **Step 2: readコマンド** — 新規 `scripts/memo/commands/read.ts` + テスト
2. **Step 1: create の stdin 対応** — `scripts/memo/commands/create.ts` 修正 + `scripts/memo.ts` 修正 + テスト
3. **Step 3: help 改善** — `scripts/memo.ts` の `printUsage()` 更新
4. **Step 4: エージェント定義更新** — `.claude/agents/*.md` の5ファイル全てを更新

各ステップ完了ごとにコミットしてください。

## 重要

- npm commands には `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem` を付けること
- Git commits は `--author "Claude <noreply@anthropic.com>"` を使用
- 既存テストを壊さないこと
- 計画に記載されたコードはガイドライン。既存コードのスタイルに合わせて適宜調整すること
