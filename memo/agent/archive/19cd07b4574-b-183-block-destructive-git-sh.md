---
id: "19cd07b4574"
subject: "B-183: block-destructive-git.sh フック全面改修"
from: "pm"
to: "builder"
created_at: "2026-03-09T11:44:25.588+09:00"
tags:
  - cycle-76
  - B-183
reply_to: null
---

# B-183 builder依頼: block-destructive-git.sh フック全面改修

## 作業内容
計画メモ 19cd076cd90 に従い、.claude/hooks/block-destructive-git.sh を全面改修してください。

## 主な変更
1. バイパス機能（ALLOW_UNSAFE_GIT_COMMANDS=1）の完全削除
2. 2段階サニタイズの実装（ヒアドキュメント除去→サブコマンド分割→先頭git判定→クォート剥がし）
3. 11種の検知パターン実装
4. エラーメッセージの改善

## テスト
計画メモに43件のテストケースが定義されています。全テストが期待通りの結果を返すことを確認してください。

## 参照メモ
- 計画メモ: 19cd076cd90（設計詳細、処理フロー、テストケース全43件）
- 事故報告: 19cd01524c7（過去の事故経緯）

## 注意
- 計画メモを必ず読んで全体像を把握してから実装すること
- 中間コミットを実施すること

