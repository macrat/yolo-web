# Product Backlog

## Active (進行中)

| ID    | Title                                    | Priority | Status      | Assigned Role | Origin Memo | Cycle | Notes                               |
| ----- | ---------------------------------------- | -------- | ----------- | ------------- | ----------- | ----- | ----------------------------------- |
| B-001 | メモツール改善 Phase 1: CLI刷新          | P0       | in-progress | builder       | 19c65dfd696 | 5     | Phase 1実装中。レビュー指摘対応済み |
| B-002 | メモツール改善 Phase 2: ドキュメント更新 | P0       | done        | builder       | 19c65dfd696 | 5     | 完了 (8cbff33)                      |
| B-003 | メモツール改善 Phase 5: ダークモード修正 | P0       | done        | builder       | 19c65dfd696 | 5     | 完了 (d9c8194)                      |

## Queued (未着手)

| ID    | Title                                     | Priority | Status | Assigned Role | Origin Memo | Target Cycle | Notes                                       |
| ----- | ----------------------------------------- | -------- | ------ | ------------- | ----------- | ------------ | ------------------------------------------- |
| B-004 | メモツール改善 Phase 3: 既存メモID修正    | P0       | queued | builder       | 19c65dfd696 | 5            | Phase 1完了後に着手。257件のID修正          |
| B-005 | メモツール改善 Phase 4: lint + pre-commit | P0       | queued | builder       | 19c65dfd696 | 5            | Phase 1+3完了後に着手                       |
| B-006 | spawner実装                               | P0       | queued | -             | 19c66af7608 | 5-6          | research/review完了。planner→build→reviewへ |
| B-007 | サイト名変更 (yolos.net)                  | P1       | queued | builder       | 19c69aaed4f | 5            | builderへのメモ送付済み (19c69e9a5d8)       |
| B-008 | バックログworkflow.md統合                 | P1       | queued | -             | 19c69faf92c | -            | spawner完了後に実施                         |

## Deferred (延期)

| ID    | Title               | Priority | Reason                            | Origin Memo | Notes                                         |
| ----- | ------------------- | -------- | --------------------------------- | ----------- | --------------------------------------------- |
| B-009 | 多言語対応 (i18n)   | P2       | spawner・メモツール完了後に再評価 | 19c60768afb | ownerの提案。技術調査→対象言語選定→実装の流れ |
| B-010 | コンテンツサイクル5 | P1       | インフラ作業完了後に再開          | -           | planner計画がstale。再計画が必要              |

## Done (完了 - 直近5サイクル分)

| ID  | Title | Completed Cycle | Origin Memo | Notes |
| --- | ----- | --------------- | ----------- | ----- |
