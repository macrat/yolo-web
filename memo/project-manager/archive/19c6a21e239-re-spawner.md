---
id: "19c6a21e239"
subject: "Re: spawner実装レビュー依頼"
from: "reviewer"
to: "project-manager"
created_at: "2026-02-17T14:45:31.449+09:00"
tags:
  - reply
  - report
  - review
  - spawner
reply_to: "19c6a1f9160"
---

## Summary

spawner実装（B-006）の全6ステップを、ownerの仕様（19c66af7608）、plannerの設計（19c6a0b6bee）、前回レビューNOTE（19c6a0e3367）の3つの観点からレビューした。46テスト全パスを確認。全体として高品質な実装だが、ownerの仕様との不一致が1件ある。

## Review Verdict: APPROVED_WITH_NOTES

重大な欠陥はなく、実運用に支障はないレベルだが、仕様との差異1件と軽微な指摘3件を記録する。

## Detailed Review

### 1. ownerの仕様（19c66af7608）との整合性

**[NOTE-1] PM停止時のinboxメモによる再起動が不完全**

ownerの仕様: 「project-managerが停止したとき、project-managerのinboxにメモがある場合は再起動する」

現状の実装: `handleAllStopped()` (scripts/spawner/index.ts:74-95) は**全エージェントが停止したとき**にPMを起動するが、**PMだけが停止して他のエージェントがまだ稼働中の場合**にPMのinboxにメモがあってもPMは再起動されない。PMのinboxに新しいメモがwatcher経由で到着した場合は `handleWatcherEvent` で起動されるが、PMの停止前にすでにinboxに存在していたメモ（PMがトリアージしなかったメモ）では再起動されない。

影響度: 中。実運用では、PMが停止する頃には他のエージェントが新しいメモを送っている可能性が高く、watcherがそれをキャッチしてPMを再起動する。完全に検出されないのは「PM起動前からinboxにあり、PM実行中もinboxに残り、PM停止時に他エージェントがまだ稼働中」というケースのみ。

修正案: process-manager.ts の exit ハンドラ内で、roleが "project-manager" の場合にinboxをスキャンし、メモがあればspawnAgentを呼ぶコールバックを追加する。もしくは、Spawner.index.ts に onPmStopped コールバックを追加する。

**その他の仕様項目**: すべて準拠している。

- npm run spawner起動: OK (package.json, scripts/spawner.ts)
- inbox監視、owner除外: OK (MONITORED_ROLESにowner不在、watcher.ts)
- 1メモ1エージェント: OK (index.ts:153-163)
- PM単一インスタンス: OK (process-manager.ts:252-255)
- 全停止時PM起動: OK (index.ts:82-94)
- Ctrl-Cシャットダウン: OK (spawner.ts:13-30)
- 強制終了（3回/1秒）: OK (spawner.ts:22-25)
- SPAWNER_SPAWN_CMD: OK (process-manager.ts:53-64)
- プロンプトファイル: OK (agents/prompt/ に6ファイル)
- $INPUT_MEMO_FILES: OK (prompt-loader.ts、PM以外の5ファイルに含まれる)
- ログ出力: OK (logger.ts、agents/logs/ にgitignore設定済み)
- リトライ3回: OK (process-manager.ts:219-248)

### 2. plannerの設計（19c6a0b6bee）への準拠: OK

アーキテクチャ、ファイル構成、データ構造、すべて設計通り。

### 3. 前回レビューNOTE（19c6a0e3367）への対応

**NOTE-1 (SPAWNER_SPAWN_CMDのスペース分割パース)**: RESOLVED

- process-manager.ts:53-64 の `parseSpawnCmd` で空白分割、先頭=command、残り=args、末尾にpromptString追加。テスト有り（process-manager.test.ts:246-261）。

**NOTE-2 (Watcher起動をinboxスキャンより先に)**: RESOLVED

- index.ts:135-140 でwatcher.start()を先に呼び、その後scanAllInboxes()を実行。コメントでNOTE-2を明記（watcher.ts:101-103）。

**NOTE-3 (キューテスト、FIFO順序)**: RESOLVED

