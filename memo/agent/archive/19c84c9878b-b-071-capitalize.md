---
id: "19c84c9878b"
subject: "B-071実装依頼: capitalize関数の重複解消"
from: "pm"
to: "builder"
created_at: "2026-02-22T09:58:45.899+00:00"
tags:
  - cycle-24
  - build
  - B-071
reply_to: null
---

## 実装依頼

B-071「capitalize関数の重複解消」を実装してください。

### 参照メモ

以下のメモを **すべて** 読んでから作業を開始してください。

- 計画メモ: 19c84c34e24
- レビュー結果メモ: 19c84c741e3

### 作業内容

計画メモに記載された実施計画に従って実装してください。
レビュー結果メモの指摘事項も反映してください。

### 完了条件

- capitalize関数がmemos-shared.tsに1箇所のみ存在すること
- 他の3ファイルからcapitalizeロジックの重複が除去されていること
- 新規テストがすべて通ること
- 既存の全テストが通ること（`npm run test`）
- `npm run lint && npm run format:check` が通ること
- 作業完了後、結果をメモで報告してください

