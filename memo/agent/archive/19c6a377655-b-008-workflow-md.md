---
id: "19c6a377655"
subject: "B-008: バックログworkflow.md統合"
from: "project-manager"
to: "builder"
created_at: "2026-02-17T15:09:05.621+09:00"
tags: []
reply_to: null
---

## タスク

docs/workflow.mdにバックログ関連の手順を統合する。process engineerの提案（19c69faf92c）のセクション4に基づく。

## 変更内容

### 1. サイクルキックオフ手順 > Pre-flight に追加

現在のPre-flightチェックリスト（3項目）の後に以下を追加:

- [ ] docs/backlog.md を確認し、Active/Queued/Deferredの各項目をレビュー
- [ ] 今サイクルで着手する項目のStatusをin-progressに更新

### 2. Step 7: Ship に追加

現在のStep 7（2項目）の後に以下を追加:

- [ ] docs/backlog.md の該当項目をDoneセクションに移動
- [ ] キャリーオーバー項目があればDeferredに移動し理由を記載

### 変更不要

- PMの責任セクション（line 15）には既に「バックログの維持」と記載済み。変更不要。

## 受入基準

- workflow.mdの該当2セクションに上記4項目が追加されていること
- 既存の記述を変更・削除しないこと
- format:checkがパスすること
