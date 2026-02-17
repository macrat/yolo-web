# Product Backlog

## Active (進行中)

| ID    | Title       | Priority | Status      | Assigned Role | Origin Memo | Cycle | Notes                                        |
| ----- | ----------- | -------- | ----------- | ------------- | ----------- | ----- | -------------------------------------------- |
| B-006 | spawner実装 | P0       | in-progress | -             | 19c66af7608 | 5-6   | plan完了・review APPROVED。builder委任準備中 |

## Queued (未着手)

| ID    | Title                     | Priority | Status | Assigned Role | Origin Memo | Target Cycle | Notes                        |
| ----- | ------------------------- | -------- | ------ | ------------- | ----------- | ------------ | ---------------------------- |
| B-008 | バックログworkflow.md統合 | P1       | queued | -             | 19c69faf92c | -            | spawner完了後に実施          |
| B-011 | spawnerタイムアウト機能   | P2       | queued | -             | 19c6a0e3367 | -            | NOTE-4: ハング対策。将来課題 |
| B-012 | spawnerキュー優先順位定義 | P2       | queued | -             | 19c6a0e3367 | -            | NOTE-5: FIFO明記。将来課題   |

## Deferred (延期)

| ID    | Title               | Priority | Reason                            | Origin Memo | Notes                                         |
| ----- | ------------------- | -------- | --------------------------------- | ----------- | --------------------------------------------- |
| B-009 | 多言語対応 (i18n)   | P2       | spawner・メモツール完了後に再評価 | 19c60768afb | ownerの提案。技術調査→対象言語選定→実装の流れ |
| B-010 | コンテンツサイクル5 | P1       | インフラ作業完了後に再開          | -           | planner計画がstale。再計画が必要              |

## Done (完了 - 直近5サイクル分)

| ID    | Title                                    | Completed Cycle | Origin Memo | Notes            |
| ----- | ---------------------------------------- | --------------- | ----------- | ---------------- |
| B-001 | メモツール改善 Phase 1: CLI刷新          | 5               | 19c65dfd696 | 68cf8b9, 7be1011 |
| B-002 | メモツール改善 Phase 2: ドキュメント更新 | 5               | 19c65dfd696 | 8cbff33          |
| B-003 | メモツール改善 Phase 5: ダークモード修正 | 5               | 19c65dfd696 | d9c8194          |
| B-004 | メモツール改善 Phase 3: 既存メモID修正   | 5               | 19c65dfd696 | 273件修正完了    |
| B-005 | メモツール改善 Phase 4: lint             | 5               | 19c65dfd696 | 939テスト        |
| B-007 | サイト名変更 (yolos.net)                 | 5               | 19c69aaed4f | 30ファイル更新   |
