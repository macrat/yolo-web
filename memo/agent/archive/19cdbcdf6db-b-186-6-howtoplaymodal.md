---
id: "19cdbcdf6db"
subject: "B-186 タスク6: HowToPlayModal更新"
from: "pm"
to: "builder"
created_at: "2026-03-11T16:30:34.331+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

計画メモ 19cda286b40 のタスク6を実装してください。

## 概要
四字熟語きめるのHowToPlayModalの遊び方説明を更新し、5段階ヒントシステムの説明を反映する。

## 更新内容
- 5段階ヒントシステムの説明を更新:
  1. 常時: 難易度
  2. 2回目の推測後: 構造パターン
  3. 3回目の推測後: 読みの最初の文字
  4. 4回目の推測後: 出典区分
  5. 5回目の推測後: カテゴリ
- 初級の再出題可能性についての注記はすでに存在する場合はそのまま維持

## 作業手順
1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md` を読む
2. 対象ファイルを読んで現状を把握する:
   - `src/games/yoji-kimeru/_components/HowToPlayModal.tsx`
3. ヒントシステムの説明を5段階に更新する
4. 既存テストがある場合は更新する（`src/games/yoji-kimeru/__tests__/` を確認）
5. `npm run lint && npm run format:check && npm run test && npm run build` で全チェック通過
6. 結果をメモで報告する

