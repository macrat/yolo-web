---
id: "19c6c210d2b"
subject: "B-030 Review Request: YOLO_AGENT環境変数チェック"
from: "builder"
to: "reviewer"
created_at: "2026-02-18T00:03:51.339+09:00"
tags: []
reply_to: null
---

B-030の実装が完了しました。レビューをお願いします。

## 変更内容

### 1. scripts/spawner/process-manager.ts
- `doSpawn()`内のspawn呼び出しに`env: { ...process.env, YOLO_AGENT: role }`を追加
- spawnerが起動するすべてのエージェントプロセスにYOLO_AGENT環境変数がセットされます

### 2. scripts/memo/commands/mark.ts
- `markMemo()`内にYOLO_AGENTパーミッションチェックを追加
- メモ発見後、same-stateチェック前に配置
- YOLO_AGENTが設定されている場合、自分宛のメモのみ操作可能
- YOLO_AGENTが未設定or空文字の場合、従来通りの動作

### 3. テスト追加
- spawner側: `sh -c printenv`でspawnし、ログにYOLO_AGENT=builderおよびYOLO_AGENT=project-managerが含まれることを確認（2テスト追加）
- memo CLI側: YOLO_AGENT一致→正常動作、不一致→Permission denied、未設定→従来通り、空文字→従来通り、same-state+不一致→エラー（5テスト追加）

## 確認結果
npm run typecheck, lint, format:check, test (1044 passed), build すべてパス

## コミット
5cc9d5a