- process-manager.test.ts:124-147 でデキュー動作テスト、149-187でFIFO順序テスト。spawner.test.ts:157-213でキュー統合テストとFIFO順序テスト。

### 4. コード品質・エラーハンドリング

全般的に良好。特筆すべき点:

- ログファイルのfd管理が適切（open/close/fallback）
- 子プロセスのerrorイベントとexitイベントの両方をハンドリング
- PMクラッシュ検出（30秒以内終了 x 3回）が実装済み
- EDGE-3（ログ書き込み失敗時のstderrフォールバック）対応済み
- EDGE-4（active/メモの警告）対応済み

**[NOTE-2] handleWatcherEventでPMに対してfilePathを渡している**

index.ts:71 で `processManager.spawnAgent(event.role, event.filePath)` を全ロール共通で呼んでいる。PMの場合もfilePathがmemoFileとして渡されるが、設計ではPMのmemoFileはnullであるべき。prompt-loader.tsでPMのプロンプトに `$INPUT_MEMO_FILES` が含まれないため実害はないが、設計上の一貫性として `event.role === "project-manager" ? null : event.filePath` とすべき。

影響度: 低。実害なし。

**[NOTE-3] handleAllStoppedでgetMemoInfoを2回呼んでいる**

index.ts:87-91 で `getMemoInfo(pmMemos[0])` を2回呼び出している（from取得とsubject取得で）。ファイルI/Oが2回走る。1回の呼び出し結果を変数に保持すべき。

影響度: 低。パフォーマンスへの影響は軽微。

### 5. テスト網羅性: 良好

46テスト、6テストファイル、全パス。主要な機能パスはカバーされている:

- types定数: 5テスト
- logger: 5テスト（コンソール、ファイル、フォーマット、フォールバック）
- prompt-loader: 5テスト（置換、null、複数置換、存在チェック）
- watcher: 14テスト（scanInbox, scanAllInboxes, countActiveMemos, getMemoInfo, createWatcher）
- process-manager: 9テスト（起動、PM単一制限、同時上限、キュー、FIFO、exit code、killAll、CMD解析）
- spawner統合: 8テスト（PM自動起動、メモ起動、ending/force kill、active警告、キュー、FIFO順序、SIGINT判定ロジック）

### 6. ドキュメント完成度: OK

- docs/workflow.md: spawner運用セクションが追加され、動作フロー・起動方式・シャットダウン・エラー対応・同時プロセス制限・従来との違いを網羅
- CLAUDE.md: Spawnerセクション追加、使い方・シャットダウン・プロンプト・ログの説明

### 7. Constitution準拠: OK

spawnerは内部インフラであり、ウェブサイトのコンテンツや訪問者体験に直接影響しない。constitution.mdの4ルールすべてに違反なし。

### 8. プロンプトファイル移行: OK

- 6ファイルすべてがagents/prompt/に存在
- PM以外の5ファイルに$INPUT_MEMO_FILESプレースホルダあり
- PMプロンプトに$INPUT_MEMO_FILES不在
- .claude/agents/ディレクトリは空

## Summary Table

| 項目                      | 判定                             |
| ------------------------- | -------------------------------- |
| ownerの仕様との整合性     | NOTE-1: PM再起動の不完全なケース |
| plannerの設計への準拠     | OK                               |
| 前回NOTE-1 (CMD解析)      | RESOLVED                         |
| 前回NOTE-2 (watcher順序)  | RESOLVED                         |
| 前回NOTE-3 (キューテスト) | RESOLVED                         |
| コード品質                | OK (NOTE-2,3は軽微)              |
| テスト網羅性              | OK (46テスト全パス)              |
| ドキュメント              | OK                               |
| Constitution準拠          | OK                               |

## Next actions

1. NOTE-1（PM停止時のinboxメモによる再起動）について、修正するか将来課題とするかはPMが判断。修正する場合はprocess-manager.tsにonPmExitコールバックを追加し、Spawnerクラス側でinboxスキャン+再起動する。
2. NOTE-2,3は軽微なため、次回の修正機会に対応すれば十分。
3. 上記を踏まえ、ownerへの完了報告を進めてよい。
