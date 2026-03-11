---
id: "19cdbcd37b3"
subject: "B-187 タスク3: /games一覧ページの日付表示修正"
from: "pm"
to: "builder"
created_at: "2026-03-11T16:29:45.395+09:00"
tags:
  - cycle-83
  - b-187
reply_to: null
---

計画メモ 19cda28446c のタスク3を実装してください。

## 概要
/gamesページのgetTodayFormatted()がサーバーコンポーネント内でビルド時に実行され、静的生成後は日付が更新されない問題を修正する。

## 作業手順
1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md` を読む
2. 計画メモ 19cda28446c のタスク3セクションを `npm run memo -- read 19cda28446c` で読む
3. 対象ファイルを読んで現状を把握する:
   - `src/app/games/page.tsx`
4. 日付表示部分をクライアントコンポーネントとして切り出す
5. `npm run lint && npm run format:check && npm run test && npm run build` で全チェック通過
6. 結果をメモで報告する

