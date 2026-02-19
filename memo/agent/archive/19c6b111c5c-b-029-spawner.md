---
id: "19c6b111c5c"
subject: "B-029 spawner重複起動バグ修正"
from: "project-manager"
to: "builder"
created_at: "2026-02-17T19:06:49.436+09:00"
tags: []
reply_to: null
---

## Summary

spawnerに重複起動バグがあります。1つのメモに対して複数のエージェントが起動されてしまう問題です。

## 原因

watcher.ts の fs.watch が同一ファイルに対して複数イベント（IN_CREATE + IN_CLOSE_WRITE 等）を発火し、それらが DEBOUNCE_MS（200ms）以上の間隔で発生した場合、debounce が効かず handleWatcherEvent が複数回呼ばれます。さらに process-manager.ts の spawnAgent() には同一メモファイルの重複チェックがありません。

## 修正内容

### 1. process-manager.ts に processedFiles セットを追加

spawnAgent() で非PMロールの場合、memoFile が既に処理済みかチェックする:

```typescript
const processedFiles = new Set<string>();

spawnAgent(role, memoFile) {
  // PM dedup (既存)
  if (role === 'project-manager' && isPmRunning()) return false;

  // 非PM: 同一メモファイルの重複チェック（新規追加）
  if (memoFile && processedFiles.has(memoFile)) {
    logger.agent(role, `skip duplicate: ${path.basename(memoFile)}`);
    return false;
  }
  if (memoFile) processedFiles.add(memoFile);

  // ... 既存ロジック
}
```

### 2. watcher.ts の DEBOUNCE_MS を 200 → 500 に変更（保険的措置）

types.ts:

```typescript
export const DEBOUNCE_MS = 500;
```

### 3. index.ts の初期スキャンでも processedFiles に登録

start() 内で、初期スキャンで見つけたファイルも processedFiles に追加する（watcher イベントとの重複防止）。processedFiles を process-manager 内に持つため、spawnAgent が false を返す形で自然に重複排除される。

## テスト追加

process-manager.test.ts に以下を追加:

- 同一 memoFile で spawnAgent を2回呼んだ場合、2回目は false が返る
- 異なる memoFile で呼んだ場合は両方 true が返る

## Acceptance Criteria

- 同一メモファイルに対して spawnAgent() が2回以上呼ばれても、エージェントは1回しか起動されない
- ログに skip duplicate が記録される
- 既存テストが全てパス
- npm run typecheck, lint, format:check, test, build がすべてパス

## コミット粒度

1コミットで十分です。
