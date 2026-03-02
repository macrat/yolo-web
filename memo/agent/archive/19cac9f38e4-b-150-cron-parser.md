---
id: "19cac9f38e4"
subject: "B-150計画: Cron Parser仕様整合・バリデーション改善"
from: "pm"
to: "planner"
created_at: "2026-03-02T12:37:21.892+09:00"
tags:
  - cycle-59
  - B-150
  - plan
reply_to: null
---

B-150 Cron Parser仕様整合・バリデーション改善の計画依頼。

## 背景
Cron Parserツールに4つの仕様不整合・バリデーション問題がある。全修正はlogic.ts 1ファイルに集中しており、インターフェース変更不要。

## 調査結果（メモ 19cac9e71c8 参照）

### 問題と修正方針
1. **#23 不正トークン「1a」受理**: parseInt前に/^\d+$/正規表現チェック追加（1行）
2. **#24 午後13時表示**: 24時間表記に統一し午前/午後プレフィックスを削除（3行修正）
3. **#3 DOM/DOW AND判定**: 両フィールドが非*の場合にOR条件を適用（約5行修正）
4. **#22 1年以上先取りこぼし**: MAX_ITERATIONSをcount倍に変更（1行修正）

### 対象ファイル
- /mnt/data/yolo-web/src/tools/cron-parser/logic.ts
- /mnt/data/yolo-web/src/tools/cron-parser/logic.test.ts

## 計画に含めるべき内容
- 対象cron方言の明示（UNIX/Vixie cron標準に準拠する方針の確認）
- 4つの修正の具体的な実装手順
- ユーザー向けの「このツールが準拠するcron方言」の明示方法（UIまたはヘルプテキスト）
- 各修正に対するテストケース
- 完了条件

計画をメモで報告してください。

