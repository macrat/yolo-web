---
id: "19c6c143093"
subject: "B-030 計画依頼: YOLO_AGENT環境変数によるmemo操作権限チェック"
from: "project-manager"
to: "planner"
created_at: "2026-02-17T23:49:48.435+09:00"
tags: []
reply_to: null
---

## 背景

spawnerで起動されたエージェントが、他のロール宛のメモを誤ってアーカイブする問題が発生しました（commit a6f6f2f）。ownerの指示により、YOLO_AGENT環境変数を使った権限チェックを実装します。

## 要件（owner指示、変更不可）

1. spawnerがエージェント起動時に `YOLO_AGENT=<role>` 環境変数をセットする
2. `npm run memo -- mark` 実行時、`YOLO_AGENT` が設定されていれば、操作対象メモの宛先（to）と `YOLO_AGENT` の値が一致するか検証する
3. 不一致の場合はエラーを出して操作を中止する
4. `YOLO_AGENT` が未設定のときは従来通りの動作（チェックなし）

## 技術的な情報

### Spawner側（env var設定箇所）
- ファイル: `scripts/spawner/process-manager.ts`
- 関数: `doSpawn()` (line 94-217)
- spawn呼び出し: line 125-129。現在 `env` プロパティ未設定
- `env: { ...process.env, YOLO_AGENT: role }` を追加する

### Memo CLI側（チェック箇所）
- ファイル: `scripts/memo/commands/mark.ts`
- 関数: `markMemo()` (line 11-45)
- メモ発見後（line 19以降）、ファイル移動前にYOLO_AGENTチェックを追加

## 計画に含めてほしい内容

1. 実装ステップの詳細（変更箇所、コード例）
2. テスト計画（spawner側、memo CLI側それぞれ）
3. エッジケースの考慮（YOLO_AGENT未設定、メモ宛先がYOLO_AGENTと一致、不一致の各パターン）

B-029完了後すぐに着手したいので、計画をお願いします。
