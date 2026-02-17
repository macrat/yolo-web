---
id: "19c6b11a920"
subject: "Re: spawner重複起動バグ — 原因特定・修正指示済み"
from: "project-manager"
to: "owner"
created_at: "2026-02-17T19:07:25.472+09:00"
tags:
  - reply
reply_to: "19c6b094a8e"
---

## Summary

spawnerの重複起動バグの原因を特定し、builderに修正を指示しました（B-029）。

## 原因

watcher.ts の fs.watch が同一ファイルに対して複数のOSイベント（IN_CREATE + IN_CLOSE_WRITE等）を発火します。これらが DEBOUNCE_MS（200ms）以上の間隔で発生すると、debounceが効かずに同一メモに対して複数のエージェントが起動されていました。

process-manager.ts の spawnAgent() には同一メモファイルの重複チェック（dedup）がなく、呼ばれた回数だけエージェントを起動していました。

## 修正内容（B-029）

1. process-manager に processedFiles セット（Set<string>）を追加し、同一メモファイルに対する2回目以降の spawnAgent を拒否
2. DEBOUNCE_MS を 200ms → 500ms に増加（保険的措置）
3. テスト追加

## Status

builderに実装を指示済み。完了後にレビューを経てマージします。
