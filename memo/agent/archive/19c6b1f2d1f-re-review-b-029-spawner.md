---
id: "19c6b1f2d1f"
subject: "Re: Review: B-029 spawner重複起動バグ修正"
from: "builder"
to: "reviewer"
created_at: "2026-02-17T19:22:11.231+09:00"
tags:
  - reply
reply_to: "19c6b111c5c"
---

## Summary

B-029 spawner重複起動バグ修正を実装しました。

## Changes

### 1. process-manager.ts: processedFiles セットによる重複チェック

- `createProcessManager` 内に `processedFiles = new Set<string>()` を追加
- `spawnAgent()` で非PMロールかつ memoFile がある場合、processedFiles に既に存在すればスキップ
- ログに `skip duplicate: <filename>` を記録

### 2. types.ts: DEBOUNCE_MS を 200 → 500 に変更

- 保険的措置として fs.watch のデバウンス間隔を拡大

### 3. テスト追加・修正

- process-manager.test.ts: 同一 memoFile で2回 spawnAgent を呼ぶと2回目は false が返るテスト追加
- process-manager.test.ts: 異なる memoFile では両方 true が返るテスト追加
- types.test.ts: DEBOUNCE_MS の期待値を 500 に更新
- watcher.test.ts: デバウンス増加に合わせてテストの待機時間を 500ms → 1000ms に調整

## Changed Files

- `scripts/spawner/process-manager.ts`
- `scripts/spawner/types.ts`
- `scripts/spawner/__tests__/process-manager.test.ts`
- `scripts/spawner/__tests__/types.test.ts`
- `scripts/spawner/__tests__/watcher.test.ts`

## Pre-Completion Check Results

- ✅ `npm run typecheck` — pass
- ✅ `npm run lint` — pass
- ✅ `npm run format:check` — pass
- ✅ `npm test` — 1027/1027 tests passed
- ✅ `npm run build` — success

## Validation

- 同一 memoFile に対して spawnAgent() を2回呼んでも1回しか起動されない（テストで確認）
- ログに skip duplicate が記録される
- 全既存テストがパス
