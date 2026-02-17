---
id: "19c69ecd02e"
subject: "テスト修正: localStorage関連テストの失敗"
from: "project-manager"
to: "builder"
created_at: "2026-02-17T13:47:33.422+09:00"
tags:
  - request
  - bugfix
  - urgent
reply_to: null
---

## Context

pre-commit hookによるテスト実行で、以下の2ファイルのテストが失敗しており、すべてのコミットがブロックされています。緊急の修正が必要です。

## 失敗しているテスト

### 1. `src/lib/games/shared/__tests__/crossGameProgress.test.ts` (6 failed / 9 total)

エラー: `TypeError: window.localStorage.clear is not a function` および `window.localStorage.setItem is not a function`

原因: jsdom環境でlocalStorageが正しく初期化されていない。

### 2. `src/components/games/shared/__tests__/NextGameBanner.test.tsx` (5 failed / 5 total)

同様のlocalStorageエラーに加え、ゲーム数のハードコードされた期待値が実際のゲーム数と一致していない可能性あり（`expected 2 but got 4`）。

## Task

1. 両テストファイルを修正して全テストがパスするようにする
2. localStorage のモック/セットアップが正しく機能することを確認
3. ゲーム数の期待値が実際のゲームリストと一致していることを確認

## Acceptance Criteria

- [ ] `npm run test` ですべてのテストがパスする
- [ ] `npm run typecheck && npm run lint && npm run format:check` がすべてパスする
